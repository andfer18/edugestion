const fs = require('fs');
const path = require('path');

const archivos = [
    path.join(__dirname, '..', 'pages', 'CargaNotas.tsx'),
    path.join(__dirname, '..', 'pages', 'Asistencia.tsx')
];

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

const NOMBRES_GRADOS: Record<string, string> = {
  '16': '1er Año',
  '17': '2do Año',
  '18': '3er Año',
  '19': '4to Año',
  '20': '5to Año',
};`;

const oldMap = `grado: a.grado?.trim() || ''`;
const newMap = `grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado || '')`;

archivos.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let cambios = 0;

        if (content.includes(oldConfig) && !content.includes('NOMBRES_GRADOS')) {
            content = content.replace(oldConfig, newConfig);
            cambios++;
        }

        if (content.includes(oldMap)) {
            content = content.replace(oldMap, newMap);
            cambios++;
        }

        if (cambios > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`EXITO: ${path.basename(filePath)} parcheado (${cambios} cambios).`);
        } else {
            console.log(`AVISO: ${path.basename(filePath)} ya estaba parcheado o no coincide.`);
        }
    } catch (err) {
        console.error(`ERROR en ${path.basename(filePath)}: ${err.message}`);
    }
});
