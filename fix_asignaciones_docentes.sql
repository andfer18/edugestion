-- ============================================================
-- SCRIPT PARA CORREGIR Y MIGRACIÓN DE TABLA ASIGNACIONES_DOCENTES
-- Ejecuta este script en MariaDB/MySQL
-- ============================================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE LA TABLA
SELECT '=== ESTRUCTURA ACTUAL DE asignaciones_docentes ===' AS mensaje;
DESCRIBE asignaciones_docentes;

-- 2. VER DATOS ACTUALES
SELECT '=== DATOS ACTUALES ===' AS mensaje;
SELECT * FROM asignaciones_docentes LIMIT 20;

-- 3. CONTAR REGISTROS
SELECT '=== CONTEO DE REGISTROS ===' AS mensaje;
SELECT COUNT(*) AS total_registros FROM asignaciones_docentes;

-- 4. OPCIÓN A: Si la tabla tiene la estructura INCORRECTA (vieja con cedula, grado_asignado)
-- Esta estructura NO permite guardar el período escolar y tiene conflictos

-- Primero verificamos qué estructura tiene:
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'edugestion_siga'
  AND TABLE_NAME = 'asignaciones_docentes'
ORDER BY ORDINAL_POSITION;

-- Si tiene 'cedula' y 'materia_especialidad',我们需要 migrar a la nueva estructura

-- 5. MIGRACIÓN A LA NUEVA ESTRUCTURA (con periodo_id)
-- Primero hacemos backup de los datos actuales
CREATE TABLE IF NOT EXISTS asignaciones_docentes_backup AS
SELECT * FROM asignaciones_docentes;

-- 6. Crear la nueva tabla con la estructura correcta
DROP TABLE IF EXISTS asignaciones_docentes;

CREATE TABLE asignaciones_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periodo_id INT NOT NULL,
    grado_id INT NOT NULL,
    seccion VARCHAR(10) NOT NULL,
    materia_codigo VARCHAR(10) NOT NULL,
    personal_cedula VARCHAR(20) NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_asignacion (periodo_id, grado_id, seccion, materia_codigo),
    FOREIGN KEY (personal_cedula) REFERENCES personal(cedula) ON DELETE CASCADE
);

-- 7. Insertar datos desde el backup
-- Obtener el periodo activo
INSERT INTO asignaciones_docentes (periodo_id, grado_id, seccion, materia_codigo, personal_cedula)
SELECT
    (SELECT COALESCE(id, 2) FROM periodos_escolares WHERE activo = 1 LIMIT 1) AS periodo_id,
    grado_asignado AS grado_id,
    seccion_asignada AS seccion,
    materia_especialidad AS materia_codigo,
    cedula AS personal_cedula
FROM asignaciones_docentes_backup
WHERE grado_asignado IS NOT NULL AND materia_especialidad IS NOT NULL;

-- 8. Verificar la migración
SELECT '=== DATOS MIGRADOS ===' AS mensaje;
SELECT COUNT(*) AS total_migrados FROM asignaciones_docentes;

-- 9. Verificar que los datos están correctos
SELECT ad.*, p.nombres, p.apellidos, m.nombre AS materia
FROM asignaciones_docentes ad
LEFT JOIN personal p ON ad.personal_cedula = p.cedula
LIMIT 20;

-- 10. Verificar asignaciones de Lilian Gonzalez (cedula 14356535)
SELECT '=== ASIGNACIONES DE LILIAN GONZALEZ ===' AS mensaje;
SELECT ad.*, p.nombres, p.apellidos
FROM asignaciones_docentes ad
LEFT JOIN personal p ON ad.personal_cedula = p.cedula
WHERE ad.personal_cedula = '14356535';

-- 11. Crear índice adicional si no existe
SHOW INDEX FROM asignaciones_docentes;

-- 12. Limpiar backup después de verificar
-- DROP TABLE IF EXISTS asignaciones_docentes_backup;

-- ============================================================
-- NOTA IMPORTANTE:
-- La nueva estructura permite que un docente imparta VARIAS materias
-- porque la unique key es (periodo_id, grado_id, seccion, materia_codigo)
-- NO incluye personal_cedula, así que cada materia puede tener un docente diferente
-- ============================================================