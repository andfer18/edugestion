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

def limpiar_cedula_para_bd(ced):
    """
    Convierte la cédula del Excel al formato de la BD.
    Excel: V-349141900  →  BD: 349141900? o 34914190?
    
    Según la BD, las cédulas tienen 11 dígitos sin V-
    Ejemplo BD: 10923769228
    """
    if pd.isna(ced):
        return None
    
    ced_str = str(ced).strip()
    
    # Eliminar V- si existe
    ced_str = re.sub(r'^[Vv]-', '', ced_str)
    
    # Extraer solo números
    numeros = re.sub(r'[^0-9]', '', ced_str)
    
    if not numeros:
        return None
    
    # Eliminar ceros a la izquierda
    numeros = numeros.lstrip('0')
    
    # Si después de limpiar está vacío, retornar None
    if not numeros:
        return None
    
    # La BD parece tener cédulas de 11 dígitos
    # Si es más corta, agregar ceros a la izquierda?
    # Mejor dejar como está y luego hacer match
    
    return numeros

def main():
    print("=" * 70)
    print("📥 IMPORTADOR - FORMATO CORREGIDO")
    print("=" * 70)
    
    # Pedir datos
    print("\n🔐 Datos de conexión:")
    db_user = input("   Usuario (default: root): ").strip() or "root"
    db_password = getpass("   Contraseña: ")
    db_name = input("   Base de datos (default: edugestion_siga): ").strip() or "edugestion_siga"
    
    # Leer Excel
    print("\n📂 Leyendo Excel...")
    df = pd.read_excel('notas_2do_momento.xlsx', sheet_name='Hoja4', header=0)
    print(f"   ✅ {len(df)} filas")
    
    # Renombrar columnas
    df.columns = ['periodo_escolar', 'grado', 'seccion', 'cedula_raw', 
                  'momento_1', 'momento_2', 'momento_3', 'definitiva'] + list(df.columns[8:])
    
    # Limpiar cédulas
    print("\n🔧 Limpiando cédulas...")
    df['cedula_limpia'] = df['cedula_raw'].apply(limpiar_cedula_para_bd)
    df = df[df['cedula_limpia'].notna()]
    print(f"   ✅ {len(df)} registros con cédula válida")
    
    # Mostrar ejemplos
    print("\n   Ejemplos de conversión:")
    for i in range(min(5, len(df))):
        print(f"      Excel: {df.iloc[i]['cedula_raw']} → BD: {df.iloc[i]['cedula_limpia']}")
    
    # Conectar a BD
    print("\n🔌 Conectando...")
    conn = mysql.connector.connect(
        host='localhost',
        database=db_name,
        user=db_user,
        password=db_password
    )
    cursor = conn.cursor()
    print("   ✅ Conectado")
    
    # Crear/verificar tablas
    cursor.execute("CREATE TABLE IF NOT EXISTS materias (id VARCHAR(50) PRIMARY KEY, nombre VARCHAR(100))")
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
    
    # Cargar estudiantes
    print("\n📋 Cargando estudiantes...")
    cursor.execute("SELECT id, cedula FROM estudiantes")
    estudiantes_bd = {row[1]: row[0] for row in cursor.fetchall()}
    print(f"   ✅ {len(estudiantes_bd)} estudiantes en BD")
    
    # Mostrar primeras cédulas de BD
    print("\n   Ejemplos de cédulas en BD:")
    for ced in list(estudiantes_bd.keys())[:10]:
        print(f"      {ced}")
    
    # Procesar con diferentes estrategias de matching
    print("\n📝 Buscando coincidencias...")
    
    # Estrategia 1: Match exacto
    # Estrategia 2: Match con los últimos 8 dígitos
    # Estrategia 3: Match con los últimos 9 dígitos
    
    insertados = 0
    encontrados = 0
    no_encontrados = []
    matches_por_estrategia = {'exacto': 0, 'ultimos8': 0, 'ultimos9': 0}
    
    for idx, row in df.iterrows():
        cedula_excel = row['cedula_limpia']
        periodo = str(row['periodo_escolar']).strip()
        estudiante_id = None
        
        # Estrategia 1: Match exacto
        if cedula_excel in estudiantes_bd:
            estudiante_id = estudiantes_bd[cedula_excel]
            matches_por_estrategia['exacto'] += 1
        
        # Estrategia 2: Últimos 8 dígitos
        if not estudiante_id and len(cedula_excel) >= 8:
            ultimos8 = cedula_excel[-8:]
            for bd_ced, bd_id in estudiantes_bd.items():
                if bd_ced.endswith(ultimos8):
                    estudiante_id = bd_id
                    matches_por_estrategia['ultimos8'] += 1
                    break
        
        # Estrategia 3: Últimos 9 dígitos
        if not estudiante_id and len(cedula_excel) >= 9:
            ultimos9 = cedula_excel[-9:]
            for bd_ced, bd_id in estudiantes_bd.items():
                if bd_ced.endswith(ultimos9):
                    estudiante_id = bd_id
                    matches_por_estrategia['ultimos9'] += 1
                    break
        
        if not estudiante_id:
            if cedula_excel not in no_encontrados:
                no_encontrados.append(cedula_excel)
            continue
        
        encontrados += 1
        
        # Procesar notas
        for lapso in range(1, 4):
            col = f'momento_{lapso}'
            valor = row[col]
            
            if pd.isna(valor):
                continue
            
            nota1, nota2, nota3 = extraer_notas(valor)
            
            if nota1 is None and nota2 is None and nota3 is None:
                continue
            
            notas_validas = [n for n in [nota1, nota2, nota3] if n is not None]
            definitiva = round(sum(notas_validas) / len(notas_validas), 2) if notas_validas else None
            
            cursor.execute("""
                INSERT INTO notas (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo_escolar)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    nota1 = VALUES(nota1), nota2 = VALUES(nota2),
                    nota3 = VALUES(nota3), definitiva = VALUES(definitiva)
            """, (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo))
            insertados += 1
        
        if (idx + 1) % 100 == 0:
            conn.commit()
            print(f"   📍 Procesados {idx + 1}, encontrados: {encontrados}")
    
    conn.commit()
    
    # Resultados
    print("\n" + "=" * 70)
    print("📊 RESULTADOS")
    print("=" * 70)
    print(f"   ✅ Estudiantes encontrados: {encontrados}")
    print(f"   ✅ Notas insertadas: {insertados}")
    print(f"\n   📋 Estrategia de matching:")
    print(f"      Match exacto: {matches_por_estrategia['exacto']}")
    print(f"      Últimos 8 dígitos: {matches_por_estrategia['ultimos8']}")
    print(f"      Últimos 9 dígitos: {matches_por_estrategia['ultimos9']}")
    print(f"   ⚠️ No encontrados: {len(no_encontrados)}")
    
    if no_encontrados:
        print("\n   📋 Primeras 15 cédulas no encontradas:")
        for ced in no_encontrados[:15]:
            print(f"      {ced}")
    
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
    print("\n✅ FINALIZADO")

if __name__ == "__main__":
    main()
