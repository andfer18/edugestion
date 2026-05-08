const mysql = require('mysql2/promise');

async function insertar() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '@Relampago906',
    database: 'edugestion_siga'
  });

  const faltantes = [
    ['14137464', 17, 'B C D', 'INGLES'],               // Edwar Marín (2do Año)
    ['18662175', 20, 'A B C D', 'FS'],                  // José Urdaneta (5to Año)
    ['19211028', 19, 'A B C D', 'MATEMATICA'],          // Andrés Valles (4to Año)
    ['30089498', 18, 'A B C D', 'FS']                   // José Negrette (3er Año)
  ];

  for (const f of faltantes) {
    await conn.execute(
      `INSERT IGNORE INTO asignaciones_docentes (cedula, grado_asignado, seccion_asignada, materia_especialidad) VALUES (?, ?, ?, ?)`, f
    );
    console.log(`Insertada/Verificada: ${f[0]} -> Grado ${f[1]} (${f[3]})`);
  }

  console.log('\n--- VERIFICACION COMPLETA DE ASIGNACIONES EXTRA ---');
  const [rows] = await conn.execute(`SELECT * FROM asignaciones_docentes ORDER BY cedula, grado_asignado`);
  console.table(rows);

  await conn.end();
}

insertar().catch(err => console.error('ERROR:', err.message));
