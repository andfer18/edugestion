const fs = require('fs');
const serverPath = require('path').join(__dirname, 'server.js');
let c = fs.readFileSync(serverPath, 'utf8');

const oldBlock = `app.post('/api/login/cedula', async (req, res) => {
    try {
        const { cedula } = req.body;
        const ci = String(cedula).trim().toUpperCase();

        if (!ci) {
            return res.status(400).json({ ok: false, msg: 'Ingrese la cédula' });
        }

        // Buscar TODOS los registros de esta cédula (puede tener varios si da clases en distintos grados)
        const [personas] = await pool.execute(
            \`SELECT id, cedula, nombres, apellidos, grado_asignado, materia_especialidad 
             FROM personal 
             WHERE cedula = ? AND estado = 'activo'\`, [ci]
        );

        if (personas.length === 0) {
            return res.status(404).json({ ok: false, msg: 'Cédula no registrada en el sistema' });
        }

        const personaPrincipal = personas[0];
        let roles = [];

        // Filtrar asignaciones docentes (que tengan grado y materia)
        const asignacionesDocentes = personas.filter(p => p.materia_especialidad && p.grado_asignado);

        if (asignacionesDocentes.length > 1) {
            // CASO 1: Docente con múltiples grados/materias -> Generar opciones dinámicas
            const materiasUnicas = [...new Set(asignacionesDocentes.map(a => a.materia_especialidad))];
            const GRADOS_NOMBRES = { 16: '1er Año', 17: '2do Año', 18: '3er Año', 19: '4to Año', 20: '5to Año' };

            asignacionesDocentes.forEach(a => {
                // Si hay materias distintas, mostrar la materia. Si es la misma materia, mostrar el grado.
                const etiqueta = (materiasUnicas.length > 1) ? a.materia_especialidad : (GRADOS_NOMBRES[a.grado_asignado] || \`Grado \${a.grado_asignado}\`);

                roles.push({
                    asignacion_id: a.id,
                    codigo: 'docente',
                    nombre: 'Docente',
                    icono: 'fa-chalkboard-user',
                    color: '#1a3a6e',
                    etiqueta: etiqueta,
                    ruta_dashboard: '/docente',
                    grado_elegido: a.grado_asignado,
                    materia_elegida: a.materia_especialidad
                });
            });

            // Buscar roles especiales (coordinador, directivos) en cualquier ID de esta persona
            const [rolesEspeciales] = await pool.query(
                \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
                 FROM personal_rol pr
                 INNER JOIN roles r ON pr.rol_id = r.id
                 INNER JOIN personal p ON pr.personal_id = p.id
                 WHERE p.cedula = ? AND pr.activo = 1 AND r.codigo != 'docente'
                 ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria')\`,
                [ci]
            );
            roles = [...rolesEspeciales, ...roles];

        } else {
            // CASO 2: Asignación única o sin asignación docente -> Usar lógica normal de personal_rol
            const [rolesDB] = await pool.execute(
                \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
                 FROM personal_rol pr
                 INNER JOIN roles r ON pr.rol_id = r.id
                 WHERE pr.personal_id = ? AND pr.activo = 1
                 ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria', 'docente')\`,
                [personaPrincipal.id]
            );
            roles = rolesDB;
        }

        if (roles.length === 0) {
            return res.status(403).json({ ok: false, msg: 'Sin roles asignados. Contacte al administrador.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        loginTemporal.set(token, {
            personalId: personaPrincipal.id,
            cedula: personaPrincipal.cedula,
            nombres: personaPrincipal.nombres,
            apellidos: personaPrincipal.apellidos,
            roles,
            autenticado: false,
            expira: Date.now() + 5 * 60 * 1000
        });

        res.json({
            ok: true,
            token,
            nombreCompleto: \`\${personaPrincipal.nombres} \${personaPrincipal.apellidos}\`,
            cantidadRoles: roles.length
        });

    } catch (err) {
        console.error('Error en /api/login/cedula:', err);
        res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
});`;

const newBlock = `app.post('/api/login/cedula', async (req, res) => {
    try {
        const { cedula } = req.body;
        const ci = String(cedula).trim().toUpperCase();

        if (!ci) {
            return res.status(400).json({ ok: false, msg: 'Ingrese la cédula' });
        }

        const [personas] = await pool.execute(
            \`SELECT id, cedula, nombres, apellidos, grado_asignado, materia_especialidad 
             FROM personal 
             WHERE cedula = ? AND estado = 'activo'\`, [ci]
        );

        if (personas.length === 0) {
            return res.status(404).json({ ok: false, msg: 'Cédula no registrada en el sistema' });
        }

        const personaPrincipal = personas[0];
        let roles = [];

        // 1. Buscar roles especiales (coordinador, directivos) usando la cédula
        const [rolesEspeciales] = await pool.query(
            \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
             FROM personal_rol pr
             INNER JOIN roles r ON pr.rol_id = r.id
             INNER JOIN personal p ON pr.personal_id = p.id
             WHERE p.cedula = ? AND pr.activo = 1 AND r.codigo != 'docente'
             ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria')\`,
            [ci]
        );
        roles = rolesEspeciales;

        // 2. Si tiene al menos una asignación de materia, agregar rol DOCENTE automáticamente
        const tieneAsignacion = personas.some(p => p.materia_especialidad && p.grado_asignado);
        if (tieneAsignacion) {
            roles.push({
                asignacion_id: personaPrincipal.id,
                codigo: 'docente',
                nombre: 'Docente',
                icono: 'fa-chalkboard-user',
                color: '#1a3a6e',
                etiqueta: 'DOCENTE',
                ruta_dashboard: '/docente'
            });
        }

        if (roles.length === 0) {
            return res.status(403).json({ ok: false, msg: 'Sin roles asignados. Contacte al administrador.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        loginTemporal.set(token, {
            personalId: personaPrincipal.id,
            cedula: personaPrincipal.cedula,
            nombres: personaPrincipal.nombres,
            apellidos: personaPrincipal.apellidos,
            roles,
            autenticado: false,
            expira: Date.now() + 5 * 60 * 1000
        });

        res.json({
            ok: true,
            token,
            nombreCompleto: \`\${personaPrincipal.nombres} \${personaPrincipal.apellidos}\`,
            cantidadRoles: roles.length
        });

    } catch (err) {
        console.error('Error en /api/login/cedula:', err);
        res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
});`;

if (c.includes(oldBlock)) {
    c = c.replace(oldBlock, newBlock);
    fs.writeFileSync(serverPath, c, 'utf8');
    console.log('EXITO: Login limpio y simplificado.');
} else {
    console.log('AVISO: No se encontró el bloque exacto, intentando método alternativo...');
    // Regex fallback para evitar problemas de escape
    const regex = /app\.post\('\/api\/login\/cedula'[\s\S]*?Error en \/api\/login\/cedula:', err\);\s*res\.status\(500\)\.json\(\{ ok: false, msg: 'Error del servidor' \}\);\s*\}\s*\}\);/;
    if (regex.test(c)) {
        c = c.replace(regex, newBlock);
        fs.writeFileSync(serverPath, c, 'utf8');
        console.log('EXITO: Login simplificado por método alternativo.');
    } else {
        console.log('ERROR: No se pudo reemplazar automáticamente.');
        process.exit(1);
    }
}
