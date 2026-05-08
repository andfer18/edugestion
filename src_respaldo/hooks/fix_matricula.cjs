const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'pages', 'MiMatricula.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldConfig = `const GRADOS_IDS: Record<string, number> = {
  '1er Año': 16,
  '2do Año': 17,
  '3er Año': 18,
  '4to Año': 19,
  '5to Año': 20,
};`;

const newConfig = `const GRADOS_IDS: Record<string, number> = {
  '1er Año': 16,
  '2do Año': 17,
  '3er Año': 18,
  '4to Año': 19,
  '5to Año': 20,
};

// Mapeo inverso: traduce el ID (19) al nombre legible ("4to Año")
const NOMBRES_GRADOS: Record<string, string> = {
  '16': '1er Año',
  '17': '2do Año',
  '18': '3er Año',
  '19': '4to Año',
  '20': '5to Año',
};`;

if (!content.includes(oldConfig)) {
    console.error('ERROR: No se encontró la configuración original.');
    process.exit(1);
}
content = content.replace(oldConfig, newConfig);

const oldMap = `const formateadas: Asignacion[] = data.map((a: any) => ({
          grado: a.grado?.trim() || '',
          seccion: a.seccion?.trim() || '',
          materia: a.materia?.trim() || '',
        }));`;

const newMap = `const formateadas: Asignacion[] = data.map((a: any) => ({
          grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado || ''),
          seccion: a.seccion?.trim() || '',
          materia: a.materia?.trim() || '',
        }));`;

if (!content.includes(oldMap)) {
    console.error('ERROR: No se encontró el mapeo de datos.');
    process.exit(1);
}
content = content.replace(oldMap, newMap);

fs.writeFileSync(filePath, content, 'utf8');
console.log('EXITO: MiMatricula.tsx parcheado correctamente.');
