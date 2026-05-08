import pandas as pd
import mysql.connector
import re
from getpass import getpass

def extraer_notas(cadena):
    """Extrae las 3 notas de la cadena concatenada"""
    if pd.isna(cadena) or cadena == '':
        return None, None, None
    
    cadena_str = str(cadena).strip()
    cadena_str = re.sub(r'[^0-9]', ' ', cadena_str)
    numeros = re.findall(r'\b\d{2}\b', cadena_str)
    
    notas = []
    for num in numeros[:3]:
        try:
            nota = int(num)
            if 0 <= nota <= 20:
                notas.append(nota)
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
    """Limpia cédula: elimina ceros iniciales y deja solo números con V-"""
    if pd.isna(ced):
        return None
    ced_str = str(ced).strip()
    # Extraer solo números
    numeros = re.sub(r'[^0-9]', '', ced_str)
    if not numeros:
        return None
    # Eliminar ceros a la izquierda
    numeros = numeros.lstrip('0')
    # Tomar los primeros 8 dígitos (a veces vienen 9)
    if len(numeros) > 8:
        numeros = numeros[:8]
    return f"V-{numeros}" if numeros else None

def main():
    print("=" * 70)
    print("📥 IMPORTADOR DIRECTO DESDE EXCEL - EDUGESTION")
    print("=" * 70)
    
    # Pedir datos de conexión
    print("\n🔐 Datos de conexión a la base de datos:")
    db_user = input("   Usuario (default: root): ").strip() or "root"
    db_password = getpass("   Contraseña: ")
    db_name = input("   Base de datos (default: edugestion_siga): ").strip() or "edugestion_siga"
    
    # Leer Excel
    print("\n📂 Leyendo archivo Excel...")
    try:
        # Leer el Excel (ajusta el nombre de la hoja si es diferente)
        df = pd.read_excel('notas_2do_momento.xlsx', sheet_name='Hoja4', header=0)
        print(f"   ✅ {len(df)} filas encontradas")
        print(f"   📋 Columnas: {df.columns.tolist()}")
    except Exception as e:
        print(f"   ❌ Error al leer Excel: {e}")
        return
    
    # Identificar columnas (por posición)
    # Según la imagen, las columnas son: Periodo, Grado, Seccion, Cedula, Momento1, Momento2, Momento3, Definitiva
    columnas = df.columns.tolist()
    
    # Renombrar para facilitar
    if len(columnas) >= 8:
        df.columns = ['periodo_escolar', 'grado', 'seccion', 'cedula_raw', 
                      'momento_1', 'momento_2', 'momento_3', 'definitiva'] + list(columnas[8:])
    else:
        print("   ❌ El archivo no tiene el formato esperado")
        return
    
    # Limpiar datos
    print("\n🔧 Limpiando datos...")
    
    # Limpiar cédulas
    df['cedula'] = df['cedula_raw'].apply(limpiar_cedula)
    df = df[df['cedula'].notna()]
    print(f"   ✅ {len(df)} registros con cédula válida")
    
    # Mostrar primeras cédulas limpias
    print("\n   Ejemplos de cédulas limpias:")
    for ced in df['cedula'].head(10):
        print(f"      {ced}")
    
    # Conectar a BD
    print("\n🔌 Conectando a la base de datos...")
    try:
        conn = mysql.connector.connect(
            host='localhost',
            database=db_name,
            user=db_user,
            password=db_password
        )
        cursor = conn.cursor()
        print("   ✅ Conexión exitosa")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Crear tablas si no existen
    print("\n📚 Verificando tablas...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS materias (
            id VARCHAR(50) PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL
        )
    """)
    cursor.execute("INSERT IGNORE INTO materias VALUES ('m-general', 'Materia General')")
    cursor.execute("SELECT id FROM materias LIMIT 1")
    materia_id = cursor.fetchone()[0]
    
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
            UNIQUE KEY unique_nota (estudiante_id, materia_id, lapso, periodo_escolar)
        )
    """)
    conn.commit()
    
    # Cargar estudiantes de la BD
    print("\n📋 Cargando estudiantes desde BD...")
    cursor.execute("SELECT id, cedula FROM estudiantes")
    estudiantes_bd = {}
    for row in cursor.fetchall():
        estudiantes_bd[row[1]] = row[0]
    print(f"   ✅ {len(estudiantes_bd)} estudiantes en BD")
    
    # Mostrar primeras cédulas de la BD para comparar
    print("\n   Ejemplos de cédulas en BD:")
    for ced in list(estudiantes_bd.keys())[:10]:
        print(f"      {ced}")
    
    # Procesar notas
    print("\n📝 Procesando notas...")
    
    insertados = 0
    encontrados = 0
    no_encontrados = []
    
    for idx, row in df.iterrows():
        cedula = row['cedula']
        periodo = str(row['periodo_escolar']).strip()
        
        # Buscar estudiante en BD
        estudiante_id = estudiantes_bd.get(cedula)
        
        # Si no lo encuentra, quitar el V- y buscar
        if not estudiante_id and cedula.startswith('V-'):
            cedula_sin_v = cedula[2:]
            for bd_ced, bd_id in estudiantes_bd.items():
                if bd_ced.endswith(cedula_sin_v) or bd_ced == cedula_sin_v:
                    estudiante_id = bd_id
                    break
        
        if not estudiante_id:
            if cedula not in no_encontrados:
                no_encontrados.append(cedula)
            continue
        
        encontrados += 1
        
        # Procesar los 3 momentos
        for lapso in range(1, 4):
            col = f'momento_{lapso}'
            valor = row[col]
            
            if pd.isna(valor):
                continue
            
            nota1, nota2, nota3 = extraer_notas(valor)
            
            if nota1 is None and nota2 is None and nota3 is None:
                continue
            
            # Calcular definitiva
            notas_validas = [n for n in [nota1, nota2, nota3] if n is not None]
            definitiva = round(sum(notas_validas) / len(notas_validas), 2) if notas_validas else None
            
            try:
                cursor.execute("""
                    INSERT INTO notas (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo_escolar)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        nota1 = VALUES(nota1), nota2 = VALUES(nota2),
                        nota3 = VALUES(nota3), definitiva = VALUES(definitiva)
                """, (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo))
                insertados += 1
            except Exception as e:
                print(f"   ⚠️ Error insertando: {e}")
        
        if (idx + 1) % 100 == 0:
            conn.commit()
            print(f"   📍 Procesados {idx + 1} registros, encontrados: {encontrados}")
    
    conn.commit()
    
    # Resultados
    print("\n" + "=" * 70)
    print("📊 RESULTADOS DE LA IMPORTACIÓN")
    print("=" * 70)
    print(f"   ✅ Estudiantes encontrados: {encontrados}")
    print(f"   ✅ Notas insertadas: {insertados}")
    print(f"   ⚠️ Estudiantes NO encontrados: {len(no_encontrados)}")
    
    if no_encontrados:
        print("\n   📋 Primeras 15 cédulas no encontradas:")
        for ced in no_encontrados[:15]:
            print(f"      - {ced}")
    
    # Mostrar resumen
    print("\n📈 RESUMEN POR LAPSO:")
    cursor.execute("""
        SELECT lapso, COUNT(*) as notas, ROUND(AVG(definitiva), 2) as promedio
        FROM notas WHERE periodo_escolar = '2025-2026'
        GROUP BY lapso ORDER BY lapso
    """)
    for row in cursor.fetchall():
        print(f"   Lapso {row[0]}: {row[1]} notas, promedio: {row[2]}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 70)
    print("✅ IMPORTACIÓN COMPLETADA")
    print("=" * 70)

if __name__ == "__main__":
    main()
