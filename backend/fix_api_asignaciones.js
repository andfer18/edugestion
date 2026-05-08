const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let c = fs.readFileSync(serverPath, 'utf8');

const oldQuery = `const [rows] = await pool.execute(
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

const newQuery = `const [rows] = await pool.query(
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

if (c.includes(oldQuery)) {
    c = c.replace(oldQuery, newQuery);
    fs.writeFileSync(serverPath, c, 'utf8');
    console.log('EXITO: Backend actualizado para leer de ambas tablas.');
} else {
    console.log('AVISO: Bloque no encontrado, usando método alternativo...');
    const regex = /const \[rows\] = await pool\.execute\([\s\S]*?AND p\.materia_especialidad IS NOT NULL`\,[\s\S]*?\[req\.params\.cedula\]\s*\);/;
    if (regex.test(c)) {
        c = c.replace(regex, newQuery.trim());
        fs.writeFileSync(serverPath, c, 'utf8');
        console.log('EXITO: Backend actualizado por método alternativo.');
    } else {
        console.log('ERROR: No se pudo actualizar. Revisa server.js manualmente.');
        process.exit(1);
    }
}
