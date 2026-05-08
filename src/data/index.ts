import type { Estudiante, Docente, Materia, Nota, Inscripcion, AsistenciaRegistro, Planificacion, AñoEscolar, Usuario, Personal } from '@/lib/index';
import docentesReales from './docentesReales.json';
import personalReales from './personalReales.json';
import { estudiantesRealesCargados } from './realData';
import currentNotas from './current_notas.json';
// ============================================================
// AÑOS ESCOLARES
// ============================================================
export const añosEscolares: AñoEscolar[] = [
  { id: 'ae-2025', nombre: '2024-2025', fechaInicio: '2024-09-16', fechaFin: '2025-07-15', activo: true },
  { id: 'ae-2024', nombre: '2023-2024', fechaInicio: '2023-09-18', fechaFin: '2024-07-12', activo: false },
  { id: 'ae-2023', nombre: '2022-2023', fechaInicio: '2022-09-19', fechaFin: '2023-07-14', activo: false },
];
// ============================================================
// USUARIOS DEL SISTEMA
// ============================================================
export const usuarios: Usuario[] = [
  { id: 'u0', nombre: 'Admin', apellido: 'Sistema', cedula: '0000000', rol: 'administrador', email: 'admin@ueejemplo.edu.ve' },
  { id: 'u1', nombre: 'María', apellido: 'González', cedula: '8456321', rol: 'ctrl_estudios', email: 'directora@ueejemplo.edu.ve' },
  { id: 'u2', nombre: 'Carlos', apellido: 'Rodríguez', cedula: '12345678', rol: 'coord_pedagogico', email: 'coordinador@ueejemplo.edu.ve' },
  { id: 'u3', nombre: 'Ana', apellido: 'Martínez', cedula: '15678901', rol: 'docente', email: 'amartinez@ueejemplo.edu.ve' },
];
// ============================================================
// DOCENTES
// ============================================================
export const docentes: Docente[] = [
  ...(docentesReales as any[]),
];
// ============================================================
// PERSONAL GENERAL
// ============================================================
export const personalGeneral: Personal[] = [
  ...(personalReales as any[]),
];
// ============================================================
// ESTUDIANTES
// ============================================================
export const estudiantes: Estudiante[] = [
  ...estudiantesRealesCargados,
];
// ============================================================
// MATERIAS (IDs NORMALIZADOS)
// ============================================================
export const materias: Materia[] = [
  { id: 'm-ca', nombre: 'Castellano', codigo: 'CA', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 4 },
  { id: 'm-io', nombre: 'Inglés y otras Lenguas', codigo: 'IO', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 4 },
  { id: 'm-ma', nombre: 'Matemáticas', codigo: 'MA', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 4 },
  { id: 'm-ef', nombre: 'Educación Física', codigo: 'EF', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 2 },
  { id: 'm-ap', nombre: 'Arte y Patrimonio', codigo: 'AP', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 2 },
  { id: 'm-cn', nombre: 'Ciencias Naturales', codigo: 'CN', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 4 },
  { id: 'm-gh', nombre: 'Geografía, Historia y Ciudadanía', codigo: 'GH', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 4 },
  { id: 'm-oc', nombre: 'Orientación y Convivencia', codigo: 'OC', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 2 },
  { id: 'm-pg', nombre: 'Participación en Grupos CRP', codigo: 'PG', gradoId: '1er Año', docenteId: 'd1', horasSemanales: 2 },
];
// ============================================================
// NOTAS (IMPORTADAS DE BOLETINES 2025-2026)
// ============================================================
// Limitamos a una muestra para el frontend para evitar OOM, pero cargamos el objeto completo en la DB
export const notas: Nota[] = (currentNotas as any[]).slice(0, 1000);
// ============================================================
// INSCRIPCIONES (NÓMINA REAL)
// ============================================================
export const inscripciones: Inscripcion[] = estudiantes.map(s => ({
  id: `i-${s.cedula}`,
  estudianteId: s.id,
  añoEscolarId: 'ae-2025',
  gradoId: s.grado,
  seccion: s.seccion,
  fecha: '2024-09-15',
  estado: 'confirmada'
}));
// ============================================================
// ASISTENCIA
// ============================================================
export const asistencia: AsistenciaRegistro[] = [
  { estudianteId: 'e1', fecha: '2025-04-01', estado: 'presente' },
  { estudianteId: 'e2', fecha: '2025-04-01', estado: 'presente' },
  { estudianteId: 'e3', fecha: '2025-04-01', estado: 'ausente' },
  { estudianteId: 'e4', fecha: '2025-04-01', estado: 'presente' },
  { estudianteId: 'e5', fecha: '2025-04-01', estado: 'tardanza' },
  { estudianteId: 'e6', fecha: '2025-04-01', estado: 'presente' },
  { estudianteId: 'e7', fecha: '2025-04-01', estado: 'justificado', observacion: 'Cita médica' },
  { estudianteId: 'e1', fecha: '2025-04-02', estado: 'presente' },
  { estudianteId: 'e2', fecha: '2025-04-02', estado: 'ausente' },
  { estudianteId: 'e3', fecha: '2025-04-02', estado: 'presente' },
];
// ============================================================
// PLANIFICACIONES
// ============================================================
export const planificaciones: Planificacion[] = [
  {
    id: 'p1', docenteId: 'd1', materiaId: 'm1', gradoId: '1er Año', semana: '2025-03-31',
    contenido: 'Números reales y sus propiedades. Operaciones básicas.',
    estrategias: 'Exposición dialogada, ejercicios en pizarrón, trabajo en equipo',
    recursos: 'Pizarrón, marcadores, libro de matemáticas 1er año, calculadora',
    evaluacion: 'Práctica en clase (20%), Tarea (80%)',
    estado: 'aprobado',
  },
  {
    id: 'p2', docenteId: 'd2', materiaId: 'm2', gradoId: '1er Año', semana: '2025-03-31',
    contenido: 'La oración simple: sujeto y predicado. Tipos de oraciones.',
    estrategias: 'Lectura comprensiva, análisis gramatical, producción escrita',
    recursos: 'Libros de texto, diccionario, cuadernos',
    evaluacion: 'Prueba escrita (40%), Producción textual (60%)',
    estado: 'revisado',
  },
  {
    id: 'p3', docenteId: 'd3', materiaId: 'm3', gradoId: '3er Año', semana: '2025-03-31',
    contenido: 'Célula eucariota: organelos y funciones',
    estrategias: 'Clase magistral, laboratorio virtual, mapas conceptuales',
    recursos: 'Microscopio (laboratorio), modelos celulares, proyector',
    evaluacion: 'Informe de laboratorio (50%), Examen (50%)',
    estado: 'pendiente',
  },
];
// ============================================================
// ESTADÍSTICAS DEL DASHBOARD
// ============================================================
export const estadisticasDashboard = {
  totalEstudiantes: 667,
  estudiantesActivos: 650,
  totalDocentes: 38,
  docentesActivos: 35,
  inscripcionesConfirmadas: 463,
  inscripcionesPendientes: 24,
  promedioGeneral: 14.8,
  porcentajeAsistencia: 91.3,
  reportesGenerados: 156,
  documentosEmitidos: 89,
  gradosPorEstudiantes: [
    { grado: '1er Año', cantidad: 164, aprobados: 140, reprobados: 24 },
    { grado: '2do Año', cantidad: 162, aprobados: 145, reprobados: 17 },
    { grado: '3er Año', cantidad: 125, aprobados: 110, reprobados: 15 },
    { grado: '4to Año', cantidad: 109, aprobados: 98, reprobados: 11 },
    { grado: '5to Año', cantidad: 107, aprobados: 100, reprobados: 7 },
  ],
  asistenciaSemanal: [
    { dia: 'Lun', presentes: 445, ausentes: 26, tardanza: 16 },
    { dia: 'Mar', presentes: 452, ausentes: 19, tardanza: 16 },
    { dia: 'Mié', presentes: 437, ausentes: 34, tardanza: 16 },
    { dia: 'Jue', presentes: 458, ausentes: 13, tardanza: 16 },
    { dia: 'Vie', presentes: 429, ausentes: 42, tardanza: 16 },
  ],
  notasPorLapso: [
    { lapso: '1er Lapso', promedio: 14.2, aprobados: 78, reprobados: 22 },
    { lapso: '2do Lapso', promedio: 14.8, aprobados: 81, reprobados: 19 },
    { lapso: '3er Lapso', promedio: 15.1, aprobados: 84, reprobados: 16 },
  ],
}; 
// ============================================================
// MOMENTOS ACADÉMICOS (para bloqueo de notas/asistencia)
// ============================================================
export const momentosAcademicos: { id: number; nombre: string; estado: 'abierto' | 'cerrado' }[] = [
  { id: 1, nombre: 'Primer Momento', estado: 'abierto' },
  { id: 2, nombre: 'Segundo Momento', estado: 'cerrado' },
  { id: 3, nombre: 'Tercer Momento', estado: 'cerrado' },
];
// ============================================================
// RUTAS DE LA APLICACIÓN
// ============================================================
export const ROUTE_PATHS = {
  DASHBOARD: '/dashboard',
  ESTUDIANTES: '/estudiantes',
  PRE_INSCRIPCIONES: '/pre-inscripciones',
  BOLETINES: '/boletines',
  REPORTES_MINISTERIO: '/reportes-ministerio',
  PLANES_ESTUDIO: '/planes-estudio',
  NOTAS_CARGA: '/notas-carga',
  CUADRO_HONOR: '/cuadro-honor',
  SEMAFORO_RIESGO: '/semaforo-riesgo',
  HISTORICO: '/historico-estudiantes', // <--- AQUÍ ESTÁ LA NUEVA RUTA
};
