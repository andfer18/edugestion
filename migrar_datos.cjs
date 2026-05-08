const XLSX = require('xlsx');
const fs = require('fs');

const MATERIA_MAP = {
  'CA': { id: 'm-ca', nombre: 'Castellano' },
  'IO': { id: 'm-io', nombre: 'Inglés' },
  'MA': { id: 'm-ma', nombre: 'Matemáticas' },
  'EF': { id: 'm-ef', nombre: 'Educación Física' },
  'AP': { id: 'm-ap', nombre: 'Arte y Patrimonio' },
  'CN': { id: 'm-cn', nombre: 'Ciencias Naturales' },
  'GH': { id: 'm-gh', nombre: 'Geografía, Historia y Ciudadanía' },
  'OC': { id: 'm-oc', nombre: 'Orientación y Convivencia' },
  'PG': { id: 'm-pg', nombre: 'Participación y Recreación' },
  'BI': { id: 'm-bi', nombre: 'Bilología' },
  'CF': { id: 'm-cf', nombre: 'Ciencias Físicas' },
  'QU': { id: m-qu', nombre: 'Química' },
  'CT': { id: 'm-ct', nombre: 'Ciencias de la Tierra' },
  'FS': { id: 'm-fs', nombre: 'Formación Soberanía' },
  'GHC': { id: 'm-gh', nombre: 'Geografía, Historia y Ciudadanía' },
  'PGCRP': { id: 'm-pg', nombre: 'Participación y Recreación' },
  'FISICA': { id: 'm-fi', nombre: 'Física' },
};

const CURRICULO = {
  '1er Año': ['CA', 'IO', 'MA', 'EF', 'AP', 'CN', 'GH', 'OC', 'PG'],
  '2do Año': ['CA', 'IO', 'MA', 'EF', 'AP', 'CN', 'GH', 'OC', 'PG'],
  '3er Año': ['CA', 'BI', 'CF', 'QU', 'EF', 'GH', 'IO', 'MA', 'OC', 'PG'],
  '4to Año': ['CA', 'BI', 'CF', 'QU', 'EF', 'FS', 'GH', 'IO', 'MA', 'OC', 'PG'],
  '5to Año': ['CA', 'BI', 'CF', 'QU', 'CT', 'EF', 'FS', 'GH', 'IO', 'MA', 'OC', 'PG'],
};

function fixCedula(raw) {
  const clean = String(raw || '').replace(/\s/g, '');
  if (!clean || clean.length < 8) return null;
  const last8 = clean.slice(-8);
  if (last8.startsWith('3')) return `V-${last8}`;
  if (last8.startsWith('1')) return `V-${last8}`;
  return `V-${last8}`;
}

function parseNotasCompactas(str, grado) {
  if (!str || typeof str !== 'string' || str.includes('I') || str === '*') return null;
  const chunks = str.match(/.{1,2}/g);
  const materias = CURRICULO[grado] || CURRICULO['1er Año'];
  const notas = {};
  materias.forEach((cod, i) => {
    if (!chunks[i]) return;
    const val = parseInt(chunks[i], 10);
    if (!isNaN(val)) notas[cod] = val;
  });
  return notas;
}

console.log('🚀 Iniciando migración de datos reales...\n');

// ============================================================
// FASE 1: ASIGNACIONES
// ============================================================
console.log('📁 Leyendo asignaciones_docentes.csv...');
const csvAsignaciones = fs.readFileSync('asignaciones_docentes.csv', 'utf-8');
// Limpieza los saltos de línea de Windows (\r\n)
const linesAsig = csvAsignaciones.split(/\r?\n/).filter(l => l.trim());

let asignacionesMap = {};
linesAsig.forEach(line => {
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 9) return;
  
  const cedula = parts[1];
  const grado = parts[5];
  const seccionesRaw = parts[6];
  const materiaRaw = parts[7].toUpperCase();
  
  const secciones = seccionesRaw.split(/\s+/);
  const materiaInfo = MATERIA_MAP[materiaRaw];
  
  if (!materiaInfo) {
    console.log(`⚠️  Materia no reconocida: ${materiaRaw} (Cédula: ${cedula})`);
    return;
  }

  if (!asignacionesMap[cedula]) asignacionesMap[cedula] = [];
  
  const exists = asignacionesMap[cedula].find(
    a => a.grado === grado && a.materiaId === materiaInfo.id
  );
  if (!exists) {
    asignacionesMap[cedula].push({
      grado: grado,
      secciones: secciones,
      materiaId: materiaInfo.id,
      materiaNombre: materiaInfo.nombre
    });
  }
});
console.log(`✅ Se procesaron ${Object.keys(asignacionesMap).length} docentes con asignaciones.`);

const docentesPath = 'src/data/docentesReales.json';
const docentes = JSON.parse(fs.readFileSync(docentesPath, 'utf-8'));
let asignadosCount = 0;

docentes.forEach(doc => {
  if (asignacionesMap[doc.cedula]) {
    doc.asignaciones = asignacionesMap[doc.cedula];
    asignadosCount++;
  }
});
fs.writeFileSync(docentesPath, JSON.stringify(docentes, null, 2));
console.log(`✅ Se actualizaron ${asignadosCount} registros en docentesReales.json.\n`);


// ============================================================
// FASE 2: NOTAS
// ============================================================
console.log('📁 Leyendo notas_2do_momento.xlsx...');
const wbNotas = XLSX.readFile('notas_2do_momento.xlsx');
const wsNotas = wbNotas.Sheets[wbNotas.SheetNames[0]];
const dataNotas = XLSX.utils.sheet_to_json(wsNotas);

let notasArray = [];
let cedulasNuevas = new Set();

dataNotas.forEach(row => {
  const gradoRaw = String(row['Grado'] || '').trim();
  const seccion = String(row['Seccion'] || '').trim();
  const rawCedula = String(row['Cedula'] || '').trim();
  
  const cedulaFinal = fixCedula(rawCedula);
  if (!cedulaFinal) return;
  
  const lapso = 2;
  
  // Buscar la definitiva correctamente (manejando columnas vacías)
  let definitiva = 0;
  let definitivaRaw = row['Definitiva'];
  
  // Si Definitiva es null, undefined o tiene *, intentamos sacar el promedio de los momentos compactados
  if (!definitivaRaw || String(definitivaRaw).includes('*') || String(definitivaRaw).trim() === '') {
    definitivaRaw = row['Momento 1'];
  }
  
  if (definitivaRaw && !String(definitivaRaw).includes('*') && String(definitivaRaw).trim() !== '') {
    const notasParseadas = parseNotasCompactas(definitivaRaw, gradoRaw);
    if (notasParseadas) {
      const vals = Object.values(notasParseadas).filter(v => v !== null && v !== undefined);
      if (vals.length > 0) {
        definitiva = Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
      }
    }
  }

  const materiaId = CURRICULO[gradoRaw]?.[0] || 'm-ca';
  
  cedulasNuevas.add({ cedula: cedulaFinal, grado: gradoRaw, seccion });

  notasArray.push({
    estudianteId: `e-${cedulaFinal}-${gradoRaw}-${seccion}`,
    materiaId: materiaId,
    lapso: lapso,
    nota1: 0,
    nota2: 0,
    nota3: 0,
    definitiva: definitiva
  });
});
console.log(`✅ Se procesaron ${notasArray.length} registros de notas.`);
console.log(`⚠️  Se encontraron ${cedulasNuevas.size} cédulas nuevas para agregar a la base.`);

fs.writeFileSync('src/data/current_notas.json', JSON.stringify(notasArray, null, 2));
console.log('✅ Notas guardadas en current_notas.json.\n');


// ============================================================
// FASE 3: ASEGURAR QUE LOS ALUMNOS EXISTAN
// ============================================================
console.log('🛠️  Actualizando cédulas en realData.json...');
const realDataPath = 'src/data/realData.json';
const realData = JSON.parse(fs.readFileSync(realDataPath, 'utf-8'));

cedulasNuevas.forEach(nuevo => {
  const existe = realData.find(e => e.cedula === nuevo.cedula);
  if (!existe) {
    realData.push({
      id: `e-${nuevo.cedula}-${nuevo.grado}-${nuevo.seccion}`,
      nombre: 'POR ASIGNAR',
      apellido: '',
      cedula: nuevo.cedula,
      grado: nuevo.grado,
      seccion: nuevo.seccion,
      estado: 'activo'
    });
  }
});
fs.writeFileSync(realDataPath, JSON.stringify(realData, null, 2));
console.log(`✅ Base de datos de estudiantes actualizada.`);

console.log('\n🎉 MIGRACIÓN COMPLETADA. Recarga tu navegador para ver los datos reales.');
