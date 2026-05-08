import pandas as pd
import mysql.connector
import re
import sys

DB_CONFIG = {
    'host': 'localhost',
    'database': 'edugestion_siga',
    'user': 'root',
    'password': '@Relampago906',
}

def extraer_notas(cadena):
    """Extrae las notas de la cadena concatenada"""
    if pd.isna(cadena) or cadena == '':
        return None, None, None
    
    cadena_str = str(cadena).strip()
    cadena_str = re.sub(r'[^0-9]', ' ', cadena_str)
    numeros = re.findall(r'\b\d{2}\b', cadena_str)
    
    notas = []
    for num in numeros:
        try:
            nota = int(num)
            if 0 <= nota <= 20:
                notas.append(nota)
                if len(notas) >= 3:
                    break
        except:
            pass
    
    if len(notas) >= 3:
        return notas[0], notas[1], notas[2]
    elif len(notas) == 2:
        return notas[0], notas[1], None
    elif len(notas) == 1:
        return notas[0], None, None
    return None, None, None

def limpiar_cedula(ced):
    """
    Limpia y formatea la cédula.
    El Excel tiene cédulas de 9 dígitos donde el último es un 0 de relleno.
    Ej: 349141900 → 34914190 (8 dígitos)
    """
    if pd.isna(ced):
        return ''
    
    ced_str = str(ced).strip()
    
    # Extraer solo números
    numeros = re.sub(r'[^0-9]', '', ced_str)
    
    if not numeros:
        return ''
    
    # Eliminar el último dígito si es 0 y la longitud es 9 (relleno)
    if len(numeros) == 9 and numeros.endswith('0'):
        numeros = numeros[:-1]  # Quitar el último cero
    elif len(numeros) == 9:
        # Si tiene 9 dígitos pero no termina en 0, también quitamos el último
        numeros = numeros[:-1]
    
    # Eliminar ceros iniciales
    numeros = numeros.lstrip('0')
    
    # Si después de limpiar está vacío, retornar vacío
    if not numeros:
        return ''
    
    # Formato estándar con V-
    return f"V-{numeros}"

def main():
    print("=" * 70)
    print("📥 IMPORTADOR DE NOTAS - EDUGESTION SIGA (CÉDULAS CORREGIDAS)")
    print("=" * 70)
    
    # 1. Leer CSV
    print("\n📂 Leyendo archivo CSV...")
    df = pd.read_csv('notas_preparadas.csv')
    print(f"   ✅ {len(df)} registros encontrados")
    
    # 2. Conectar a BD
    print("\n🔌 Conectando a la base de datos...")
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("   ✅ Conexión exitosa")
    
    # 3. Asegurar tablas
    print("\n📚 Verificando tablas...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS materias (
            id VARCHAR(50) PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            codigo VARCHAR(20),
            gradoId VARCHAR(20),
            docenteId VARCHAR(50),
            horasSemanales INT
        )
    """)
    
    cursor.execute("""
        INSERT IGNORE INTO materias (id, nombre, codigo, gradoId, docenteId, horasSemanales)
        VALUES ('m-general', 'Materia General', 'GEN', '1er Año', 'd1', 4)
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            estudiante_id INT NOT NULL,
            materia_id VARCHAR(50) NOT NULL,
            lapso INT NOT NULL,
            nota1 DECIMAL(5,2),
            nota2 DECIMAL(5,2),
            nota3 DECIMAL(5,2),
            definitiva DECIMAL(5,2),
            periodo_escolar VARCHAR(20),
            UNIQUE KEY unique_nota (estudiante_id, materia_id, lapso, periodo_escolar),
            FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    
    cursor.execute("SELECT id FROM materias LIMIT 1")
    materia_id = cursor.fetchone()[0]
    print(f"   ✅ Materia lista: {materia_id}")
    
    # 4. Limpiar cédulas (con la nueva regla)
    print("\n🔧 Limpiando cédulas (quitando cero de relleno)...")
    
    # Mostrar ejemplo de limpieza
    ejemplos = df['cedula'].head(3).tolist()
    print("   Ejemplos de conversión:")
    for ej in ejemplos:
        original = ej
        limpia = limpiar_cedula(ej)
        print(f"      {original} → {limpia}")
    
    df['cedula'] = df['cedula'].apply(limpiar_cedula)
    df = df[df['cedula'] != '']
    print(f"   ✅ {len(df)} registros con cédula válida")
    
    # 5. Cargar estudiantes desde BD
    print("\n📋 Cargando estudiantes desde BD...")
    cursor.execute("SELECT id, cedula FROM estudiantes")
    estudiantes_bd = {row[1]: row[0] for row in cursor.fetchall()}
    print(f"   ✅ {len(estudiantes_bd)} estudiantes en la base de datos")
    
    # Mostrar algunas cédulas de la BD para verificar formato
    cedulas_bd_ejemplo = list(estudiantes_bd.keys())[:5]
    print(f"   Ejemplo de cédulas en BD: {cedulas_bd_ejemplo}")
    
    # 6. Procesar notas
    print("\n📝 Procesando notas...")
    
    insertados = 0
    actualizados = 0
    no_encontrados = []
    encontrados = 0
    
    for idx, row in df.iterrows():
        cedula = row['cedula']
        periodo = row['periodo_escolar']
        
        # Buscar estudiante
        estudiante_id = estudiantes_bd.get(cedula)
        
        if not estudiante_id:
            if cedula not in no_encontrados:
                no_encontrados.append(cedula)
            continue
        
        encontrados += 1
        
        # Procesar cada lapso
        for lapso in range(1, 4):
            col = f'momento_{lapso}'
            valor = row[col]
            nota1, nota2, nota3 = extraer_notas(valor)
            
            if nota1 is None and nota2 is None and nota3 is None:
                continue
            
            # Calcular definitiva
            notas_validas = [n for n in [nota1, nota2, nota3] if n is not None]
            definitiva = round(sum(notas_validas) / len(notas_validas), 2) if notas_validas else None
            
            # Insertar o actualizar
            cursor.execute("""
                INSERT INTO notas (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo_escolar)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    nota1 = VALUES(nota1),
                    nota2 = VALUES(nota2),
                    nota3 = VALUES(nota3),
                    definitiva = VALUES(definitiva)
            """, (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo))
            
            if cursor.rowcount == 1:
                insertados += 1
            elif cursor.rowcount == 2:
                actualizados += 1
        
        if (idx + 1) % 100 == 0:
            conn.commit()
            print(f"   📍 Procesados {(idx + 1)} estudiantes, encontrados: {encontrados}")
    
    conn.commit()
    
    # 7. Resultados
    print("\n" + "=" * 70)
    print("📊 RESULTADOS DE LA IMPORTACIÓN")
    print("=" * 70)
    print(f"   ✅ Estudiantes encontrados en BD: {encontrados}")
    print(f"   ✅ Notas insertadas: {insertados}")
    print(f"   🔄 Notas actualizadas: {actualizados}")
    print(f"   ⚠️ Estudiantes NO encontrados: {len(no_encontrados)}")
    
    if no_encontrados:
        print("\n   📋 Cédulas NO encontradas (primeras 15):")
        for ced in no_encontrados[:15]:
            print(f"      - {ced}")
        
        # Verificar si algunas de las no encontradas existen con formato diferente
        print("\n   🔍 Verificando si existen con formato V-xxxxxxx (sin último dígito)...")
        for ced in no_encontrados[:5]:
            ced_sin_ultimo = ced[:-1] if ced.endswith('0') else ced
            if ced_sin_ultimo in estudiantes_bd:
                print(f"      ⚠️ {ced} → {ced_sin_ultimo} SÍ existe en BD")
    
    # 8. Resumen por lapso
    print("\n📈 RESUMEN POR LAPSO:")
    cursor.execute("""
        SELECT 
            lapso,
            COUNT(*) as total_notas,
            COUNT(DISTINCT estudiante_id) as estudiantes,
            ROUND(AVG(definitiva), 2) as promedio,
            SUM(CASE WHEN definitiva >= 10 THEN 1 ELSE 0 END) as aprobados,
            SUM(CASE WHEN definitiva < 10 AND definitiva IS NOT NULL THEN 1 ELSE 0 END) as reprobados
        FROM notas 
        WHERE periodo_escolar = '2025-2026'
        GROUP BY lapso
        ORDER BY lapso
    """)
    
    resultados = cursor.fetchall()
    if resultados:
        print("\n   Lapso | Notas | Estudiantes | Promedio | Aprobados | Reprobados")
        print("   " + "-" * 70)
        for row in resultados:
            print(f"     {row[0]}    |  {row[1]:4d} |     {row[2]:4d}    |   {row[3]:5.2f}  |    {row[4]:4d}    |     {row[5]:4d}")
    else:
        print("\n   ⚠️ No se encontraron notas en la base de datos")
    
    # 9. Mostrar ejemplos
    print("\n📋 EJEMPLOS DE NOTAS IMPORTADAS:")
    cursor.execute("""
        SELECT e.cedula, e.apellidos, e.nombres, n.lapso, n.nota1, n.nota2, n.nota3, n.definitiva
        FROM notas n
        JOIN estudiantes e ON e.id = n.estudiante_id
        WHERE n.periodo_escolar = '2025-2026'
        LIMIT 10
    """)
    
    ejemplos = cursor.fetchall()
    if ejemplos:
        for row in ejemplos:
            print(f"   {row[0]} | {row[1]}, {row[2]} | Lapso {row[3]}: {row[4]}, {row[5]}, {row[6]} → {row[7]}")
    else:
        print("   ⚠️ No hay ejemplos para mostrar")
    
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 70)
    print("✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 70)

if __name__ == "__main__":
    main()
