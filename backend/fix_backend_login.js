const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const oldCedulaBlock = `app.post('/api/login/cedula', async (req, res) => {
    try {
        const { cedula } = req.body;
        const ci = String(cedula).trim().toUpperCase();

        if (!ci) {
            return res.status(400).json({ ok: false, msg: 'Ingrese la cédula' });
        }

        const [personas] = await pool.execute(
            \`SELECT id, cedula, nombres, apellidos 
             FROM personal 
             WHERE cedula = ? AND estado = 'activo'\`, [ci]
        );

        if (personas.length === 0) {
            return res.status(404).json({ ok: false, msg: 'Cédula no registrada en el sistema' });
        }

        const persona = personas[0];

        const [roles] = await pool.execute(
            \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color,
                    pr.etiqueta, pr.ruta_dashboard
             FROM personal_rol pr
             INNER JOIN roles r ON pr.rol_id = r.id
             WHERE pr.personal_id = ? AND pr.activo = 1
             ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria', 'docente')\`,
            [persona.id]
        );

        if (roles.length === 0) {
            return res.status(403).json({ ok: false, msg: 'Sin roles asignados. Contacte al administrador.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        loginTemporal.set(token, {
            personalId: persona.id,
            cedula: persona.cedula,
            nombres: persona.nombres,
            apellidos: persona.apellidos,
            roles,
            autenticado: false,
            expira: Date.now() + 5 * 60 * 1000
        });

        res.json({
            ok: true,
            token,
            nombreCompleto: \`\${persona.nombres} \${persona.apellidos}\`,
            cantidadRoles: roles.length
        });

    } catch (err) {
        console.error('Error en /api/login/cedula:', err);
        res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
});`;

const newCedulaBlock = `app.post('/api/login/cedula', async (req, res) => {
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
            const idsPersonas = personas.map(p => p.id);
            const [rolesEspeciales] = await pool.execute(
                \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
                 FROM personal_rol pr
                 INNER JOIN roles r ON pr.rol_id = r.id
                 WHERE pr.personal_id IN (?) AND pr.activo = 1 AND r.codigo != 'docente'
                 ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria')\`,
                [idsPersonas]
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

if (content.includes(oldCedulaBlock)) {
    content = content.replace(oldCedulaBlock, newCedulaBlock);
    
    // Inyectar grado_elegido y materia_elegida en los JWT
    const oldJwtContrasena = `rol: { codigo: temp.roles[0].codigo, nombre: temp.roles[0].nombre, etiqueta: temp.roles[0].etiqueta, icono: temp.roles[0].icono, color: temp.roles[0].color, ruta: temp.roles[0].ruta_dashboard }`;
    const newJwtContrasena = `rol: { codigo: temp.roles[0].codigo, nombre: temp.roles[0].nombre, etiqueta: temp.roles[0].etiqueta, icono: temp.roles[0].icono, color: temp.roles[0].color, ruta: temp.roles[0].ruta_dashboard, grado_elegido: temp.roles[0].grado_elegido, materia_elegida: temp.roles[0].materia_elegida }`;
    content = content.replace(oldJwtContrasena, newJwtContrasena);

    const oldJwtRol = `rol: { codigo: rolElegido.codigo, nombre: rolElegido.nombre, etiqueta: rolElegido.etiqueta, icono: rolElegido.icono, color: rolElegido.color, ruta: rolElegido.ruta_dashboard }`;
    const newJwtRol = `rol: { codigo: rolElegido.codigo, nombre: rolElegido.nombre, etiqueta: rolElegido.etiqueta, icono: rolElegido.icono, color: rolElegido.color, ruta: rolElegido.ruta_dashboard, grado_elegido: rolElegido.grado_elegido, materia_elegida: rolElegido.materia_elegida }`;
    content = content.replace(oldJwtRol, newJwtRol);

    fs.writeFileSync(serverPath, content, 'utf8');
    console.log('EXITO: Backend actualizado correctamente.');
} else {
    console.error('ERROR: No se encontró el bloque original. Verifica que server.js no haya sido modificado.');
    process.exit(1);
}
