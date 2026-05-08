-- ============================================================
-- EDUGESTIÓN - ESQUEMA DE BASE DE DATOS MARIADB
-- ============================================================

CREATE DATABASE IF NOT EXISTS edugestion_siga;
USE edugestion_siga;

-- 1. Configuraciones Globales
CREATE TABLE configuraciones (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion VARCHAR(255)
);

INSERT INTO configuraciones (clave, valor, descripcion) VALUES 
('institucion_nombre', 'Complejo Educativo "La Paz"', 'Nombre oficial del plantel'),
('institucion_codigo', 'S2382D2307', 'Código MECD / Estadístico'),
('institucion_dea', '6565630', 'Código DEA de la institución'),
('institucion_direccion', 'AV. Principal Sector San Benito La Paz', 'Dirección física'),
('institucion_telefono', '0412-1285444', 'Teléfono institucional'),
('institucion_municipio', 'Jesús Enrique Lossada', 'Municipio escolar'),
('institucion_entidad_federal', 'Zulia', 'Estado / Entidad Federal'),
('institucion_director', 'YENNY GONALEZ', 'Nombre del Director(a)'),
('institucion_director_cedula', 'V16298584', 'Cédula del Director(a)'),
('periodo_escolar_activo', '2024-2025', 'Año escolar en curso');

-- 2. Años Escolares
CREATE TABLE periodos_escolares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL, -- Ej: 2024-2025
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT FALSE
);

-- 3. Grados y Secciones
CREATE TABLE grados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL -- Ej: 1er Año, 2do Año
);

CREATE TABLE secciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grado_id INT,
    nombre CHAR(1) NOT NULL, -- Ej: A, B, C
    capacidad_maxima INT DEFAULT 40,
    FOREIGN KEY (grado_id) REFERENCES grados(id)
);

-- 4. Usuarios y Personal
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    rol ENUM('administrador', 'ctrl_estudios', 'secretaria', 'coord_pedagogico', 'docente') NOT NULL,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- 5. Estudiantes
CREATE TABLE estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(25) UNIQUE NOT NULL, -- Soporta CI y CE
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    fecha_nacimiento DATE,
    sexo ENUM('M', 'F'),
    lugar_nacimiento VARCHAR(255),
    entidad_federal VARCHAR(100),
    direccion_habitacion TEXT,
    plantel_procedencia VARCHAR(255),
    estado ENUM('activo', 'retirado', 'egresado', 'reprobado') DEFAULT 'activo'
);

-- 6. Inscripciones
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT,
    seccion_id INT,
    periodo_id INT,
    fecha_inscripcion DATE,
    repite BOOLEAN DEFAULT FALSE,
    materias_pendientes BOOLEAN DEFAULT FALSE,
    status ENUM('ACTIVO', 'RETIRADO', 'EGRESADO') DEFAULT 'ACTIVO',
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (seccion_id) REFERENCES secciones(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_escolares(id)
);

-- 7. Asignaturas y Calificaciones
CREATE TABLE asignaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    codigo_mppe VARCHAR(20), -- Código oficial del Ministerio
    grado_id INT,
    FOREIGN KEY (grado_id) REFERENCES grados(id)
);

CREATE TABLE calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT,
    asignatura_id INT,
    periodo_id INT,
    lapso TINYINT, -- 1, 2, 3 o 0 para Final
    nota_1 DECIMAL(4,2),
    nota_2 DECIMAL(4,2),
    nota_3 DECIMAL(4,2),
    definitiva DECIMAL(4,2),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_escolares(id)
);

-- 9. Planes de Estudio y Conversiones
CREATE TABLE planes_estudio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    mencion VARCHAR(100),
    credential VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE malla_curricular (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT,
    asignatura_nombre VARCHAR(255) NOT NULL,
    año TINYINT NOT NULL,
    horas_semanales TINYINT,
    FOREIGN KEY (plan_id) REFERENCES planes_estudio(id)
);

CREATE TABLE conversiones_asignaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_origen_id INT,
    asignatura_origen VARCHAR(255),
    plan_destino_id INT,
    asignatura_destino VARCHAR(255),
    regla_conversion TEXT,
    FOREIGN KEY (plan_origen_id) REFERENCES planes_estudio(id),
    FOREIGN KEY (plan_destino_id) REFERENCES planes_estudio(id)
);

-- 10. Representantes y Datos Extendidos
CREATE TABLE representantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    parentesco VARCHAR(50),
    telefono VARCHAR(50),
    email VARCHAR(150),
    direccion TEXT
);

ALTER TABLE estudiantes ADD COLUMN representante_id INT;
ALTER TABLE estudiantes ADD FOREIGN KEY (representante_id) REFERENCES representantes(id);
ALTER TABLE estudiantes ADD COLUMN cedula_escolar VARCHAR(25);

-- 11. Nómina de Personal
CREATE TABLE personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    tipo ENUM('docente', 'administrativo', 'obrero') NOT NULL,
    cargo VARCHAR(100),
    area_atencion VARCHAR(255),
    grado_asignado VARCHAR(50),
    seccion_asignada VARCHAR(10),
    materia_especialidad VARCHAR(150),
    estado ENUM('activo', 'retirado', 'jubilado') DEFAULT 'activo'
);
