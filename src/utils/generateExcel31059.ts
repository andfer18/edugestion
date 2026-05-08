import ExcelJS from 'exceljs';

// =======================================================
// MAPEOS Y CONFIGURACIONES
// =======================================================

const EF_ABBREVIATIONS: { [key: string]: string } = {
  'DISTRITO CAPITAL': 'DC', 'AMAZONAS': 'AM', 'ANZOATEGUI': 'AN', 'APURE': 'AP',
  'ARAGUA': 'AR', 'BARINAS': 'BA', 'BOLIVAR': 'BO', 'CARABOBO': 'CA', 'COJEDES': 'CO',
  'DELTA AMACURO': 'DA', 'FALCON': 'FA', 'GUARICO': 'GU', 'LARA': 'LA', 'MERIDA': 'ME',
  'MIRANDA': 'MI', 'MONAGAS': 'MO', 'NUEVA ESPARTA': 'NE', 'PORTUGUESA': 'PO', 'SUCRE': 'SU',
  'TACHIRA': 'TA', 'TRUJILLO': 'TR', 'VARGAS': 'VA', 'YARACUY': 'YA', 'ZULIA': 'ZU',
  'DEPENDENCIAS FEDERALES': 'DF'
};

const NOTAS_POR_GRADO: { [key: string]: number[] } = {
  '16': [47, 48, 49, 50, 51, 52, 53, 54, 55],
  '17': [47, 48, 49, 50, 51, 52, 53, 54, 55],
  '18': [47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
  '19': [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
  '20': [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
};

const MATERIAS_POR_GRADO: { [key: string]: string[] } = {
  '16': ['CA', 'IO', 'MA', 'EF', 'AP', 'CN', 'GH', 'OC', 'PG'],
  '17': ['CA', 'IO', 'MA', 'EF', 'AP', 'CN', 'GH', 'OC', 'PG'],
  '18': ['CA', 'IO', 'MA', 'EF', 'FI', 'QU', 'BI', 'GH', 'OC', 'PG'], 
  '19': ['CA', 'IO', 'MA', 'EF', 'FI', 'QU', 'BI', 'GH', 'FS', 'OC', 'PG'], 
  '20': ['CA', 'IO', 'MA', 'EF', 'FI', 'QU', 'BI', 'CT', 'GH', 'FS', 'OC', 'PG'] 
};

const MATERIA_NOMBRE_A_CODIGO: { [key: string]: string } = {
  'CASTELLANO': 'CA', 'INGLES Y OTRAS LENGUAS EXTRANJERAS': 'IO', 'MATEMATICAS': 'MA',
  'EDUCACION FISICA': 'EF', 'ARTE Y PATRIMONIO': 'AP', 'CIENCIAS NATURALES': 'CN',
  'GEOGRAFIA, HISTORIA Y CIUDADANIA': 'GH', 'ORIENTACION Y CONVIVENCIA': 'OC',
  'PARTICIPACION EN GRUPOS DE CREACION, RECREACION Y PRODUCCION': 'PG', 'FISICA': 'FI',
  'QUIMICA': 'QU', 'BIOLOGIA': 'BI', 'FORMACION PARA LA SOBERANIA NACIONAL': 'FS',
  'CIENCIAS DE LA TIERRA': 'CT'
};

const FILAS_PROFESORES: { [key: string]: { [materia: string]: number } } = {
  '16': { 'CA': 59, 'IO': 60, 'MA': 61, 'EF': 62, 'AP': 63, 'CN': 64, 'GH': 65, 'OC': 66, 'PG': 67 },
  '17': { 'CA': 59, 'IO': 60, 'MA': 61, 'EF': 62, 'AP': 63, 'CN': 64, 'GH': 65, 'OC': 66, 'PG': 67 },
  '18': { 'CA': 59, 'IO': 60, 'MA': 61, 'EF': 62, 'FI': 63, 'QU': 64, 'BI': 65, 'GH': 66, 'OC': 67, 'PG': 68 },
  '19': { 'CA': 59, 'IO': 60, 'MA': 61, 'EF': 62, 'FI': 63, 'QU': 64, 'BI': 65, 'GH': 66, 'FS': 67, 'OC': 68, 'PG': 69 },
  '20': { 'CA': 59, 'IO': 60, 'MA': 61, 'EF': 62, 'FI': 63, 'QU': 64, 'BI': 65, 'CT': 66, 'GH': 67, 'FS': 68, 'OC': 69, 'PG': 70 }
};

const FILAS_FIRMAS: { [key: string]: { dirNombreFila: number, dirCIFila: number, mppeNombreFila: number, mppeCIFila: number } } = {
  '16': { dirNombreFila: 73, dirCIFila: 75, mppeNombreFila: 73, mppeCIFila: 75 },
  '17': { dirNombreFila: 73, dirCIFila: 75, mppeNombreFila: 73, mppeCIFila: 75 },
  '18': { dirNombreFila: 74, dirCIFila: 76, mppeNombreFila: 74, mppeCIFila: 76 },
  '19': { dirNombreFila: 75, dirCIFila: 77, mppeNombreFila: 75, mppeCIFila: 77 },
  '20': { dirNombreFila: 76, dirCIFila: 78, mppeNombreFila: 76, mppeCIFila: 78 }
};

const GRADO_FILE_MAP: { [key: string]: string } = {
  '16': '1ro', '17': '2do', '18': '3ro', '19': '4to', '20': '5to'
};

// =======================================================
// FUNCIÓN PRINCIPAL
// =======================================================

export async function generateExcel31059(datosPlanilla: any, tipo: 'CI' | 'CE') {
  try {
    const { 
      estudiantes, 
      definitivas, 
      docentes, 
      seccion,
      gradoId, 
      directorNombre, 
      directorCI, 
      mppeNombre, 
      mppeCI, 
      observaciones,
      tipoEvaluacion,
      configInstitucion,
      periodo 
    } = datosPlanilla;

    const obtenerMesAnio = (): string => {
      const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
      const fechaActual = new Date();
      return `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
    };

    const gradoStr = GRADO_FILE_MAP[gradoId] || '1ro';
    const templatePath = `/templates/31059_${gradoStr}_${tipo}.xlsx`; 
    
    const response = await fetch(templatePath);
    const arrayBuffer = await response.arrayBuffer();
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('No se encontró la hoja de cálculo en la plantilla.');

    // ==========================================================
    // A) CONFIGURACIÓN DE IMPRESIÓN OFICIAL MPPE
    // ==========================================================
    worksheet.pageSetup = {
      paperSize: 5, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      horizontalCentered: true, verticalCentered: true
    };

    // ==========================================================
    // B) INYECCIÓN DE CABECERAS INSTITUCIONALES
    // ==========================================================
    const config = configInstitucion || {}; 

    worksheet.getCell('AS3').value = periodo || '2024-2025';
    worksheet.getCell('AT4').value = tipoEvaluacion || 'FINAL';
    worksheet.getCell('BB4').value = obtenerMesAnio();
    
    worksheet.getCell('T6').value = config.cod_dea || '';
    worksheet.getCell('AQ6').value = config.nombre || '';
    worksheet.getCell('D7').value = config.direccion || '';
    worksheet.getCell('BA7').value = config.telefono || '';
    worksheet.getCell('D8').value = config.municipio || '';
    worksheet.getCell('AF8').value = config.cdcee || ''; 
    worksheet.getCell('AS8').value = config.cdcee || '';
    
    worksheet.getCell('D9').value = directorNombre || '';
    worksheet.getCell('AV9').value = directorCI || '';
    worksheet.getCell('AZ65').value = seccion || '';

    // ==========================================================
    // C) RESCATE DE MATERIAS Y LLENAR PROFESORES
    // ==========================================================
    const obtenerTextoPlano = (valor: any): string => {
      if (!valor) return '';
      if (typeof valor === 'string') return valor;
      if (valor.richText) return valor.richText.map((r: any) => r.text).join('');
      return String(valor);
    };

    const filasProfe = FILAS_PROFESORES[gradoId] || FILAS_PROFESORES['16'];
    const materiasOriginales: Record<string, string> = {};

    Object.values(filasProfe).forEach((fila: any) => {
      const celda = worksheet.getCell(`C${fila}`);
      const texto = obtenerTextoPlano(celda.value);
      materiasOriginales[fila] = texto;
    });

    Object.values(filasProfe).forEach((fila: any) => {
      worksheet.getCell(`U${fila}`).value = null;
      worksheet.getCell(`AK${fila}`).value = null;
    });

    docentes.forEach((docente: any) => {
      const codigoMateria = MATERIA_NOMBRE_A_CODIGO[String(docente.materia || '').toUpperCase()];
      
      if (codigoMateria && filasProfe[codigoMateria]) {
        const fila = filasProfe[codigoMateria];
        const nombreCompleto = `${docente.apellidos || ''} ${docente.nombres || ''}`.trim();
        
        worksheet.getCell(`U${fila}`).value = nombreCompleto || 'IMPORTADO HISTÓRICO';
        worksheet.getCell(`AK${fila}`).value = docente.cedula;
      }
    });

    Object.entries(materiasOriginales).forEach(([fila, texto]) => {
      if (texto) {
        worksheet.getCell(`C${fila}`).value = texto;
      }
    });

    // ==========================================================
    // D) LLENAR ESTUDIANTES Y NOTAS (CON FORMATO 2 CIFRAS)
    // ==========================================================
    const esCedulaEscolar = (cedula: string | number) => {
      const ced = String(cedula);
      return /[a-zA-Z]/.test(ced.replace(/^[VEve]/, '')) || ced.replace(/[^0-9]/g, '').length >= 10;
    };

    let estudiantesFiltrados = estudiantes;
    if (tipo === 'CI') {
      estudiantesFiltrados = estudiantes.filter((e: any) => !esCedulaEscolar(e.cedula));
    } else if (tipo === 'CE') {
      estudiantesFiltrados = estudiantes.filter((e: any) => esCedulaEscolar(e.cedula));
    }

    const estudiantesOrdenados = [...estudiantesFiltrados].sort((a: any, b: any) => {
      return String(a.cedula).localeCompare(String(b.cedula), undefined, { numeric: true });
    });

    const columnasNotas = NOTAS_POR_GRADO[gradoId] || NOTAS_POR_GRADO['16'];
    const materiasOrden = MATERIAS_POR_GRADO[gradoId] || MATERIAS_POR_GRADO['16'];
    const filaInicio = 17;
    const maxEstudiantes = 35;

    for (let i = 0; i < maxEstudiantes; i++) {
      const fila = filaInicio + i;
      const estudiante = estudiantesOrdenados[i];

      if (estudiante) {
        worksheet.getCell(`B${fila}`).value = estudiante.cedula;
        worksheet.getCell(`O${fila}`).value = estudiante.apellidos;
        worksheet.getCell(`X${fila}`).value = estudiante.nombres;
        worksheet.getCell(`AI${fila}`).value = estudiante.lugar_nacimiento;
        worksheet.getCell(`AP${fila}`).value = EF_ABBREVIATIONS[estudiante.entidad_federal?.toUpperCase()] || estudiante.entidad_federal;
        worksheet.getCell(`AQ${fila}`).value = estudiante.sexo;

        let dia = '', mes = '', anio = '';
        if (estudiante.fecha_nacimiento) {
            const fechaLimpia = String(estudiante.fecha_nacimiento).split('T')[0];
            const partes = fechaLimpia.split('-');
            if (partes.length === 3) {
                anio = partes[0];
                mes = partes[1];
                dia = partes[2]; 
            }
        }
        worksheet.getCell(`AR${fila}`).value = dia;
        worksheet.getCell(`AS${fila}`).value = mes;
        worksheet.getCell(`AT${fila}`).value = anio;

        // INYECCIÓN DE NOTAS
        const notasEstudiante = definitivas[estudiante.id] || {};
        columnasNotas.forEach((col, index) => {
          const codigoMateria = materiasOrden[index]; 
          const valorNota = notasEstudiante[codigoMateria]; 
          const cell = worksheet.getCell(fila, col);
          
          if (valorNota !== undefined && valorNota !== null && valorNota !== '') {
            cell.value = Math.round(Number(valorNota)); // Redondea 14.6 a 15
            cell.numFmt = '00'; // 🚀 Fuerza a mostrar 08, 09, 15, 20
          } else {
            cell.value = '***';
          }
        });
      } else {
        worksheet.getCell(`B${fila}`).value = '***';
        worksheet.getCell(`O${fila}`).value = '***';
        worksheet.getCell(`X${fila}`).value = '***';
        worksheet.getCell(`AI${fila}`).value = '***';
        worksheet.getCell(`AP${fila}`).value = '***';
        worksheet.getCell(`AQ${fila}`).value = '***';
        worksheet.getCell(`AR${fila}`).value = '***';
        worksheet.getCell(`AS${fila}`).value = '***';
        worksheet.getCell(`AT${fila}`).value = '***';
        
        columnasNotas.forEach(col => worksheet.getCell(fila, col).value = '***');
      }
    }

    // ==========================================================
    // E) INYECCIÓN DE FIRMAS INSTITUCIONALES
    // ==========================================================
    const firmas = FILAS_FIRMAS[gradoId] || FILAS_FIRMAS['16'];

    worksheet.getCell(`A${firmas.dirNombreFila}`).value = directorNombre || '';
    worksheet.getCell(`A${firmas.dirCIFila}`).value = directorCI || '';
    
    worksheet.getCell(`AN${firmas.mppeNombreFila}`).value = mppeNombre || '';
    worksheet.getCell(`AN${firmas.mppeCIFila}`).value = mppeCI || '';

    // ==========================================================
    // F) GENERAR Y DESCARGAR ARCHIVO
    // ==========================================================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Planilla_31059_${gradoStr}_Seccion_${seccion}_${tipo}_${tipoEvaluacion || 'FINAL'}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error('Error real generando Excel:', error);
    throw error; 
  }
}
