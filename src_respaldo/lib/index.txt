// ============================================================
// ROUTE PATHS
// ============================================================
export const ROUTE_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/',
  // Configuración (Ctrl Estudios)
  PLANTEL_DATOS: '/config/plantel',
  PERIODO_ESCOLAR: '/config/periodo',
  TIPOS_EVALUACION: '/config/evaluacion',
  PLANES_ESTUDIO: '/config/planes',
  GRADOS_SECCIONES: '/config/grados',
  AREAS_ACADEMICAS: '/config/areas',
  ASIGNATURAS: '/config/asignaturas',
  PRELACIONES: '/config/prelaciones',
  CRONOGRAMA: '/config/cronograma',
  RESOLUCIONES: '/config/resoluciones',
  MAESTRO_TABLAS: '/config/maestro',
  AUTO_CONFIG: '/config/automatizacion',
  USUARIOS: '/config/usuarios',
  NOMINA_PERSONAL: '/config/nomina-personal',
  // Registro (Secretaría)
  PRE_INSCRIPCIONES: '/registro/pre-inscripciones',
  INSCRIPCION_MANUAL: '/registro/manual',
  CAMBIO_SECCION: '/registro/seccion',
  VERIF_DOCS: '/registro/documentos',
  BIO_REGISTRO: '/registro/biometrico',
  CE_ID_CARDS: '/registro/cedula-escolar',
  RETIROS: '/registro/retiros',
  // Académico (Docentes / Coordinación)
  NOTAS_CARGA: '/academico/notas',
  ASISTENCIA: '/academico/asistencia',
  DOC_HISTORIAL: '/academico/historial-docente',
  MIS_SECCIONES: '/academico/secciones',
  VALIDAR_LOTES: '/academico/validar-notas',
  RIESGO_ACADEMICO: '/academico/riesgo',
  ASIGNAR_DOCENTES: '/academico/asignaciones',
  // Reportes
  BOLETINES: '/reportes/boletines',
  CUADRO_HONOR: '/reportes/honor',
  ESTADISTICAS: '/reportes/estadisticas',
  REPORTES_MINISTERIO: '/reportes/mppe',
  CXC_REPORTES: '/reportes/finanzas',
  SEMAFORO_RIESGO: '/riesgo-pedagogico',
  HISTORICO_ESTUDIANTES: '/historico-estudiantes',
  // Otros
  CONFIGURACION: '/configuracion',
  ESTUDIANTES: '/estudiantes',
};

// ============================================================
// TYPES
// ============================================================
export type Rol = 'administrador' | 'ctrl_estudios' | 'secretaria' | 'coord_pedagogico' | 'docente';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  rol: Rol;
  email: string;
  avatar?: string;
}

export interface AñoEscolar {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface Grado {
  id: string;
  nombre: string;
  nivel: 'primaria' | 'secundaria';
  secciones: string[];
}

export interface Estudiante {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  genero: 'M' | 'F';
  grado: string;
  seccion: string;
  añoEscolar: string;
  estado: 'activo' | 'retirado' | 'egresado' | 'reprobado';
  observacion?: string;
  representante?: {
    nombre: string;
    apellido: string;
    cedula: string;
    parentesco: string;
    telefono: string;
    email?: string;
    direccion: string;
  };
}


export interface Representante {
  nombre: string;
  apellido: string;
  cedula: string;
  parentesco: string;
  telefono: string;
  email?: string;
  direccion: string;
}
export interface AsignacionDocente {
    materiaId: string;
    materiaNombre: string;
    grado: string;
    secciones: string[];
}

export interface Docente {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  materias: string[];
  grados: string[];
  telefono: string;
  email: string;
  estado: 'activo' | 'retirado' | 'jubilado';
  tipoContrato: 'fijo' | 'contratado' | 'suplente';
}

export interface Personal {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  tipo: 'docente' | 'administrativo' | 'obrero';
  cargo: string;
  area?: string;
  estado: 'activo' | 'retirado' | 'jubilado';
}

export interface Materia {
  id: string;
  nombre: string;
  codigo: string;
  gradoId: string;
  docenteId: string;
  horasSemanales: number;
}

export interface Nota {
  estudianteId: string;
  materiaId: string;
  lapso: 1 | 2 | 3;
  nota1: number;
  nota2: number;
  nota3: number;
  definitiva: number;
  estado: 'aprobado' | 'reprobado' | 'pendiente';
}

export interface Inscripcion {
  id: string;
  estudianteId: string;
  añoEscolarId: string;
  gradoId: string;
  seccion: string;
  fecha: string;
  estado: 'pendiente' | 'confirmada' | 'rechazada';
  observaciones?: string;
}

export interface Documento {
  id: string;
  tipo: 'constancia_estudio' | 'certificado' | 'acta_calificaciones' | 'inscripcion' | 'solvencia';
  estudianteId: string;
  fechaEmision: string;
  emitidoPor: string;
  estado: 'emitido' | 'anulado';
}

export interface AsistenciaRegistro {
  estudianteId: string;
  fecha: string;
  estado: 'presente' | 'ausente' | 'justificado' | 'tardanza';
  observacion?: string;
}

export interface Planificacion {
  id: string;
  docenteId: string;
  materiaId: string;
  gradoId: string;
  semana: string;
  contenido: string;
  estrategias: string;
  recursos: string;
  evaluacion: string;
  estado: 'pendiente' | 'revisado' | 'aprobado';
}

// ============================================================
// CONSTANTS
// ============================================================
export const LAPSOS = ['1er Lapso', '2do Lapso', '3er Lapso'];

export const GRADOS_PRIMARIA = [
  '1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado',
];

export const GRADOS_SECUNDARIA = [
  '1er Año', '2do Año', '3er Año', '4to Año', '5to Año',
];

export const SECCIONES = ['A', 'B', 'C', 'D', 'E'];

export const ROL_LABELS: Record<Rol, string> = {
  administrador: 'Admin del Sistema',
  ctrl_estudios: 'Control de Estudios',
  secretaria: 'Secretaría de Control',
  coord_pedagogico: 'Coord. Pedagógico',
  docente: 'Docente',
};

export const ROL_COLORS: Record<Rol, string> = {
  administrador: 'bg-black text-white',
  ctrl_estudios: 'bg-primary text-primary-foreground',
  secretaria: 'bg-chart-4/20 text-chart-4',
  coord_pedagogico: 'bg-accent text-accent-foreground',
  docente: 'bg-chart-3/20 text-chart-3',
};

export const ESTADO_ESTUDIANTE_LABELS: Record<Estudiante['estado'], string> = {
  activo: 'Activo',
  retirado: 'Retirado',
  egresado: 'Egresado',
  reprobado: 'Reprobado',
};

export const ESTADO_COLORS: Record<string, string> = {
  activo: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  retirado: 'bg-destructive/15 text-destructive border-destructive/30',
  egresado: 'bg-primary/15 text-primary border-primary/30',
  reprobado: 'bg-destructive/15 text-destructive border-destructive/30',
  aprobado: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  pendiente: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  confirmada: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  rechazada: 'bg-destructive/15 text-destructive border-destructive/30',
};

export function calcularDefinitiva(n1: number, n2: number, n3: number): number {
  return Number(((n1 + n2 + n3) / 3).toFixed(2));
}

export const estaAprobado = (definitiva: number): boolean => {
  return definitiva >= 10;
}

export function formatearCedula(cedula: string): string {
  return `V-${cedula}`;
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}
