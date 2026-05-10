/**
 * Script de verificación y corrección de tabla asignaciones_docentes
 * Uso: node backend/fix_tabla_asignaciones.js
 */

const mysql = require('mysql2/promise');

async function fixTabla() {
  console.log('========================================');
  console.log(' CORRECCION DE TABLA ASIGNACIONES DOCENTES');
  console.log('========================================\n');

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@Relampago906',
    database: 'edugestion_siga',
    multipleStatements: true
  });

  try {
    // 1. Verificar estructura actual
    console.log('1. Verificando estructura actual...');
    const [columnas] = await conn.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'edugestion_siga'
        AND TABLE_NAME = 'asignaciones_docentes'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('   Columnas actuales:');
    columnas.forEach(c => {
      console.log(`   - ${c.COLUMN_NAME} (${c.DATA_TYPE}) ${c.COLUMN_KEY ? '[' + c.COLUMN_KEY + ']' : ''}`);
    });

    // 2. Verificar si tiene la estructura vieja (con cedula, grado_asignado)
    const tieneEstructuraVieja = columnas.some(c => c.COLUMN_NAME === 'cedula');
    const tieneEstructuraNueva = columnas.some(c => c.COLUMN_NAME === 'periodo_id');

    if (tieneEstructuraVieja && !tieneEstructuraNueva) {
      console.log('\n⚠️ TABLA CON ESTRUCTURA VIEJA - Necesita migración');
      console.log('   Ejecuta el script SQL: fix_asignaciones_docentes.sql');

      // Hacer backup y migrar
      console.log('\n2. Haciendo backup...');
      await conn.query('DROP TABLE IF EXISTS asignaciones_docentes_backup');
      await conn.query('CREATE TABLE asignaciones_docentes_backup AS SELECT * FROM asignaciones_docentes');
      console.log('   ✓ Backup creado');

      // Obtener periodo activo
      const [periodos] = await conn.query('SELECT id FROM periodos_escolares WHERE activo = 1 LIMIT 1');
      const periodoActivo = periodos.length > 0 ? periodos[0].id : 2;
      console.log(`   ✓ Periodo activo: ${periodoActivo}`);

      console.log('\n3. Creando nueva estructura...');
      await conn.query('DROP TABLE IF EXISTS asignaciones_docentes');
      await conn.query(`
        CREATE TABLE asignaciones_docentes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          periodo_id INT NOT NULL,
          grado_id INT NOT NULL,
          seccion VARCHAR(10) NOT NULL,
          materia_codigo VARCHAR(10) NOT NULL,
          personal_cedula VARCHAR(20) NOT NULL,
          fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_asignacion (periodo_id, grado_id, seccion, materia_codigo)
        )
      `);
      console.log('   ✓ Nueva tabla creada');

      console.log('\n4. Migrando datos...');
      const [backup] = await conn.query('SELECT * FROM asignaciones_docentes_backup');
      let migrados = 0;

      for (const row of backup) {
        if (row.grado_asignado && row.materia_especialidad) {
          try {
            // Mapear materia_especialidad a codigo
            const codigoMateria = mapearMateriaACodigo(row.materia_especialidad);
            if (codigoMateria) {
              await conn.query(
                `INSERT IGNORE INTO asignaciones_docentes
                 (periodo_id, grado_id, seccion, materia_codigo, personal_cedula)
                 VALUES (?, ?, ?, ?, ?)`,
                [periodoActivo, row.grado_asignado, row.seccion_asignada || 'A', codigoMateria, row.cedula]
              );
              migrados++;
            }
          } catch (e) {
            // Ignorar duplicados
          }
        }
      }
      console.log(`   ✓ ${migrados} registros migrados`);

    } else if (tieneEstructuraNueva) {
      console.log('\n✓ TABLA CON ESTRUCTURA CORRECTA');
    }

    // 5. Verificar datos finales
    console.log('\n5. Verificación final:');
    const [total] = await conn.query('SELECT COUNT(*) as total FROM asignaciones_docentes');
    console.log(`   Total registros: ${total[0].total}`);

    const [docentes] = await conn.query(`
      SELECT DISTINCT personal_cedula, COUNT(*) as num_asignaciones
      FROM asignaciones_docentes
      GROUP BY personal_cedula
      HAVING COUNT(*) > 1
      LIMIT 10
    `);

    if (docentes.length > 0) {
      console.log('\n   Docentes con múltiples asignaciones:');
      docentes.forEach(d => {
        console.log(`   - ${d.personal_cedula}: ${d.num_asignaciones} materias`);
      });
    }

    console.log('\n========================================');
    console.log(' CORRECCIÓN COMPLETADA');
    console.log('========================================');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
  }
}

function mapearMateriaACodigo(materia) {
  const mapa = {
    'CASTELLANO': 'CA',
    'CASTELLANO Y LITERATURA': 'CA',
    'INGLES': 'IO',
    'INGLES Y OTRAS LENGUAS EXTRANJERAS': 'IO',
    'MATEMATICAS': 'MA',
    'EDUCACION FISICA': 'EF',
    'ARTE Y PATRIMONIO': 'AP',
    'CIENCIAS NATURALES': 'CN',
    'GEOGRAFIA, HISTORIA Y CIUDADANIA': 'GH',
    'GHC': 'GH',
    'ORIENTACION Y CONVIVENCIA': 'OC',
    'PARTICIPACION EN GRUPOS DE CREACION, RECREACION Y PRODUCCION': 'PG',
    'PGCRP': 'PG',
    'FISICA': 'FI',
    'QUIMICA': 'QU',
    'BIOLOGIA': 'BI',
    'FORMACION PARA LA SOBERANIA NACIONAL': 'FS',
    'FS': 'FS',
    'CIENCIAS DE LA TIERRA': 'CT'
  };

  const clave = (materia || '').toUpperCase().trim();
  return mapa[clave] || null;
}

fixTabla();
