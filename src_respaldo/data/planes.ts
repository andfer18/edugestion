export interface AsignaturaPlan {
  nombre: string;
  año: number;
  horasSemanales?: number;
}

export interface PlanEstudio {
  codigo: string;
  nombre: string;
  mencion: string;
  credential: string;
  asignaturas: AsignaturaPlan[];
}

export const planesEstudio: PlanEstudio[] = [
  {
    codigo: '32011',
    nombre: 'Educación Básica (3ra Etapa)',
    mencion: 'No tiene',
    credential: 'Certificado de Educación Básica',
    asignaturas: [
      { nombre: 'Castellano y Literatura', año: 1 },
      { nombre: 'Matemática', año: 1 },
      { nombre: 'Estudios de la Naturaleza', año: 1 },
      { nombre: 'Geografía de Venezuela', año: 1 },
      { nombre: 'Educación Artística', año: 1 },
      { nombre: 'Educación Física', año: 1 },
      { nombre: 'Inglés', año: 1 },
      { nombre: 'Educación para el Trabajo', año: 1 },
      { nombre: 'Castellano y Literatura', año: 2 },
      { nombre: 'Matemática', año: 2 },
      { nombre: 'Biología', año: 2 },
      { nombre: 'Historia de Venezuela', año: 2 },
      { nombre: 'Educación Artística', año: 2 },
      { nombre: 'Educación Física', año: 2 },
      { nombre: 'Inglés', año: 2 },
      { nombre: 'Educación para el Trabajo', año: 2 },
      { nombre: 'Castellano y Literatura', año: 3 },
      { nombre: 'Matemática', año: 3 },
      { nombre: 'Biología', año: 3 },
      { nombre: 'Física', año: 3 },
      { nombre: 'Química', año: 3 },
      { nombre: 'Historia Universal', año: 3 },
      { nombre: 'Cátedra Bolivariana', año: 3 },
      { nombre: 'Geografía de Venezuela', año: 3 },
      { nombre: 'Educación Física', año: 3 },
      { nombre: 'Inglés', año: 3 },
      { nombre: 'Educación para el Trabajo', año: 3 },
    ]
  },
  {
    codigo: '31018',
    nombre: 'Bachillerato Diurno (Ciencias)',
    mencion: 'Ciencias',
    credential: 'Bachiller en Ciencias',
    asignaturas: [
      { nombre: 'Castellano y Literatura', año: 4 },
      { nombre: 'Inglés', año: 4 },
      { nombre: 'Matemática', año: 4 },
      { nombre: 'Biología', año: 4 },
      { nombre: 'Física', año: 4 },
      { nombre: 'Química', año: 4 },
      { nombre: 'Geografía de Venezuela', año: 4 },
      { nombre: 'Dibujo Técnico', año: 4 },
      { nombre: 'Educación Física', año: 4 },
      { nombre: 'Instrucción Premilitar', año: 4 },
      { nombre: 'Castellano y Literatura', año: 5 },
      { nombre: 'Inglés', año: 5 },
      { nombre: 'Matemática', año: 5 },
      { nombre: 'Biología', año: 5 },
      { nombre: 'Física', año: 5 },
      { nombre: 'Química', año: 5 },
      { nombre: 'Ciencias de la Tierra', año: 5 },
      { nombre: 'Filosofía', año: 5 },
      { nombre: 'Educación Física', año: 5 },
      { nombre: 'Instrucción Premilitar', año: 5 },
    ]
  },
  {
    codigo: '31059',
    nombre: 'Educación Media General (EMG)',
    mencion: 'No tiene',
    credential: 'Bachiller en Educación Media General',
    asignaturas: [
      { nombre: 'Castellano', año: 1 },
      { nombre: 'Inglés y otras Lenguas Extranjeras', año: 1 },
      { nombre: 'Matemáticas', año: 1 },
      { nombre: 'Educación Física', año: 1 },
      { nombre: 'Geografía, Historia y Ciudadanía', año: 1 },
      { nombre: 'Arte y Patrimonio', año: 1 },
      { nombre: 'Ciencias Naturales', año: 1 },
      { nombre: 'Orientación y Convivencia', año: 1 },
      { nombre: 'Participación en Grupos de CRP', año: 1 },
      // Repetir para 2do a 5to con variaciones...
    ]
  }
];
