const mysql = require('mysql2/promise');

async function fixDB() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '@Relampago906',
    database: 'edugestion_siga', multipleStatements: true
  });

  console.log('1. Limpiando y creando tabla asignaciones_docentes...');
  await conn.execute('DROP TABLE IF EXISTS asignaciones_docentes');
  await conn.execute(`CREATE TABLE asignaciones_docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    grado_asignado INT,
    seccion_asignada VARCHAR(50),
    materia_especialidad VARCHAR(100),
    UNIQUE KEY uniq_asig (cedula, grado_asignado, materia_especialidad)
  )`);

  console.log('2. Buscando cédulas duplicadas en personal...');
  const [dups] = await conn.execute(`SELECT cedula, MIN(id) as keep_id FROM personal GROUP BY cedula HAVING COUNT(*) > 1`);

  if (dups.length === 0) {
    console.log('   No hay duplicados.');
  } else {
    for (const dup of dups) {
      const [ids] = await conn.execute(`SELECT id FROM personal WHERE cedula = ? AND id != ?`, [dup.cedula, dup.keep_id]);
      for (const row of ids) {
        const [data] = await conn.execute(`SELECT grado_asignado, seccion_asignada, materia_especialidad FROM personal WHERE id = ?`, [row.id]);
        if (data.length > 0 && data[0].grado_asignado) {
          await conn.execute(`INSERT IGNORE INTO asignaciones_docentes (cedula, grado_asignado, seccion_asignada, materia_especialidad) VALUES (?, ?, ?, ?)`,
            [dup.cedula, data[0].grado_asignado, data[0].seccion_asignada, data[0].materia_especialidad]);
          console.log(`   Movida asignacion extra de ${dup.cedula} a la nueva tabla.`);
        }
        await conn.execute(`DELETE FROM personal WHERE id = ?`, [row.id]);
      }
    }
  }

  console.log('3. Restaurando regla de cédula única en personal...');
  try { await conn.execute(`ALTER TABLE personal DROP INDEX cedula`); } catch(e) {}
  await conn.execute(`ALTER TABLE personal ADD UNIQUE INDEX cedula (cedula)`);

  console.log('4. Insertando 2da materia de Lilian Gonzalez (4to Año)...');
  await conn.execute(`INSERT IGNORE INTO asignaciones_docentes (cedula, grado_asignado, seccion_asignada, materia_especialidad) VALUES (?, ?, ?, ?)`,
    ['14356535', 19, 'A B C D', 'ORIENTACION Y CONVIVENCIA']);

  console.log('\n--- VERIFICACION FINAL ---');
  const [p] = await conn.execute(`SELECT cedula, nombres, grado_asignado, materia_especialidad FROM personal WHERE cedula IN ('14137464', '14356535', '18662175') ORDER BY cedula`);
  const [a] = await conn.execute(`SELECT * FROM asignaciones_docentes WHERE cedula IN ('14137464', '14356535', '18662175') ORDER BY cedula`);
  console.table(p);
  console.table(a);

  await conn.end();
  console.log('\nEXITO TOTAL.');
}

fixDB().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
