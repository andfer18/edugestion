const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const oldQuery = `const idsPersonas = personas.map(p => p.id);
            const [rolesEspeciales] = await pool.execute(
                \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
                 FROM personal_rol pr
                 INNER JOIN roles r ON pr.rol_id = r.id
                 WHERE pr.personal_id IN (?) AND pr.activo = 1 AND r.codigo != 'docente'
                 ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria')\`,
                [idsPersonas]
            );`;

const newQuery = `const [rolesEspeciales] = await pool.query(
                \`SELECT pr.id AS asignacion_id, r.codigo, r.nombre, r.icono, r.color, pr.etiqueta, pr.ruta_dashboard
                 FROM personal_rol pr
                 INNER JOIN roles r ON pr.rol_id = r.id
                 INNER JOIN personal p ON pr.personal_id = p.id
                 WHERE p.cedula = ? AND pr.activo = 1 AND r.codigo != 'docente'
                 ORDER BY FIELD(r.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria')\`,
                [ci]
            );`;

if (content.includes(oldQuery)) {
    content = content.replace(oldQuery, newQuery);
    fs.writeFileSync(serverPath, content, 'utf8');
    console.log('EXITO: Query corregido en server.js');
} else {
    console.log('AVISO: Bloque no encontrado, intentando limpieza manual...');
    // Fallback por si las comillas invertidas cambian
    content = content.replace(/const idsPersonas = personas\.map\(p => p\.id\);[\s\S]*?ORDER BY FIELD\(r\.codigo, 'sistema', 'ctrl_estudios', 'directivos', 'secretaria'\)\`,\s*\[idsPersonas\]\s*\);/, newQuery.trim());
    fs.writeFileSync(serverPath, content, 'utf8');
    console.log('EXITO: Fallback aplicado.');
}
