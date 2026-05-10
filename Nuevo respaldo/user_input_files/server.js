require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Pool de conexiones a MariaDB
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});

// ── FUNCIÓN AYUDANTE: OBTENER PERIODO ACTIVO ──
async function getPeriodoActivo() {
  try {
    const [rows] = await pool.query('SELECT id FROM periodos_escolares WHERE activo = 1 LIMIT 1');
    if (rows.length > 0) return rows[0].id;
  } catch (error) {
    console.error('Error al obtener periodo activo, usando 2 por defecto', error);
  }
  return 2; 
}

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Token requerido' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Almacén temporal para el flujo de login
const loginTemporal = new Map();
setInterval(() => {
    const ahora = Date.now();
    for (const [token, data] of loginTemporal) {
        if (data.expira < ahora) loginTemporal.delete(token);
    }
}, 5 * 60 * 1000);

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================
app.post('/api/login/cedula', async (req, res) => {
    try {
        const { cedula } = req.body;
        const ci = String(cedula).trim().toUpperCase();
        if (!ci) return res.status(400).json({ ok: false, msg: 'Ingrese la cédula' });

        const [personas] = await pool.execute(
            `SELECT id, cedula, nombres, apellidos, grado_asignado, materia_especialidad FROM personal WHERE cedula = ? AND estado = 'activo'`, [ci]
        );
        if (personas.length === 0) return res.status(404).json({ ok: false, msg: 'Cédula no registrada' });

        const personaPrincipal = personas[0];
        let roles = [];
        const [rolesEspeciales] = await pool.query(
            `SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
             FROM personal_rol pr INNER JOIN roles r ON pr.rol_id = r.id INNER JOIN personal p ON pr.personal_id = p.id
             WHERE p.cedula = ? AND pr.activo = 1 AND r.codigo != 'docente'
             ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria')`, [ci]
        );
        roles = rolesEspeciales;

        const tieneAsignacion = personas.some(p => p.materia_especialidad && p.grado_asignado);
        if (tieneAsignacion) {
            roles.push({ asignacion_id: personaPrincipal.id, codigo: 'docente', nombre: 'Docente', icono: 'fa-chalkboard-user', color: '#1a3a6e', etiqueta: 'DOCENTE', ruta_dashboard: '/docente' });
        }
        if (roles.length === 0) return res.status(403).json({ ok: false, msg: 'Sin roles asignados.' });

        const token = crypto.randomBytes(32).toString('hex');
        loginTemporal.set(token, { personalId: personaPrincipal.id, cedula: personaPrincipal.cedula, nombres: personaPrincipal.nombres, apellidos: personaPrincipal.apellidos, roles, autenticado: false, expira: Date.now() + 5 * 60 * 1000 });
        res.json({ ok: true, token, nombreCompleto: `${personaPrincipal.nombres} ${personaPrincipal.apellidos}`, cantidadRoles: roles.length });
    } catch (err) { console.error(err); res.status(500).json({ ok: false, msg: 'Error del servidor' }); }
});

app.post('/api/login/contrasena', async (req, res) => {
    try {
        const { token, contrasena } = req.body;
        const temp = loginTemporal.get(token);
        if (!temp) return res.status(401).json({ ok: false, msg: 'Sesión expirada' });
        if (String(contrasena).trim().toUpperCase() !== String(temp.cedula).trim().toUpperCase()) return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta' });

        temp.autenticado = true;
        if (temp.roles.length === 1) {
            loginTemporal.delete(token);
            const sessionToken = jwt.sign({ id: temp.personalId, cedula: temp.cedula, rol: temp.roles[0] }, process.env.JWT_SECRET, { expiresIn: '8h' });
            return res.json({ ok: true, redirigir: true, rol: temp.roles[0], sessionToken });
        }
        res.json({ ok: true, redirigir: false, roles: temp.roles });
    } catch (err) { console.error(err); res.status(500).json({ ok: false, msg: 'Error' }); }
});

app.post('/api/login/rol', async (req, res) => {
    try {
        const { token, asignacionId } = req.body;
        const temp = loginTemporal.get(token);
        if (!temp || !temp.autenticado) return res.status(401).json({ ok: false, msg: 'No autorizado' });
        const rolElegido = temp.roles.find(r => r.asignacion_id === Number(asignacionId));
        if (!rolElegido) return res.status(403).json({ ok: false, msg: 'Rol no válido' });
        
        loginTemporal.delete(token);
        const sessionToken = jwt.sign({ id: temp.personalId, cedula: temp.cedula, rol: rolElegido }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ ok: true, rol: rolElegido, sessionToken });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Error' }); }
});

app.post('/api/login/cancelar', (req, res) => { if (req.body.token) loginTemporal.delete(req.body.token); res.json({ ok: true }); });

// ============================================
// RUTAS DOCENTES Y EVALUACIONES
// ============================================
app.get('/api/docente/asignaciones/:cedula', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT grado_asignado AS grado, seccion_asignada AS secciones_raw, materia_especialidad AS materia FROM personal WHERE cedula = ? AND estado = 'activo' AND materia_especialidad IS NOT NULL`, [req.params.cedula]);
        const asignaciones = [];
        for (const row of rows) {
            if (!row.secciones_raw || !row.grado) continue;
            const secciones = row.secciones_raw.split(/[, ]+/).map(s => s.trim()).filter(s => s.length > 0);
            for (const sec of secciones) asignaciones.push({ grado: row.grado, seccion: sec, materia: row.materia });
        }
        res.json(asignaciones);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/docente/evaluaciones', authMiddleware, async (req, res) => {
    const { grado_id, seccion, materia, momento, tipo } = req.query;
    try {
        const [rows] = await pool.execute(`SELECT * FROM evaluaciones WHERE grado_id = ? AND seccion = ? AND materia = ? AND momento = ? AND tipo = ? AND activa = 1 ORDER BY orden ASC`, [grado_id, seccion, materia, momento, tipo]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/docente/evaluaciones', authMiddleware, async (req, res) => {
    const { nombre, grado_id, seccion, materia, momento, tipo, puntaje_maximo, docente_cedula } = req.body;
    try {
        const periodo_id = await getPeriodoActivo(); 
        const [maxOrd] = await pool.execute(`SELECT COALESCE(MAX(orden), 0) + 1 AS next_ord FROM evaluaciones WHERE grado_id = ? AND seccion = ? AND materia = ? AND momento = ? AND tipo = ?`, [grado_id, seccion, materia, momento, tipo]);
        const orden = maxOrd[0].next_ord;
        const [result] = await pool.execute(`INSERT INTO evaluaciones (docente_cedula, grado_id, seccion, materia, momento, nombre, tipo, puntaje_maximo, orden, periodo_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [docente_cedula, grado_id, seccion, materia, momento, nombre, tipo, puntaje_maximo || 20, orden, periodo_id]);
        res.json({ id: result.insertId, nombre, puntaje_maximo: puntaje_maximo || 20 });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.delete('/api/docente/evaluaciones/:id', authMiddleware, async (req, res) => {
    try { await pool.execute('DELETE FROM notas_detalladas WHERE evaluacion_id = ?', [req.params.id]); await pool.execute('DELETE FROM evaluaciones WHERE id = ?', [req.params.id]); res.json({ success: true }); } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/docente/notas-detalladas', authMiddleware, async (req, res) => {
    const { notas } = req.body; if (!notas || notas.length === 0) return res.status(400).json({ error: 'No hay notas' });
    try { const valores = notas.map(n => [n.evaluacion_id, n.estudiante_id, n.nota_valor]); await pool.query(`INSERT INTO notas_detalladas (evaluacion_id, estudiante_id, nota_valor) VALUES ? ON DUPLICATE KEY UPDATE nota_valor = VALUES(nota_valor)`, [valores]); res.json({ success: true }); } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/docente/notas-detalladas/get', authMiddleware, async (req, res) => {
    const { evaluaciones_ids } = req.body; if (!evaluaciones_ids || evaluaciones_ids.length === 0) return res.json([]);
    try { const [rows] = await pool.execute(`SELECT evaluacion_id, estudiante_id, nota_valor FROM notas_detalladas WHERE evaluacion_id IN (?)`, [evaluaciones_ids]); res.json(rows); } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/momentos/cerrado', async (req, res) => {
    const { lapso } = req.query;
    try { const [rows] = await pool.execute(`SELECT cerrado FROM momentos_cierre WHERE lapso = ? ORDER BY id DESC LIMIT 1`, [lapso]); res.json({ cerrado: rows.length > 0 ? rows[0].cerrado === 1 : false }); } catch (error) { res.json({ cerrado: false }); }
});

// ============================================
// CONTROL DE ESTUDIOS - PLANILLA 31059 Y HISTÓRICO
// ============================================

app.get('/api/ctrl-estudios/planilla-31059', async (req, res) => {
  try {
    const { grado_id, seccion, periodo } = req.query; 
    const gradoIdNum = parseInt(grado_id);
    
    let periodo_id = await getPeriodoActivo();
    if (periodo) {
      const [perRows] = await pool.query('SELECT id FROM periodos_escolares WHERE nombre = ?', [periodo]);
      if (perRows.length > 0) periodo_id = perRows[0].id;
    }

    const [estudiantes] = await pool.query(
      `SELECT e.id, e.cedula, e.tipo_documento, e.apellidos, e.nombres, 
              e.lugar_nacimiento, e.entidad_federal, e.fecha_nacimiento, e.sexo
       FROM estudiantes e
       JOIN inscripciones i ON e.id = i.estudiante_id
       JOIN secciones s ON i.seccion_id = s.id
       WHERE s.grado_id = ? AND s.nombre = ? AND i.status = 'ACTIVO' AND i.periodo_id = ?
       ORDER BY e.apellidos, e.nombres`,
      [gradoIdNum, seccion, periodo_id]
    );

    const [docentesRaw] = await pool.query(
      `SELECT DISTINCT ev.docente_cedula, ev.materia, p.nombres, p.apellidos 
       FROM evaluaciones ev 
       LEFT JOIN personal p ON ev.docente_cedula = p.cedula
       WHERE ev.grado_id = ? AND ev.seccion = ? AND ev.periodo_id = ?`,
      [gradoIdNum, seccion, periodo_id]
    );
    const docentes = docentesRaw.map(d => ({
      cedula: d.docente_cedula,
      materia: d.materia,
      nombres: d.nombres || 'IMPORTADO',
      apellidos: d.apellidos || 'HISTÓRICO'
    }));

    const [definitivasRows] = await pool.query(
      `SELECT estudiante_id, materia_codigo, definitiva FROM historial_academico WHERE grado_id = ? AND periodo_id = ?`, 
      [gradoIdNum, periodo_id]
    );
    const definitivasMap = {};
    definitivasRows.forEach(row => {
      if (!definitivasMap[row.estudiante_id]) definitivasMap[row.estudiante_id] = {};
      definitivasMap[row.estudiante_id][row.materia_codigo] = row.definitiva;
    });

    const [materiasRows] = await pool.query(
      `SELECT DISTINCT materia_codigo FROM historial_academico WHERE grado_id = ? AND periodo_id = ? ORDER BY materia_codigo ASC`, 
      [gradoIdNum, periodo_id]
    );
    const materias = materiasRows.map(m => m.materia_codigo);

    const [instRows] = await pool.query('SELECT * FROM config_institucion WHERE id = 1');

    res.json({ 
      estudiantes, 
      docentes, 
      definitivas: definitivasMap,
      materias: materias, 
      institucion: instRows[0] || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar la API' });
  }
});

app.get('/api/estudiantes/search', async (req, res) => {
  const { q } = req.query; if (!q) return res.json([]);
  try {
    let rows;
    if (q.includes(',')) {
      const parts = q.split(','); const apellidoPart = parts[0].trim(); const nombrePart = parts.length > 1 ? parts[1].trim() : '';
      [rows] = await pool.query(`SELECT id, cedula, nombres, apellidos FROM estudiantes WHERE apellidos LIKE ? AND nombres LIKE ? LIMIT 20`, [apellidoPart ? `${apellidoPart}%` : '%', nombrePart ? `${nombrePart}%` : '%']);
    } else {
      [rows] = await pool.query(`SELECT id, cedula, nombres, apellidos FROM estudiantes WHERE cedula LIKE ? OR nombres LIKE ? OR apellidos LIKE ? LIMIT 20`, [`%${q}%`, `%${q}%`, `%${q}%`]);
    }
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Error en la búsqueda' }); }
});

app.post('/api/ctrl-estudios/consolidar-definitivas', async (req, res) => {
  const { grado_id, seccion } = req.body;
  const periodo_id = await getPeriodoActivo(); 
  const MATERIA_A_CODIGO = { 'CASTELLANO': 'CA', 'INGLES Y OTRAS LENGUAS EXTRANJERAS': 'IO', 'MATEMATICAS': 'MA', 'EDUCACION FISICA': 'EF', 'ARTE Y PATRIMONIO': 'AP', 'CIENCIAS NATURALES': 'CN', 'GEOGRAFIA, HISTORIA Y CIUDADANIA': 'GH', 'ORIENTACION Y CONVIVENCIA': 'OC', 'PARTICIPACION EN GRUPOS DE CREACION, RECREACION Y PRODUCCION': 'PG', 'FISICA': 'FI', 'QUIMICA': 'QU', 'BIOLOGIA': 'BI', 'FORMACION PARA LA SOBERANIA NACIONAL': 'FS', 'CIENCIAS DE LA TIERRA': 'CT' };
  try {
    const [estudiantes] = await pool.query(`SELECT e.id FROM estudiantes e JOIN inscripciones i ON e.id = i.estudiante_id JOIN secciones s ON i.seccion_id = s.id WHERE s.grado_id = ? AND s.nombre = ? AND i.status = 'ACTIVO' AND i.periodo_id = ?`, [grado_id, seccion, periodo_id]); 
    if (estudiantes.length === 0) return res.status(404).json({ error: 'No hay estudiantes' });
    let procesados = 0;
    for (const est of estudiantes) {
      const [notas] = await pool.query(`SELECT ev.materia, ev.momento, nd.nota_valor FROM notas_detalladas nd JOIN evaluaciones ev ON nd.evaluacion_id = ev.id WHERE nd.estudiante_id = ? AND ev.grado_id = ?`, [est.id, grado_id]);
      const materiasAgrupadas = {};
      notas.forEach(n => { if (!materiasAgrupadas[n.materia]) materiasAgrupadas[n.materia] = [0,0,0]; if (n.momento >= 1 && n.momento <= 3 && n.nota_valor !== null) materiasAgrupadas[n.materia][n.momento - 1] = parseFloat(n.nota_valor); });
      for (const [materiaNombre, lapsos] of Object.entries(materiasAgrupadas)) {
        const codigo = MATERIA_A_CODIGO[materiaNombre.toUpperCase()] || materiaNombre.substring(0, 2).toUpperCase();
        const [L1, L2, L3] = lapsos;
        if (L1 > 0 || L2 > 0 || L3 > 0) {
          const definitiva = parseFloat(((L1 + L2 + L3) / 3).toFixed(2));
          const estatus = definitiva >= 9.50 ? 'APROBADO' : 'REPROBADO';
          const tipo_aprobacion = definitiva >= 9.50 ? 'F' : null;
          await pool.query(`INSERT INTO historial_academico (estudiante_id, grado_id, materia_codigo, periodo_id, definitiva, estatus, tipo_aprobacion) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE definitiva = VALUES(definitiva), estatus = VALUES(estatus), tipo_aprobacion = VALUES(tipo_aprobacion)`, [est.id, grado_id, codigo, periodo_id, definitiva, estatus, tipo_aprobacion]);
        }
      }
      procesados++;
    }
    res.json({ mensaje: `Consolidación exitosa`, estudiantes_procesados: procesados });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/ctrl-estudios/alumnos-revision', async (req, res) => {
  const { grado_id, seccion } = req.query;
  const periodo_id = await getPeriodoActivo(); 
  try {
    const [rows] = await pool.query(`SELECT e.id as estudiante_id, e.cedula, e.apellidos, e.nombres, h.materia_codigo, h.definitiva as nota_original FROM historial_academico h JOIN estudiantes e ON h.estudiante_id = e.id JOIN inscripciones i ON e.id = i.estudiante_id JOIN secciones s ON i.seccion_id = s.id WHERE h.grado_id = ? AND s.nombre = ? AND h.periodo_id = ? AND h.estatus = 'REPROBADO' ORDER BY e.apellidos`, [grado_id, seccion, periodo_id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/ctrl-estudios/guardar-revision', async (req, res) => {
  const { notas } = req.body; 
  const periodo_id = await getPeriodoActivo(); 
  try {
    for (const nota of notas) {
      const { estudiante_id, materia_codigo, nota_revision } = nota;
      if (nota_revision >= 9.50) { await pool.query(`UPDATE historial_academico SET definitiva = ?, tipo_aprobacion = 'R', estatus = 'APROBADO', nota_revision = ? WHERE estudiante_id = ? AND materia_codigo = ? AND periodo_id = ?`, [nota_revision, nota_revision, estudiante_id, materia_codigo, periodo_id]); } 
      else { await pool.query(`UPDATE historial_academico SET nota_revision = ?, definitiva = ? WHERE estudiante_id = ? AND materia_codigo = ? AND periodo_id = ?`, [nota_revision, nota_revision, estudiante_id, materia_codigo, periodo_id]); }
    }
    res.json({ mensaje: 'Notas de revisión procesadas' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/ctrl-estudios/generar-mp', async (req, res) => {
  const { grado_id } = req.body;
  const periodo_id = await getPeriodoActivo(); 
  const SIGUIENTE_GRADO = { '16': 17, '17': 18, '18': 19, '19': 20 };
  try {
    const [reprobados] = await pool.query(`SELECT estudiante_id, COUNT(materia_codigo) as total_reprobadas FROM historial_academico WHERE grado_id = ? AND periodo_id = ? AND estatus = 'REPROBADO' GROUP BY estudiante_id`, [grado_id, periodo_id]);
    if (reprobados.length === 0) return res.json({ mensaje: 'No hay alumnos reprobados.', alumnos_mp: 0, alumnos_repiten: 0 });
    let alumnosMP = 0, alumnosRepiten = 0;
    for (const rep of reprobados) {
      const { estudiante_id, total_reprobadas } = rep;
      if (total_reprobadas > 2) { await pool.query(`UPDATE inscripciones SET repite = 1 WHERE estudiante_id = ? AND periodo_id = ?`, [estudiante_id, periodo_id]); alumnosRepiten++; } 
      else {
        await pool.query(`UPDATE inscripciones SET materias_pendientes = 1 WHERE estudiante_id = ? AND periodo_id = ?`, [estudiante_id, periodo_id]);
        const [materias] = await pool.query(`SELECT materia_codigo FROM historial_academico WHERE estudiante_id = ? AND grado_id = ? AND periodo_id = ? AND estatus = 'REPROBADO'`, [estudiante_id, grado_id, periodo_id]);
        for (const mat of materias) {
          const gradoSiguiente = SIGUIENTE_GRADO[grado_id.toString()] || null;
          await pool.query(`INSERT INTO materias_pendientes (estudiante_id, grado_origen_id, materia_codigo, grado_actual_id, estatus, periodo_id) VALUES (?, ?, ?, ?, 'PENDIENTE', ?) ON DUPLICATE KEY UPDATE estatus = 'PENDIENTE'`, [estudiante_id, grado_id, mat.materia_codigo, gradoSiguiente, periodo_id]);
        }
        alumnosMP++;
      }
    }
    res.json({ mensaje: `Clasificación completada`, alumnos_mp: alumnosMP, alumnos_repiten: alumnosRepiten });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================
const storage = multer.diskStorage({ destination: path.join(__dirname, '../public/logos'), filename: (req, file, cb) => { cb(null, 'logo_institucion' + path.extname(file.originalname)); } });
const upload = multer({ storage });

app.get('/api/config', async (req, res) => {
  try {
    const [inst] = await pool.query('SELECT * FROM config_institucion WHERE id = 1');
    const [acad] = await pool.query('SELECT * FROM config_academica WHERE id = 1');
    const [periodos] = await pool.query('SELECT * FROM periodos_escolares ORDER BY nombre DESC'); 
    res.json({ institucion: inst[0], academica: acad[0], periodos }); 
  } catch (error) { res.status(500).json({ error: 'Error al cargar configuración' }); }
});

app.post('/api/config/institucion', upload.single('logo'), async (req, res) => {
  const { nombre, codAdministrativo, codDea, cdcee, municipio, nivel, direccion, telefono, email } = req.body;
  const logoPath = req.file ? `/logos/${req.file.filename}` : null;
  try {
    await pool.query(`UPDATE config_institucion SET nombre=?, cod_administrativo=?, cod_dea=?, cdcee=?, municipio=?, nivel=?, direccion=?, telefono=?, email=? ${logoPath ? ', logo_path=?' : ''} WHERE id=1`, logoPath ? [nombre, codAdministrativo, codDea, cdcee, municipio, nivel, direccion, telefono, email, logoPath] : [nombre, codAdministrativo, codDea, cdcee, municipio, nivel, direccion, telefono, email]);
    res.json({ mensaje: 'Datos institucionales guardados' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/config/periodos', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    await pool.query('INSERT INTO periodos_escolares (nombre, activo) VALUES (?, 0)', [nombre]);
    res.json({ mensaje: `Periodo ${nombre} creado exitosamente` });
  } catch (error) { res.status(500).json({ error: 'Error al crear periodo' }); }
});

app.put('/api/config/academico', async (req, res) => {
  const { periodo_nombre, momentos } = req.body;
  try {
    if (periodo_nombre) { await pool.query('UPDATE periodos_escolares SET activo = 0'); await pool.query('UPDATE periodos_escolares SET activo = 1 WHERE nombre = ?', [periodo_nombre]); }
    if (momentos && momentos.length === 3) {
      await pool.query(`UPDATE config_academica SET momento_1 = ?, inicio_1 = ?, fin_1 = ?, momento_2 = ?, inicio_2 = ?, fin_2 = ?, momento_3 = ?, inicio_3 = ?, fin_3 = ? WHERE id = 1`, [momentos[0].estado, momentos[0].inicio || null, momentos[0].fin || null, momentos[1].estado, momentos[1].inicio || null, momentos[1].fin || null, momentos[2].estado, momentos[2].inicio || null, momentos[2].fin || null]);
    }
    res.json({ mensaje: 'Ajustes académicos guardados' });
  } catch (error) { res.status(500).json({ error: 'Error al guardar' }); }
});

app.get('/api/usuarios/sincronizar', async (req, res) => {
  try {
    const [personal] = await pool.query(`SELECT p.id, p.cedula, p.nombres, p.apellidos FROM personal p LEFT JOIN usuarios_sistema u ON p.cedula = u.cedula WHERE u.cedula IS NULL`);
    let creados = 0;
    for (const p of personal) { await pool.query(`INSERT INTO usuarios_sistema (cedula, nombres, apellidos, rol, password_hash, estado, personal_id) VALUES (?, ?, ?, 'docente', ?, 'activo', ?)`, [p.cedula, p.nombres, p.apellidos, p.cedula, p.id]); creados++; }
    res.json({ mensaje: `Sincronización completa. ${creados} usuarios creados.`, creados });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// ============================================
// ASIGNACIONES DOCENTES
// ============================================
app.post('/api/asignaciones-docentes', async (req, res) => {
  const { periodo_id, grado_id, seccion, asignaciones } = req.body; 
  try {
    await pool.query('DELETE FROM asignaciones_docentes WHERE periodo_id = ? AND grado_id = ? AND seccion = ?', [periodo_id, grado_id, seccion]);
    for (const a of asignaciones) {
      await pool.query('INSERT INTO asignaciones_docentes (periodo_id, grado_id, seccion, materia_codigo, personal_cedula) VALUES (?, ?, ?, ?, ?)', [periodo_id, grado_id, seccion, a.materia_codigo, a.personal_cedula]);
    }
    res.json({ mensaje: 'Asignaciones guardadas' });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/asignaciones-docentes', async (req, res) => {
  const { periodo_id, grado_id, seccion } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM asignaciones_docentes WHERE periodo_id = ? AND grado_id = ? AND seccion = ?', [periodo_id, grado_id, seccion]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// ============================================
// ASIGNACIONES DOCENTES (Versión Definitiva)
// ============================================

// RUTA: Listar todo el personal activo
app.get('/api/personal', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cedula, nombres, apellidos, materia_especialidad 
       FROM personal 
       WHERE estado = 'activo' 
       ORDER BY apellidos, nombres`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ error: 'Error al obtener personal' });
  }
});

// RUTA: Obtener asignaciones existentes (Con JOIN para traer los nombres)
app.get('/api/asignaciones-docentes', async (req, res) => {
  const { grado_id, seccion } = req.query;
  try {
    const periodo_id = await getPeriodoActivo();
    const [rows] = await pool.query(
      `SELECT ad.*, p.nombres, p.apellidos 
       FROM asignaciones_docentes ad 
       LEFT JOIN personal p ON ad.personal_cedula = p.cedula 
       WHERE ad.periodo_id = ? AND ad.grado_id = ? AND ad.seccion = ?`, 
      [periodo_id, grado_id, seccion]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ error: 'Error' });
  }
});

// RUTA: Asignar un docente individualmente
app.post('/api/asignaciones-docentes/individual', async (req, res) => {
  const { grado_id, seccion, materia_codigo, docente_cedula } = req.body;
  try {
    const periodo_id = await getPeriodoActivo();
    
    // Verificar si ya existe una asignación para esta materia en esta sección
    const [existe] = await pool.query(
      'SELECT * FROM asignaciones_docentes WHERE periodo_id = ? AND grado_id = ? AND seccion = ? AND materia_codigo = ?',
      [periodo_id, grado_id, seccion, materia_codigo]
    );
    
    if (existe.length > 0) {
      // Si ya existe, actualizamos el docente
      await pool.query(
        'UPDATE asignaciones_docentes SET personal_cedula = ? WHERE periodo_id = ? AND grado_id = ? AND seccion = ? AND materia_codigo = ?',
        [docente_cedula, periodo_id, grado_id, seccion, materia_codigo]
      );
    } else {
      // Si no existe, lo insertamos
      await pool.query(
        'INSERT INTO asignaciones_docentes (periodo_id, grado_id, seccion, materia_codigo, personal_cedula) VALUES (?, ?, ?, ?, ?)',
        [periodo_id, grado_id, seccion, materia_codigo, docente_cedula]
      );
    }

    // Devolvemos el registro recién guardado con el JOIN del nombre del docente
    const [rowReturned] = await pool.query(
      `SELECT ad.*, p.nombres, p.apellidos 
       FROM asignaciones_docentes ad 
       LEFT JOIN personal p ON ad.personal_cedula = p.cedula 
       WHERE ad.periodo_id = ? AND ad.grado_id = ? AND ad.seccion = ? AND ad.materia_codigo = ?`,
      [periodo_id, grado_id, seccion, materia_codigo]
    );
    
    res.json(rowReturned[0]);
  } catch (error) {
    console.error('❌ ERROR AL ASIGNAR DOCENTE:', error); // ¡ESTO NOS DIRÁ EL PROBLEMA REAL!
    res.status(500).json({ error: 'Error al asignar docente' });
  }
});

// RUTA: Eliminar una asignación por sus datos compuestos
app.delete('/api/asignaciones-docentes/individual', async (req, res) => {
  const { grado_id, seccion, materia_codigo } = req.body;
  try {
    const periodo_id = await getPeriodoActivo();
    await pool.query(
      'DELETE FROM asignaciones_docentes WHERE periodo_id = ? AND grado_id = ? AND seccion = ? AND materia_codigo = ?',
      [periodo_id, grado_id, seccion, materia_codigo]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
});

// ============================================
// ASISTENCIAS
// ============================================
app.get('/api/docente/asistencia/:seccion_id/:fecha/:momento', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT estudiante_id, estado FROM asistencias 
             WHERE seccion_id = ? AND fecha = ? AND momento = ?`,
            [req.params.seccion_id, req.params.fecha, req.params.momento]
        );
        const estadoMap = {};
        rows.forEach(r => { estadoMap[r.estudiante_id] = r.estado; });
        res.json(estadoMap);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar asistencia' });
    }
});

app.post('/api/docente/asistencia', async (req, res) => {
    try {
        const { registros, fecha, momento, seccion_id, docente_cedula } = req.body;
        if (!registros || registros.length === 0) return res.status(400).json({ error: 'No hay registros' });

        const valores = registros.map(r => [
            r.estudiante_id, seccion_id, fecha, momento, r.estado, docente_cedula
        ]);

        await pool.query(`
            INSERT INTO asistencias (estudiante_id, seccion_id, fecha, momento, estado, docente_cedula)
            VALUES ?
            ON DUPLICATE KEY UPDATE estado = VALUES(estado)
        `, [valores]);

        res.json({ success: true, mensaje: 'Asistencia guardada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar asistencia' });
    }
});

app.get('/api/docente/asistencia/historial/:grado_id/:seccion/:cedula', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT DISTINCT a.fecha 
             FROM asistencias a
             JOIN secciones s ON a.seccion_id = s.id
             WHERE s.grado_id = ? AND s.nombre = ? AND a.docente_cedula = ?
             ORDER BY a.fecha DESC`,
            [req.params.grado_id, req.params.seccion, req.params.cedula]
        );
        const fechas = rows.map(r => r.fecha.toISOString().split('T')[0]);
        res.json(fechas);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar historial' });
    }
});

// ============================================
// INCIDENCIAS
// ============================================
app.post('/api/docente/incidencias', authMiddleware, async (req, res) => {
    try {
        const {
            docente_cedula, estudiante_id, estudiante_nombre, grado, seccion, fecha,
            situaciones, otra_situacion, descripcion, antecedentes, acciones_tomadas,
            otra_accion, compromisos_estudiante, compromisos_representante, estado
        } = req.body;

        await pool.execute(
            `INSERT INTO incidencias 
            (docente_cedula, estudiante_id, estudiante_nombre, grado, seccion, fecha, situaciones, outra_situacao, descricao, antecedentes, acoes_tomadas, outra_acao, compromissos_estudante, compromissos_representante, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [docente_cedula, estudiante_id, estudiante_nombre, grado, seccion, fecha, situaciones, otra_situacion, descripcion, antecedentes, acciones_tomadas, otra_accion, compromisos_estudiante, compromisos_representante, estado || 'borrador']
        );

        res.json({ success: true, msg: 'Incidencia guardada correctamente' });
    } catch (error) {
        console.error('Error al guardar incidencia:', error);
        res.status(500).json({ error: 'Error al guardar incidencia' });
    }
});

// ============================================
// PLANIFICACIONES
// ============================================
app.post('/api/docente/planificaciones', authMiddleware, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { docente_cedula, materia, grado, secciones, momento, peic, tema_indispensable, tema_generador, estado, contenidos, evaluaciones } = req.body;
        
        await conn.beginTransaction();

        const [planRes] = await conn.execute(
            `INSERT INTO planificaciones (docente_cedula, materia, grado, secciones, momento, peic, tema_indispensable, tema_generador, estado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [docente_cedula, materia, grado, secciones, momento, peic, tema_indispensable, tema_generador, estado]
        );
        const planId = planRes.insertId;

        for (let i = 0; i < contenidos.length; i++) {
            const c = contenidos[i];
            await conn.execute(
                `INSERT INTO planificaciones_contenidos (planificacion_id, orden, tejido_tematico, conceptualizacao, referentes_teoricos, competencias, estrategias_metodologicas, recursos)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [planId, i + 1, c.tejido, c.conceptualizacao, c.referentes, c.competencias, c.estrategias, c.recursos]
            );
        }

        for (let i = 0; i < evaluaciones.length; i++) {
            const ev = evaluaciones[i];
            await conn.execute(
                `INSERT INTO planificacoes_avaliacoes (planificacao_id, ordem, estrategia, instrumento, prova, criterios)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [planId, i + 1, ev.estrategia, ev.instrumento, ev.prova, ev.criterios]
            );
        }

        await conn.commit();
        res.json({ success: true, planId });
    } catch (error) {
        await conn.rollback();
        console.error('Error al guardar planificación:', error);
        res.status(500).json({ error: 'Error al guardar planificación' });
    } finally {
        conn.release();
    }
});

// ============================================
// RUTAS PROTEGIDAS (CALIFICACIONES Y ESTUDIANTES)
// ============================================
app.get('/api/calificaciones', authMiddleware, async (req, res) => {
    try {
        const [calificaciones] = await pool.execute(
            `SELECT 
                e.cedula,
                CONCAT(e.apellidos, ', ', e.nombres) as estudiante,
                g.nome as grado,
                s.nome as secao,
                a.nome as asignatura,
                c.lapso,
                c.nota_1,
                c.nota_2,
                c.nota_3,
                c.definitiva
             FROM calificacoes c
             JOIN estudantes e ON c.estudante_id = e.id
             JOIN asignaturas a ON c.asignatura_id = a.id
             JOIN graos g ON a.grao_id = g.id
             JOIN secoes s ON e.secao_id = s.id
           ORDER BY e.cedula ASC`
        );
        res.json(calificacoes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
});

app.get('/api/estudiantes/:grado/:seccion', authMiddleware, async (req, res) => {
    const { grado, seccion } = req.params;
    try {
        const periodo_id = await getPeriodoActivo(); 
        const [estudiantes] = await pool.execute(
            `SELECT 
                e.id,
                e.cedula,
                e.nombres,
                e.apellidos,
                e.sexo,
                g.nombre as grado,
                s.nombre as seccion
             FROM estudiantes e
             JOIN inscripciones i ON e.id = i.estudiante_id
             JOIN secciones s ON i.seccion_id = s.id
             JOIN grados g ON s.grado_id = g.id
             WHERE g.id = ? AND s.nombre = ? AND e.estado = 'activo' AND i.periodo_id = ?
             ORDER BY e.apellidos`,
            [grado, seccion, periodo_id] 
        );
        res.json(estudiantes);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
});

// ============================================
// IMPORTACIONES (ALUMNOS Y BOLETINES)
// ============================================
const storageBoletin = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => { cb(null, 'boletin_import' + path.extname(file.originalname)); }
});
const uploadBoletin = multer({ storage: storageBoletin });

// MOTOR DEFINITIVO DE IMPORTACIÓN DE BOLETINES
app.post('/api/importar/boletin', uploadBoletin.single('archivo'), async (req, res) => {
  const conn = await pool.getConnection(); 
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    const periodo_id = await getPeriodoActivo();
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    if (jsonData.length === 0) return res.status(400).json({ error: 'El archivo está vacío' });

    const CODGRA_MAP = { '1F': 16, '2F': 17, '3F': 18, '4F': 19, '5F': 20 };
    const MATERIAS_ORDEN = {
      16: ['CA', 'IO', 'MA', 'EF', 'AP', 'CN', 'GH', 'OC', 'PG'], 
      17: ['CA', 'IO', 'MA', 'EF', 'AP', 'CN', 'GH', 'OC', 'PG'],
      18: ['CA', 'IO', 'MA', 'EF', 'FI', 'QU', 'BI', 'GH', 'OC', 'PG'], 
      19: ['CA', 'IO', 'MA', 'EF', 'FI', 'QU', 'BI', 'GH', 'FS', 'OC', 'PG'], 
      20: ['CA', 'IO', 'MA', 'EF', 'FI', 'QU', 'BI', 'CT', 'GH', 'FS', 'OC', 'PG'] 
    };
    const MATERIA_NOMBRE = { 'CA': 'CASTELLANO', 'IO': 'INGLES Y OTRAS LENGUAS EXTRANJERAS', 'MA': 'MATEMATICAS', 'EF': 'EDUCACION FISICA', 'AP': 'ARTE Y PATRIMONIO', 'CN': 'CIENCIAS NATURALES', 'GH': 'GEOGRAFIA, HISTORIA Y CIUDADANIA', 'OC': 'ORIENTACION Y CONVIVENCIA', 'PG': 'PARTICIPACION EN GRUPOS DE CREACION, RECREACION Y PRODUCCION', 'FI': 'FISICA', 'QU': 'QUIMICA', 'BI': 'BIOLOGIA', 'FS': 'FORMACION PARA LA SOBERANIA NACIONAL', 'CT': 'CIENCIAS DE LA TIERRA' };

    await conn.beginTransaction();

    let procesados = 0, ignorados = 0, noEncontrados = 0;

    for (const row of jsonData) {
      try {
        const codGra = String(row.CodGra || '').trim().toUpperCase();
        const grado_id = CODGRA_MAP[codGra];
        
        if (!grado_id) { ignorados++; continue; } 

        const seccion = String(row.CodSec || '').trim();
        if (!seccion) { ignorados++; continue; }

        // 🚀 LÓGICA MEJORADA CE / CI
        let cedulaRaw = String(row.CedAlu || '').trim();
        let numericPart = cedulaRaw.replace(/[^0-9]/g, ''); 
        
        let esCedulaEscolar = numericPart.length >= 11; 
        
        let searchCedulas = [cedulaRaw];
        
        if (esCedulaEscolar) {
          if (/^[VEve]/.test(cedulaRaw)) searchCedulas.push(cedulaRaw.substring(1));
          searchCedulas.push(numericPart); 
        } else {
          let cleanCI = numericPart;
          if (cleanCI.length > 8) cleanCI = cleanCI.slice(-8);
          searchCedulas.push(cleanCI);
          searchCedulas.push(cleanCI.replace(/^0/, '')); 
        }
        
        searchCedulas = [...new Set(searchCedulas.filter(c => c.length > 0))];

        let [estRows] = await conn.query(
          'SELECT id, cedula, cedula_escolar FROM estudiantes WHERE cedula IN (?) OR cedula_escolar IN (?)', 
          [searchCedulas, searchCedulas]
        );
        
        if (estRows.length === 0) {
          const apellidos = String(row.ApeAlu || '').trim().toUpperCase();
          const nombres = String(row.NomAlu || '').trim().toUpperCase();
          if (apellidos && nombres) {
            const [nameRows] = await conn.query(
              "SELECT id, cedula, cedula_escolar FROM estudiantes WHERE UPPER(TRIM(apellidos)) = ? AND UPPER(TRIM(nombres)) LIKE ?", 
              [apellidos, `%${nombres}%`]
            );
            if (nameRows.length > 0) estRows = nameRows; 
          }
        }

        if (estRows.length === 0) { noEncontrados++; continue; }
        const estudiante_id = estRows[0].id;
        
        if (esCedulaEscolar && !estRows[0].cedula_escolar) {
          await conn.query('UPDATE estudiantes SET cedula_escolar = ? WHERE id = ?', [numericPart, estudiante_id]);
        }

        // 3. BUSCAR O CREAR SECCIÓN E INSCRIPCIÓN
        let [secRows] = await conn.query('SELECT id FROM secciones WHERE grado_id = ? AND nombre = ?', [grado_id, seccion]);
        let seccion_id;
        if (secRows.length > 0) {
          seccion_id = secRows[0].id;
        } else {
          const [resSec] = await conn.query('INSERT INTO secciones (grado_id, nombre) VALUES (?, ?)', [grado_id, seccion]);
          seccion_id = resSec.insertId;
        }

        const [inscRows] = await conn.query('SELECT id FROM inscripciones WHERE estudiante_id = ? AND seccion_id = ? AND periodo_id = ?', [estudiante_id, seccion_id, periodo_id]);
        if (inscRows.length === 0) {
          await conn.query('INSERT INTO inscripciones (estudiante_id, seccion_id, periodo_id, status) VALUES (?, ?, ?, ?)', [estudiante_id, seccion_id, periodo_id, 'ACTIVO']);
        }

        // 4. PROCESAR NOTAS Y EVALUACIONES
        const materias = MATERIAS_ORDEN[grado_id];
        const lapsos = [
          { momento: 1, data: row.Lapso1 },
          { momento: 2, data: row.Lapso2 },
          { momento: 3, data: row.Lapso3 },
          { momento: 0, data: row.NotaDef } 
        ];

        for (const lapso of lapsos) {
          if (!lapso.data) continue;
          const strNotas = String(lapso.data).trim();
          
          const notas = [];
          for (let i = 0; i < materias.length * 2; i += 2) {
            const chunk = strNotas.substring(i, i + 2).trim();
            if (chunk.toUpperCase() === 'EX') notas.push('EX');
            else if (chunk === '' || chunk === '  ') notas.push('I');
            else notas.push(chunk); 
          }

          for (let j = 0; j < materias.length; j++) {
            if (j >= notas.length) break;
            const codMat = materias[j];
            const notaValor = notas[j];
            const nombreMat = MATERIA_NOMBRE[codMat] || codMat;

            if (lapso.momento === 0) { 
              const definitivo = parseFloat(notaValor);
              const estatus = definitivo >= 9.50 ? 'APROBADO' : 'REPROBADO';
              const tipo = definitivo >= 9.50 ? 'F' : null;
              if (!isNaN(definitivo)) {
                await conn.query(
                  `INSERT INTO historial_academico (estudiante_id, grado_id, materia_codigo, periodo_id, definitiva, estatus, tipo_aprobacion) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE definitiva=VALUES(definitiva), estatus=VALUES(estatus)`,
                  [estudiante_id, grado_id, codMat, periodo_id, definitivo, estatus, tipo]
                );
              }
            } else { 
              const docente_cedula = 'IMPORT_HIST';
              
              let [evalRows] = await conn.query(
                'SELECT id FROM evaluaciones WHERE grado_id = ? AND seccion = ? AND materia = ? AND momento = ? AND tipo = ? AND periodo_id = ?',
                [grado_id, seccion, nombreMat, lapso.momento, 'cuantitativa', periodo_id]
              );

              let evaluacion_id;
              if (evalRows.length > 0) {
                evaluacion_id = evalRows[0].id;
              } else {
                const [resEval] = await conn.query(
                  'INSERT INTO evaluaciones (docente_cedula, grado_id, seccion, materia, momento, nombre, tipo, puntaje_maximo, orden, periodo_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  [docente_cedula, grado_id, seccion, nombreMat, lapso.momento, `${nombreMat} L${lapso.momento}`, 'cuantitativa', 20, 1, periodo_id]
                );
                evaluacion_id = resEval.insertId;
              }

              const valorFinal = (notaValor === 'I' || notaValor === 'EX') ? 0 : parseFloat(notaValor);
              if (!isNaN(valorFinal) || notaValor === 'I' || notaValor === 'EX') {
                await conn.query(
                  `INSERT INTO notas_detalladas (evaluacion_id, estudiante_id, nota_valor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nota_valor = VALUES(nota_valor)`,
                  [evaluacion_id, estudiante_id, valorFinal]
                );
              }
            }
          }
        }
        procesados++;
      } catch (innerError) {
        console.error(`Error procesando fila:`, innerError.message);
        ignorados++;
      }
    }

    await conn.commit();
    res.json({ 
      mensaje: `Importación finalizada. Periodo destino: ${periodo_id}`,
      procesados,
      ignorados,
      noEncontrados, 
      errores: ignorados
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error general importando boletín:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo' });
  } finally {
    conn.release();
  }
});

// POST /api/importar/alumnos - MOTOR DE CARGA DE DATOS DEMOGRÁFICOS
app.post('/api/importar/alumnos', uploadBoletin.single('archivo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    if (jsonData.length === 0) return res.status(400).json({ error: 'El archivo está vacío' });

    let procesados = 0, actualizados = 0, ignorados = 0;

    for (const row of jsonData) {
      try {
        let cedula = String(row.CedAlu || '').trim();
        if (!cedula) { ignorados++; continue; }

        const nombres = String(row.NomAlu || '').trim();
        const apellidos = String(row.ApeAlu || '').trim();
        if (!nombres && !apellidos) { ignorados++; continue; }

        let fechaNac = null;
        if (row.FchNac) {
          try {
            if (typeof row.FchNac === 'number') {
              fechaNac = new Date((row.FchNac - 25569) * 86400 * 1000).toISOString().split('T')[0];
            } else {
              const parsed = new Date(row.FchNac);
              if (!isNaN(parsed.getTime())) fechaNac = parsed.toISOString().split('T')[0];
            }
          } catch (e) { /* Si falla el parseo, queda null */ }
        }

        const sexo = String(row.SexAlu || 'M').trim().toUpperCase().startsWith('F') ? 'F' : 'M';
        const lugarNac = String(row.LugNac || '').trim();
        const entFed = String(row.EntFed || '').trim();
        const direccion = String(row.Direccion || '').trim();
        let estado = 'activo'; 
        const estStr = String(row.Estado || '').trim().toUpperCase();
        if (estStr.includes('RETIR') || estStr.includes('RET')) estado = 'retirado';
        if (estStr.includes('EGRES') || estStr.includes('EGRE')) estado = 'egresado';

        const [result] = await pool.query(
          `INSERT INTO estudiantes (cedula, nombres, apellidos, fecha_nacimiento, sexo, lugar_nacimiento, entidad_federal, direccion_habitacion, estado) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           nombres=IF(nombres='POR REGISTRAR' OR nombres='', VALUES(nombres), nombres), 
           apellidos=IF(apellidos='POR REGISTRAR' OR apellidos='', VALUES(apellidos), apellidos)`,
          [cedula, nombres, apellidos, fechaNac, sexo, lugarNac, entFed, direccion, estado]
        );

        if (result.affectedRows > 0) procesados++;
        else if (result.changedRows > 0) actualizados++;
        
      } catch (innerError) {
        console.error(`Error procesando alumno (Cédula: ${row.CedAlu}):`, innerError.message);
        ignorados++;
      }
    }

    res.json({ 
      mensaje: `Importación de alumnos finalizada.`,
      procesados,
      actualizados,
      ignorados
    });

  } catch (error) {
    console.error('Error general importando alumnos:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor API corriendo en http://localhost:${PORT}`);
});
