const XLSX = require('xlsx');
const mysql = require('mysql2/promise');

const GRADO_NUMERO_A_ID = {
  '1': 16,
  '2': 17,
  '3': 18,
  '4': 19,
  '5': 20
};

function separarNombre(nombreCompleto) {
  if (!nombreCompleto) return { nombres: '', apellidos: '' };
  const partes = nombreCompleto.toString().trim().split(/\s+/);
  if (partes.length === 1) return { nombres: partes[0], apellidos: '' };
  if (partes.length === 2) return { nombres: partes[0], apellidos: partes[1] };
  return { nombres: partes[0], apellidos: partes.slice(1).join(' ') };
}

async function importarDocentes(rutaArchivo) {
  console.log('========================================');
  console.log(' IMPORTACION DE DOCENTES - EDUGESTION');
  console.log('========================================\n');

  if (!rutaArchivo) {
    console.error('ERROR: Debes indicar la ruta del archivo.');
    process.exit(1);
  }

  let hoja;
  try {
    console.log('Leyendo archivo: ' + rutaArchivo);
    const workbook = XLSX.readFile(rutaArchivo);
    const nombreHoja = workbook.SheetNames[0];
    hoja = XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja], { defval: '' });
    console.log('Hoja "' + nombreHoja + '" leida: ' + hoja.length + ' filas encontradas\n');
  } catch (err) {
    console.error('ERROR al leer el archivo:', err.message);
    process.exit(1);
  }

  let conexion;
  try {
    conexion = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '@Relampago906',
      database: 'edugestion_siga',
      multipleStatements: true
    });
    console.log('Conexion a MariaDB establecida\n');
  } catch (err) {
    console.error('ERROR de conexion a BD:', err.message);
    process.exit(1);
  }

  let insertados = 0;
  let actualizados = 0;
  let errores = 0;
  const detallesErrores = [];

  for (let i = 0; i < hoja.length; i++) {
    const fila = hoja[i];
    const numFila = i + 2;

    try {
      const filaLimpia = {};
      for (let key in fila) {
        filaLimpia[key.trim()] = fila[key];
      }

      const cedula = String(filaLimpia['CEDULA'] || filaLimpia['Cédula'] || '').trim();
      const nombreCompleto = filaLimpia['NOMBRE Y APELLIDO'] || filaLimpia['Nombre y Apellido'] || filaLimpia['NOMBRE'] || '';
      const gradoRaw = filaLimpia['GRADO'] || filaLimpia['Grado'] || '';
      const secciones = filaLimpia['SECCION'] || filaLimpia['Seccion'] || filaLimpia['sección'] || filaLimpia['Sección'] || '';
      const materia = filaLimpia['Materia'] || filaLimpia['MATERIA'] || '';

      if (!cedula || !/^\d+$/.test(cedula)) {
        detallesErrores.push('Fila ' + numFila + ': Cedula invalida "' + cedula + '"');
        errores++;
        continue;
      }

      if (!gradoRaw) {
        detallesErrores.push('Fila ' + numFila + ': Grado vacio (cedula ' + cedula + ')');
        errores++;
        continue;
      }

      const primerCaracter = gradoRaw.toString().trim().charAt(0);
      const gradoId = GRADO_NUMERO_A_ID[primerCaracter];

      if (!gradoId) {
        detallesErrores.push('Fila ' + numFila + ': Grado no reconocido "' + gradoRaw + '" (cedula ' + cedula + ')');
        errores++;
        continue;
      }

      const { nombres, apellidos } = separarNombre(nombreCompleto);
      const seccionesLimpias = secciones.toString().trim().replace(/[,;|]/g, ' ').replace(/\s+/g, ' ').toUpperCase();

      const [existentes] = await conexion.query(
        'SELECT id, cedula, nombres FROM personal WHERE cedula = ?', [cedula]
      );

      if (existentes.length > 0) {
        await conexion.query(
          'UPDATE personal SET nombres = ?, apellidos = ?, tipo = \'DOCENTE\', grado_asignado = ?, seccion_asignada = ?, materia_especialidad = ?, estado = \'ACTIVO\' WHERE cedula = ?',
          [nombres, apellidos, gradoId, seccionesLimpias, materia, cedula]
        );
        actualizados++;
        console.log('  Actualizado: ' + cedula + ' - ' + nombreCompleto.trim() + ' (Grado ID: ' + gradoId + ' -> Secc: ' + seccionesLimpias + ')');
      } else {
        await conexion.query(
          'INSERT INTO personal (cedula, nombres, apellidos, tipo, grado_asignado, seccion_asignada, materia_especialidad, estado) VALUES (?, ?, ?, \'DOCENTE\', ?, ?, ?, \'ACTIVO\')',
          [cedula, nombres, apellidos, gradoId, seccionesLimpias, materia]
        );
        insertados++;
        console.log('  Insertado: ' + cedula + ' - ' + nombreCompleto.trim() + ' (Grado ID: ' + gradoId + ' -> Secc: ' + seccionesLimpias + ')');
      }

    } catch (err) {
      detallesErrores.push('Fila ' + numFila + ': Error BD - ' + err.message);
      errores++;
    }
  }

  await conexion.end();

  console.log('\n========================================');
  console.log(' RESUMEN DE IMPORTACION');
  console.log('========================================');
  console.log('   Insertados nuevos:  ' + insertados);
  console.log('   Actualizados:       ' + actualizados);
  console.log('   Errores:            ' + errores);
  console.log('   Total procesados:   ' + hoja.length);

  if (detallesErrores.length > 0) {
    console.log('\n  DETALLE DE ERRORES:');
    detallesErrores.forEach(function(e) { console.log('   * ' + e); });
  }

  console.log('\nProceso finalizado.\n');
}

importarDocentes(process.argv[2]);
