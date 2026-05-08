/**
 * ═══════════════════════════════════════════════════════════════════════
 * MAPA DE CELDAS - Plantilla 31059
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * ⚠️ IMPORTANTE: Estas coordenadas son ESTIMADAS basadas en el texto
 * de tu plantilla. DEBES verificarlas con tu plantilla real.
 * 
 * Cómo verificar:
 * 1. Abre la plantilla en Excel
 * 2. Haz clic en una celda donde deba ir un dato
 * 3. Mira la referencia (ej: AH1, P4, etc.)
 * 4. Actualiza este archivo con las coordenadas correctas
 * 
 * Las columnas se numeran: A=1, B=2, C=3, ... Z=26, AA=27, AB=28, ...
 * ═══════════════════════════════════════════════════════════════════════
 */

// Utilidad: Convertir letra de columna a número
// A=1, B=2, ..., Z=26, AA=27, AB=28, etc.
function colNum(letra: string): number {
  let resultado = 0;
  for (let i = 0; i < letra.length; i++) {
    resultado = resultado * 26 + (letra.charCodeAt(i) - 64);
  }
  return resultado;
}

export const CELLS_MAP = {

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN I: AÑO ESCOLAR
  // ──────────────────────────────────────────────────────────────────
  seccion1: {
    añoEscolar: {
      fila: 1,
      columna: colNum('AH'),    // Ajustar: donde se escribe "2024-2025"
    },
    tipoEvaluacion: {
      fila: 2,
      columna: colNum('AX'),    // Ajustar: donde se escribe "FINAL"
    },
    mesAño: {
      fila: 2,
      columna: colNum('BN'),    // Ajustar: donde se escribe "JULIO 2025"
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN II: DATOS DE LA INSTITUCIÓN
  // ──────────────────────────────────────────────────────────────────
  seccion2: {
    codigoInstitucion: {
      fila: 4,
      columna: colNum('T'),     // Ajustar
    },
    denominacion: {
      fila: 4,
      columna: colNum('AP'),    // Ajustar
    },
    direccion: {
      fila: 5,
      columna: colNum('K'),     // Ajustar
    },
    telefono: {
      fila: 5,
      columna: colNum('AW'),    // Ajustar
    },
    municipio: {
      fila: 6,
      columna: colNum('K'),     // Ajustar
    },
    entidadFederal: {
      fila: 6,
      columna: colNum('AI'),    // Ajustar
    },
    cdcee: {
      fila: 6,
      columna: colNum('AS'),    // Ajustar
    },
    director: {
      fila: 7,
      columna: colNum('K'),     // Ajustar
    },
    cedulaDirector: {
      fila: 7,
      columna: colNum('AW'),    // Ajustar
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN III: DATOS DE ESTUDIANTES (filas 13 a 43)
  // ──────────────────────────────────────────────────────────────────
  estudiantes: {
    filaInicio: 13,
    filaFin: 43,
    columnas: {
      numero: colNum('A'),
      cedulaEscolar: colNum('B'),
      apellidos: colNum('P'),
      nombres: colNum('Y'),
      lugarNacimiento: colNum('AH'),
      entidadFederalNac: colNum('AO'),
      sexo: colNum('AP'),
      fechaDia: colNum('AR'),
      fechaMes: colNum('AT'),
      fechaAño: colNum('AV'),
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN IV: NOTAS - ÁREAS DE FORMACIÓN
  // ──────────────────────────────────────────────────────────────────
  notas: {
    filaInicio: 13,
    filaFin: 43,
    areas: {
      CA: colNum('AX'),     // Castellano
      ILE: colNum('AZ'),    // Inglés
      MA: colNum('BB'),     // Matemáticas
      EF: colNum('BD'),     // Educación Física
      AP: colNum('BF'),     // Arte y Patrimonio
      CN: colNum('BH'),     // Ciencias Naturales
      GHC: colNum('BJ'),    // Geografía, Historia y Ciudadanía
      OC: colNum('BL'),     // Orientación y Convivencia
      PGCRP: colNum('BN'),  // Participación Grupos
      GRUPO: colNum('BP'),  // Grupo
    },
    totales: {
      inscritos: { fila: 48, columna: colNum('BC') },
      inasistentes: { fila: 49, columna: colNum('BC') },
      aprobados: { fila: 50, columna: colNum('BC') },
      noAprobados: { fila: 51, columna: colNum('BC') },
      noCursantes: { fila: 52, columna: colNum('BC') },
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN V: PROFESORES
  // ──────────────────────────────────────────────────────────────────
  profesores: {
    filas: {
      CA: 55,
      ILE: 56,
      MA: 57,
      EF: 58,
      AP: 59,
      CN: 60,
      GHC: 61,
      OC: 62,
      PG: 63,
    },
    columnas: {
      nombre: colNum('Y'),
      cedula: colNum('AQ'),
      // firma: no se llena
    }
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIÓN VI: IDENTIFICACIÓN DEL CURSO
  // ──────────────────────────────────────────────────────────────────
  curso: {
    planEstudio: { fila: 54, columna: colNum('AU') },
    codigo: { fila: 56, columna: colNum('AU') },
    añoCursado: { fila: 58, columna: colNum('AU') },
    seccion: { fila: 60, columna: colNum('AU') },
    numEstudiantesSeccion: { fila: 62, columna: colNum('AU') },
    numEstudiantesPagina: { fila: 62, columna: colNum('BM') },
  },

  // ──────────────────────────────────────────────────────────────────
  // SECCIONES FINALES
  // ──────────────────────────────────────────────────────────────────
  finales: {
    observaciones: { fila: 64, columna: colNum('P') },
    fechaRemision: { fila: 65, columna: colNum('P') },
    fechaRecepcion: { fila: 65, columna: colNum('BJ') },
    directorNombre: { fila: 67, columna: colNum('P') },
    directorCedula: { fila: 68, columna: colNum('P') },
  }
};

// Exportar utilidad por si la necesitas
export { colNum };
