const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let c = fs.readFileSync(serverPath, 'utf8');

const oldStr = `const [rows] = await pool.execute(
            \`SELECT 
                p.grado_asignado AS grado,
                p.seccion_asignada AS secciones_raw,
                p.materia_especialidad AS materia
             FROM personal p
             WHERE p.cedula = ? 
               AND p.estado = 'activo' 
               AND p.materia_especialidad IS NOT NULL\`,
            [req.params.cedula]
        );`;

const newStr = `const [rows] = await pool.query(
            \`SELECT grado_asignado AS grado, seccion_asignada AS secciones_raw, materia_especialidad AS materia
             FROM (
                 SELECT grado_asignado, seccion_asignada, materia_especialidad 
                 FROM personal WHERE cedula = ? AND estado = 'activo' AND materia_especialidad IS NOT NULL
                 UNION ALL
                 SELECT grado_asignado, seccion_asignada, materia_especialidad 
                 FROM asignaciones_docentes WHERE cedula = ?
             ) AS combinadas\`,
            [req.params.cedula, req.params.cedula]
        );`;

if (c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    fs.writeFileSync(serverPath, c, 'utf8');
    console.log('EXITO: Backend actualizado para leer asignaciones_extra.');
} else {
    console.log('AVISO: Ya estaba parcheado o no se encontró el bloque exacto.');
}
