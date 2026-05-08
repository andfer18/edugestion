/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  GENERADOR DE RESUMEN FINAL 31059 - EDUCACIÓN MEDIA GENERAL       ║
 * ║  Usa plantilla Excel original SIN MODIFICAR formato               ║
 * ║  Venezuela - Ministerio del Poder Popular para la Educación       ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════
// MAPA DE CELDAS - BASADO EN LA PLANTILLA ADJUNTA
// IMPORTANTE: Verifica y ajusta estas coordenadas con la plantilla real
// Abrir Excel → revisar las celdas exactas donde van los datos
// ═══════════════════════════════════════════════════════════════════════

const CELLS_MAP = {
  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN I: AÑO ESCOLAR (Filas 1-2)
  // ──────────────────────────────────────────────────────────────────
  seccion1: {
    añoEscolar: {
      fila: 1,
      columnaInicio: 34,  // Columna AH aprox - "I. Año Escolar:"
      columnaDato: 49,    // Donde se escribe el año
      valor: (data) => data.añoEscolar || '2024-2025'
    },
    tipoEvaluacion: {
      fila: 2,
      columnaInicio: 34,
      columnaDato: 50,
      valor: (data) => data.tipoEvaluacion || 'FINAL'
    },
    mesAño: {
      fila: 2,
      columnaInicio: 59,
      columnaDato: 66,
      valor: (data) => data.mesAño || 'JULIO 2025'
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN II: DATOS DE LA INSTITUCIÓN (Filas 3-7)
  // ──────────────────────────────────────────────────────────────────
  seccion2: {
    codigoInstitucion: {
      fila: 4,
      columnaDato: 20,
      valor: (data) => data.institucion?.codigo || ''
    },
    denominacion: {
      fila: 4,
      columnaDato: 42,
      valor: (data) => data.institucion?.denominacion || ''
    },
    direccion: {
      fila: 5,
      columnaDato: 11,
      valor: (data) => data.institucion?.direccion || ''
    },
    telefono: {
      fila: 5,
      columnaDato: 49,
      valor: (data) => data.institucion?.telefono || ''
    },
    municipio: {
      fila: 6,
      columnaDato: 11,
      valor: (data) => data.institucion?.municipio || ''
    },
    entidadFederal: {
      fila: 6,
      columnaDato: 35,
      valor: (data) => data.institucion?.estado || ''
    },
    cdcee: {
      fila: 6,
      columnaDato: 45,
      valor: (data) => data.institucion?.cdcee || ''
    },
    director: {
      fila: 7,
      columnaDato: 11,
      valor: (data) => data.institucion?.director || ''
    },
    cedulaDirector: {
      fila: 7,
      columnaDato: 49,
      valor: (data) => data.institucion?.cedulaDirector || ''
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN III: IDENTIFICACIÓN DEL ESTUDIANTE (Filas 13-43)
  // Cada estudiante ocupa una fila desde la 13 hasta la 43 (35 alumnos)
  // ──────────────────────────────────────────────────────────────────
  seccion3: {
    filaInicio: 13,
    filaFin: 43,
    columnas: {
      numero: 1,              // Columna A - N°
      cedulaEscolar: 2,       // Columna B - Cédula Escolar
      apellidos: 16,          // Columna P - Apellidos
      nombres: 25,            // Columna Y - Nombres  
      lugarNacimiento: 34,    // Columna AH - Lugar de Nacimiento
      entidadFederal: 41,     // Columna AO - EF
      sexo: 42,               // Columna AP - SEXO
      fechaDia: 44,           // Columna AR - DIA
      fechaMes: 46,           // Columna AT - MES
      fechaAño: 48            // Columna AV - AÑO
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN IV: RESUMEN FINAL DEL RENDIMIENTO (Filas 13-43)
  // Áreas de formación en columnas específicas
  // ──────────────────────────────────────────────────────────────────
  seccion4: {
    filaInicio: 13,
    filaFin: 43,
    areasFormacion: {
      CA: 50,    // Castellano - Columna AX aprox
      ILE: 52,   // Inglés - Columna AZ aprox
      MA: 54,    // Matemáticas - Columna BB aprox
      EF: 56,    // Educación Física - Columna BD aprox
      AP: 58,    // Arte y Patrimonio - Columna BF aprox
      CN: 60,    // Ciencias Naturales - Columna BH aprox
      GHC: 62,   // Geografía, Historia y Ciudadanía - Columna BJ aprox
      OC: 64,    // Orientación y Convivencia - Columna BL aprox
      PGCRP: 66, // Participación Grupos - Columna BN aprox
      GRUPO: 68  // Grupo - Columna BP aprox
    },
    totales: {
      filaBase: 48,
      inscritos: { fila: 48, columna: 55 },
      inasistentes: { fila: 49, columna: 55 },
      aprobados: { fila: 50, columna: 55 },
      noAprobados: { fila: 51, columna: 55 },
      noCursantes: { fila: 52, columna: 55 }
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN V: PROFESORES POR ÁREAS (Filas 55-63)
  // ──────────────────────────────────────────────────────────────────
  seccion5: {
    filaInicio: 55,
    profesores: {
      CA: 55,
      ILE: 56,
      MA: 57,
      EF: 58,
      AP: 59,
      CN: 60,
      GHC: 61,
      OC: 62,
      PG: 63
    },
    columnas: {
      nombreProfesor: 25,     // Donde va el nombre del profesor
      cedulaProfesor: 43,     // Donde va la cédula
      firma: 47               // Columna de firma (no se llena automáticamente)
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN VI: IDENTIFICACIÓN DEL CURSO (Filas 54-62)
  // ──────────────────────────────────────────────────────────────────
  seccion6: {
    planEstudio: {
      fila: 54,
      columna: 47,
      valor: () => 'EDUCACIÓN MEDIA GENERAL'
    },
    codigo: {
      fila: 56,
      columna: 47,
      valor: () => '31059'
    },
    añoCursado: {
      fila: 58,
      columna: 47,
      valor: (data) => data.añoCursado || 'PRIMERO'
    },
    seccion: {
      fila: 60,
      columna: 47,
      valor: (data) => data.seccion || 'A'
    },
    numEstudiantesSeccion: {
      fila: 62,
      columna: 47,
      valor: (data) => data.estudiantes?.length || 0
    },
    numEstudiantesPagina: {
      fila: 62,
      columna: 65,
      valor: (data) => Math.min(data.estudiantes?.length || 0, 35)
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIONES VII-IX: OBSERVACIONES, REMISIÓN, RECEPCIÓN (Filas 64-69)
  // ──────────────────────────────────────────────────────────────────
  seccionesFinal: {
    observaciones: {
      fila: 64,
      columnaInicio: 16,
      valor: (data) => data.observaciones || ''
    },
    fechaRemision: {
      fila: 65,
      columnaInicio: 16,
      valor: (data) => data.fechaRemision || ''
    },
    fechaRecepcion: {
      fila: 65,
      columna: 62,
      valor: (data) => data.fechaRecepcion || ''
    },
    directorFinal: {
      fila: 67,
      columna: 16,
      valor: (data) => data.institucion?.director || ''
    },
    cedulaDirectorFinal: {
      fila: 68,
      columna: 16,
      valor: (data) => data.institucion?.cedulaDirector || ''
    }
  }
};


// ═══════════════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

class Generador31059 {
  
  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.templatePath = path.join(
      __dirname, 
      '..', 
      'templates', 
      'Plantilla_Resumen_Final_Rendimiento_Estudiantil_EMG_Código_31059.xlsx'
    );
  }

  /**
   * Punto de entrada principal
   * @param {Object} data - Datos completos desde la BD
   * @param {Object} options - Opciones de generación
   * @returns {Buffer} Buffer del archivo Excel generado
   */
  async generar(data, options = {}) {
    try {
      // 1. Verificar que existe la plantilla
      if (!fs.existsSync(this.templatePath)) {
        throw new Error(
          `❌ Plantilla no encontrada: ${this.templatePath}\n` +
          `   Copia la plantilla original a la carpeta templates/`
        );
      }

      // 2. Cargar plantilla SIN MODIFICAR ESTRUCTURA
      this.workbook = new ExcelJS.Workbook();
      await this.workbook.xlsx.readFile(this.templatePath);
      
      // Obtener la hoja correcta según el año
      const nombreHoja = this._obtenerNombreHoja(data.añoCursado, options.hoja);
      this.worksheet = this.workbook.getWorksheet(nombreHoja);
      
      if (!this.worksheet) {
        throw new Error(
          `❌ Hoja "${nombreHoja}" no encontrada.\n` +
          `   Hojas disponibles: ${this.workbook.worksheets.map(w => w.name).join(', ')}`
        );
      }

      // 3. Llenar cada sección
      this._llenarSeccion1(data);
      this._llenarSeccion2(data);
      this._llenarSecciones3y4(data); // Estudiantes + Notas
      this._llenarSeccion5(data);      // Profesores
      this._llenarSeccion6(data);      // Identificación del curso
      this._llenarSeccionesFinales(data);

      // 4. Configurar página para impresión oficio
      this._configurarPaginaOficio();

      // 5. Generar buffer
      const buffer = await this.workbook.xlsx.writeBuffer();
      
      console.log('✅ Resumen 31059 generado exitosamente');
      return Buffer.from(buffer);

    } catch (error) {
      console.error('❌ Error generando 31059:', error.message);
      throw error;
    }
  }

  /**
   * Obtener el nombre correcto de la hoja según el año
   */
  _obtenerNombreHoja(añoCursado, hojaEspecifica) {
    if (hojaEspecifica) return hojaEspecifica;
    
    const mapaNombres = {
      '1': '1RO-CE',
      '1RO': '1RO-CE',
      'PRIMERO': '1RO-CE',
      '2': '2DO-CE',
      '2DO': '2DO-CE',
      'SEGUNDO': '2DO-CE',
      '3': '3RO-CE',
      '3RO': '3RO-CE',
      'TERCERO': '3RO-CE',
      '4': '4TO-CE',
      '4TO': '4TO-CE',
      'CUARTO': '4TO-CE',
      '5': '5TO-CE',
      '5TO': '5TO-CE',
      'QUINTO': '5TO-CE',
      '6': '6TO-CE',
      '6TO': '6TO-CE',
      'SEXTO': '6TO-CE'
    };

    const normalizado = String(añoCursado).toUpperCase().trim();
    return mapaNombres[normalizado] || `${normalizado}-CE`;
  }

  /**
   * Sección I: Año Escolar
   */
  _llenarSeccion1(data) {
    const seccion = CELLS_MAP.seccion1;
    
    this._escribirCelda(
      seccion.añoEscolar.fila,
      seccion.añoEscolar.columnaDato,
      seccion.añoEscolar.valor(data)
    );
    
    this._escribirCelda(
      seccion.tipoEvaluacion.fila,
      seccion.tipoEvaluacion.columnaDato,
      seccion.tipoEvaluacion.valor(data)
    );
    
    this._escribirCelda(
      seccion.mesAño.fila,
      seccion.mesAño.columnaDato,
      seccion.mesAño.valor(data)
    );
  }

  /**
   * Sección II: Datos de la Institución
   */
  _llenarSeccion2(data) {
    const seccion = CELLS_MAP.seccion2;
    
    for (const [key, config] of Object.entries(seccion)) {
      this._escribirCelda(
        config.fila,
        config.columnaDato,
        config.valor(data)
      );
    }
  }

  /**
   * Secciones III y IV: Estudiantes y Notas
   * Esta es la parte más crítica - recorre cada estudiante
   */
  _llenarSecciones3y4(data) {
    const s3 = CELLS_MAP.seccion3;
    const s4 = CELLS_MAP.seccion4;
    const estudiantes = data.estudiantes || [];
    
    // Contadores para totales
    let inscritos = 0;
    let aprobados = 0;
    let noAprobados = 0;
    let noCursantes = 0;

    estudiantes.forEach((estudiante, index) => {
      // Calcular fila (respetando límite de 35 por página)
      if (index >= 35) return; // Máximo por hoja
      
      const fila = s3.filaInicio + index;

      // ── Sección III: Datos del estudiante ──
      this._escribirCelda(fila, s3.columnas.numero, index + 1);
      this._escribirCelda(fila, s3.columnas.cedulaEscolar, estudiante.cedulaEscolar || '');
      
      // Apellidos (con manejo de celdas combinadas)
      this._escribirCelda(fila, s3.columnas.apellidos, estudiante.apellidos || '', true);
      
      // Nombres
      this._escribirCelda(fila, s3.columnas.nombres, estudiante.nombres || '', true);
      
      // Lugar de nacimiento
      this._escribirCelda(fila, s3.columnas.lugarNacimiento, estudiante.lugarNacimiento || '');
      
      // Entidad federal de nacimiento
      this._escribirCelda(fila, s3.columnas.entidadFederal, estudiante.estadoNacimiento || '');
      
      // Sexo
      this._escribirCelda(fila, s3.columnas.sexo, estudiante.sexo || '');
      
      // Fecha de nacimiento
      const fechaNac = estudiante.fechaNacimiento 
        ? this._parsearFecha(estudiante.fechaNacimiento) 
        : null;
      
      if (fechaNac) {
        this._escribirCelda(fila, s3.columnas.fechaDia, fechaNac.dia);
        this._escribirCelda(fila, s3.columnas.fechaMes, fechaNac.mes);
        this._escribirCelda(fila, s3.columnas.fechaAño, fechaNac.año);
      }

      // ── Sección IV: Notas por área ──
      const notas = estudiante.notas || {};
      let totalAreas = 0;
      let sumaNotas = 0;

      for (const [area, columna] of Object.entries(s4.areasFormacion)) {
        const nota = notas[area];
        
        if (nota !== undefined && nota !== null) {
          this._escribirCelda(fila, columna, nota);
          totalAreas++;
          sumaNotas += Number(nota);
        }
      }

      // Grupo (si aplica)
      this._escribirCelda(fila, s4.areasFormacion.GRUPO, estudiante.grupo || '');

      // ── Calcular estadísticas ──
      inscritos++;
      
      if (estudiante.estado === 'NO CURSANTE') {
        noCursantes++;
      } else if (totalAreas > 0 && sumaNotas / totalAreas >= 10) {
        aprobados++;
      } else if (totalAreas > 0) {
        noAprobados++;
      }
    });

    // ── Escribir totales ──
    const totales = s4.totales;
    this._escribirCelda(totales.inscritos.fila, totales.inscritos.columna, inscritos);
    this._escribirCelda(totales.inasistentes.fila, totales.inasistentes.columna, 0); // Calcular si hay datos
    this._escribirCelda(totales.aprobados.fila, totales.aprobados.columna, aprobados);
    this._escribirCelda(totales.noAprobados.fila, totales.noAprobados.columna, noAprobados);
    this._escribirCelda(totales.noCursantes.fila, totales.noCursantes.columna, noCursantes);
  }

  /**
   * Sección V: Profesores por Áreas
   */
  _llenarSeccion5(data) {
    const seccion = CELLS_MAP.seccion5;
    const profesores = data.profesores || {};
    const columnas = seccion.columnas;

    for (const [area, fila] of Object.entries(seccion.profesores)) {
      const profesor = profesores[area];
      
      if (profesor) {
        // Nombre del profesor
        this._escribirCelda(
          fila, 
          columnas.nombreProfesor, 
          profesor.nombre || ''
        );
        
        // Cédula del profesor
        this._escribirCelda(
          fila, 
          columnas.cedulaProfesor, 
          profesor.cedula || ''
        );
        
        // Firma NO se llena automáticamente (requiere firma física)
      }
    }
  }

  /**
   * Sección VI: Identificación del Curso
   */
  _llenarSeccion6(data) {
    const seccion = CELLS_MAP.seccion6;
    
    for (const [key, config] of Object.entries(seccion)) {
      this._escribirCelda(
        config.fila,
        config.columna,
        config.valor(data)
      );
    }
  }

  /**
   * Secciones VII-IX: Observaciones, Fechas, Firmas
   */
  _llenarSeccionesFinales(data) {
    const seccion = CELLS_MAP.seccionesFinal;
    
    for (const [key, config] of Object.entries(seccion)) {
      const valor = config.valor(data);
      if (valor) {
        // Para observaciones, puede ser texto largo
        if (key === 'observaciones') {
          this._escribirCeldaLargo(config.fila, config.columnaInicio, valor);
        } else {
          this._escribirCelda(config.fila, config.columnaInicio, valor);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Escribir en una celda respetando el formato existente
   */
  _escribirCelda(fila, columna, valor, esTextoLargo = false) {
    try {
      const celda = this.worksheet.getCell(fila, columna);
      
      // MANTENER el formato existente de la celda
      // Solo modificamos el valor
      celda.value = valor || '';
      
      // NO modificamos: fuente, tamaño, bordes, fondo, alineación
      // Esto preserva el formato original de la plantilla
      
    } catch (error) {
      // Silenciar errores de celdas fuera de rango
      // (puede pasar si la plantilla tiene menos columnas)
    }
  }

  /**
   * Escribir texto largo que puede abarcar varias celdas combinadas
   */
  _escribirCeldaLargo(fila, columnaInicio, texto) {
    try {
      const celda = this.worksheet.getCell(fila, columnaInicio);
      celda.value = texto || '';
    } catch (error) {
      // Silenciar
    }
  }

  /**
   * Parsear fecha en diferentes formatos
   */
  _parsearFecha(fecha) {
    if (!fecha) return null;
    
    let fechaObj;
    
    // Si es string
    if (typeof fecha === 'string') {
      // Formato ISO: 2005-03-15
      if (fecha.includes('-')) {
        fechaObj = new Date(fecha);
      }
      // Formato DD/MM/YYYY
      else if (fecha.includes('/')) {
        const [dia, mes, año] = fecha.split('/');
        fechaObj = new Date(año, mes - 1, dia);
      }
    }
    // Si es Date object
    else if (fecha instanceof Date) {
      fechaObj = fecha;
    }

    if (isNaN(fechaObj?.getTime())) return null;

    return {
      dia: String(fechaObj.getDate()).padStart(2, '0'),
      mes: String(fechaObj.getMonth() + 1).padStart(2, '0'),
      año: fechaObj.getFullYear()
    };
  }

  /**
   * Configurar página para impresión en hoja oficio
   * Tamaño: 216mm x 356mm (Oficio / Legal)
   */
  _configurarPaginaOficio() {
    const pageSetup = this.worksheet.pageSetup;
    
    // Tamaño de hoja oficio (legal)
    pageSetup.paperSize = 5; // 5 = Legal en ExcelJS
    
    // Orientación horizontal (landscape) - típico para este formato
    pageSetup.orientation = 'landscape';
    
    // Márgenes en pulgadas
    pageSetup.margins = {
      left: 0.5,
      right: 0.5,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3
    };
    
    // Ajustar a una página
    pageSetup.fitToPage = true;
    pageSetup.fitToWidth = 1;
    pageSetup.fitToHeight = 1;
    
    // Escala (si no cabe en una página)
    // pageSetup.scale = 85;
    
    // Área de impresión
    this.worksheet.printArea = 'A1:BN70'; // Ajustar según tamaño real
  }
}


// ═══════════════════════════════════════════════════════════════════════
// FUNCIÓN DE EXPORTACIÓN - Interface pública
// ═══════════════════════════════════════════════════════════════════════

/**
 * Genera el Resumen Final 31059
 * 
 * @param {Object} datosCompletos - Objeto con toda la información
 * @param {string} datosCompletos.añoEscolar - Ej: "2024-2025"
 * @param {string} datosCompletos.tipoEvaluacion - "FINAL", "RECUPERATIVO"
 * @param {string} datosCompletos.mesAño - "JULIO 2025"
 * @param {Object} datosCompletos.institucion - Datos del plantel
 * @param {string} datosCompletos.añoCursado - "PRIMERO", "SEGUNDO", etc.
 * @param {string} datosCompletos.seccion - "A", "B", etc.
 * @param {Array} datosCompletos.estudiantes - Lista de estudiantes con notas
 * @param {Object} datosCompletos.profesores - Profesores por área
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Buffer>} Buffer del Excel
 */
async function generateExcel31059(datosCompletos, options = {}) {
  const generador = new Generador31059();
  return await generador.generar(datosCompletos, options);
}


// ═══════════════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR: Preparar datos desde la BD
// Convierte el formato de tu BD al formato esperado
// ═══════════════════════════════════════════════════════════════════════

/**
 * Prepara los datos desde tu base de datos al formato requerido
 * @param {Object} params - Parámetros de la consulta
 * @param {string} params.año - Año escolar seleccionado
 * @param {string} params.tipo - Tipo de cédula (CE o CI)
 * @param {string} params.seccion - Sección (A, B, C...)
 * @returns {Object} Datos formateados para generateExcel31059
 */
function prepararDatosDesdeBD({ año, tipo, seccion }, datosBD) {
  const {
    institucion,
    estudiantes,
    materias,
    notas,
    profesores,
    añoEscolarActivo
  } = datosBD;

  // Mapeo de nombres de materia a códigos del formato
  const mapaMaterias = {
    'Castellano': 'CA',
    'Castellano y Literatura': 'CA',
    'Inglés': 'ILE',
    'Inglés y otras Lenguas Extranjeras': 'ILE',
    'Matemáticas': 'MA',
    'Educación Física': 'EF',
    'Educación Física, Deporte y Recreación': 'EF',
    'Arte y Patrimonio': 'AP',
    'Arte y Patrimonio Cultural': 'AP',
    'Ciencias Naturales': 'CN',
    'Biología': 'CN',
    'Geografía, Historia y Ciudadanía': 'GHC',
    'Geografía de Venezuela': 'GHC',
    'Historia de Venezuela': 'GHC',
    'Orientación y Convivencia': 'OC',
    'Participación en Grupos de Creación, Recreación y Producción': 'PGCRP'
  };

  // Transformar estudiantes
  const estudiantesFormateados = estudiantes
    .filter(e => {
      // Filtrar por tipo de documento
      if (tipo === 'CE') return (e.cedulaEscolar && e.cedulaEscolar.length > 0);
      return (e.cedula && e.cedula.length <= 10);
    })
    .map(est => {
      // Obtener notas del estudiante
      const notasEstudiante = notas.filter(n => n.estudianteId === est.id);
      
      // Crear objeto de notas por área
      const notasPorArea = {};
      notasEstudiante.forEach(nota => {
        const materia = materias.find(m => m.id === nota.materiaId);
        if (materia) {
          const codigo = mapaMaterias[materia.nombre] || 
                         Object.keys(mapaMaterias).find(k => 
                           materia.nombre.toLowerCase().includes(k.toLowerCase())
                         );
          if (codigo) {
            notasPorArea[codigo] = nota.definitiva;
          }
        }
      });

      return {
        cedulaEscolar: tipo === 'CE' ? est.cedulaEscolar : '',
        apellidos: est.apellidos || est.apellido,
        nombres: est.nombres || est.nombre,
        lugarNacimiento: est.lugarNacimiento || est.municipioNacimiento,
        estadoNacimiento: est.estadoNacimiento,
        sexo: est.sexo === 'M' ? 'M' : est.sexo === 'F' ? 'F' : '',
        fechaNacimiento: est.fechaNacimiento,
        notas: notasPorArea,
        grupo: est.grupo || '',
        estado: est.estado || 'REGULAR'
      };
    });

  // Transformar profesores
  const profesoresFormateados = {};
  profesores.forEach(prof => {
    const codigo = mapaMaterias[prof.materiaNombre];
    if (codigo) {
      profesoresFormateados[codigo] = {
        nombre: `${prof.apellidos}, ${prof.nombres}`,
        cedula: prof.cedula
      };
    }
  });

  // Mapear año cursado
  const mapaAño = {
    '1er Año': 'PRIMERO',
    '2do Año': 'SEGUNDO',
    '3er Año': 'TERCERO',
    '4to Año': 'CUARTO',
    '5to Año': 'QUINTO',
    '6to Año': 'SEXTO'
  };

  return {
    añoEscolar: añoEscolarActivo || '2024-2025',
    tipoEvaluacion: 'FINAL',
    mesAño: new Date().toLocaleDateString('es-VE', { month: 'long', year: 'numeric' }).toUpperCase(),
    institucion: {
      codigo: institucion.codigo,
      denominacion: institucion.denominacion || institucion.nombre,
      direccion: institucion.direccion,
      telefono: institucion.telefono,
      municipio: institucion.municipio,
      estado: institucion.estado,
      cdcee: institucion.cdcee,
      director: institucion.directorNombre,
      cedulaDirector: institucion.directorCedula
    },
    añoCursado: mapaAño[año] || año,
    seccion: seccion || 'A',
    estudiantes: estudiantesFormateados,
    profesores: profesoresFormateados,
    observaciones: '',
    fechaRemision: '',
    fechaRecepcion: ''
  };
}


module.exports = {
  generateExcel31059,
  prepararDatosDesdeBD,
  Generador31059,
  CELLS_MAP  // Exportar para que puedas ajustar las coordenadas
};
