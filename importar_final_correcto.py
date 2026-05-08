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
    """Limpia la cédula del Excel"""
    if pd.isna(ced):
        return None
    ced_str = str(ced).strip()
    if '.' in ced_str:
        ced_str = ced_str.split('.')[0]
    numeros = re.sub(r'[^0-9]', '', ced_str)
    if not numeros:
        return None
    numeros = numeros.lstrip('0')
    return numeros if numeros else None

def main():
    print("=" * 70)
    print("📥 IMPORTADOR - ESTRUCTURA REAL CORREGIDA")
    print("=" * 70)
    
    # Datos de conexión
    print("\n🔐 Datos de conexión:")
    db_user = input("   Usuario (default: andfertel): ").strip() or "andfertel"
    db_password = getpass("   Contraseña: ")
    db_name = input("   Base de datos (default: edugestion_siga): ").strip() or "edugestion_siga"
    
    # Leer Excel
    print("\n📂 Leyendo archivo Excel...")
    df = pd.read_excel('notas_2do_momento.xlsx', sheet_name='Hoja4', header=0)
    
    # Normalizar columnas (el archivo tiene estas columnas)
    # Periodo, Grado, Seccion, Cedula, Momento1, Momento2, Momento3, Definitiva
    columnas_usadas = df.columns[:8].tolist()
    df = df[columnas_usadas]
    df.columns = ['periodo_escolar', 'grado', 'seccion', 'cedula_raw', 
                  'momento_1', 'momento_2', 'momento_3', 'definitiva_raw']
    
    print(f"   ✅ {len(df)} filas totales")
    
    # Limpiar cédulas
    print("\n🔧 Limpiando cédulas...")
    df['cedula'] = df['cedula_raw'].apply(limpiar_cedula)
    df = df[df['cedula'].notna()]
    print(f"   ✅ {len(df)} registros con cédula válida")
    
    # Mostrar ejemplos
    print("\n   Ejemplos de conversión de cédulas:")
    for i in range(min(5, len(df))):
        print(f"      {df.iloc[i]['cedula_raw']} → {df.iloc[i]['cedula']}")
    
    # Conectar
    print("\n🔌 Conectando a la base de datos...")
    conn = mysql.connector.connect(
        host='localhost',
        database=db_name,
        user=db_user,
        password=db_password
    )
    cursor = conn.cursor()
    print("   ✅ Conectado")
    
    # 1. Seleccionar asignatura
    print("\n📚 Seleccionando asignatura...")
    cursor.execute("SELECT id, nombre FROM asignaturas LIMIT 10")
    asignaturas = cursor.fetchall()
    
    if not asignaturas:
        print("   ❌ No hay asignaturas en la BD")
        return
    
    print("   Asignaturas disponibles:")
    for asig in asignaturas:
        print(f"      {asig[0]}. {asig[1]}")
    
    # Pedir al usuario qué asignatura usar
    asignatura_id = input("\n   Ingresa el ID de la asignatura (default: 108 - Matemáticas): ").strip()
    if not asignatura_id:
        asignatura_id = 108  # Matemáticas por defecto
    
    print(f"   ✅ Usando asignatura ID: {asignatura_id}")
    
    # 2. Obtener periodo escolar activo
    print("\n📅 Buscando periodo escolar activo...")
    cursor.execute("""
        SELECT id, nombre FROM periodos_escolares 
        WHERE activo = 1 
        LIMIT 1
    """)
    periodo = cursor.fetchone()
    
    if periodo:
        periodo_id = periodo[0]
        print(f"   ✅ Periodo activo: {periodo[1]} (ID: {periodo_id})")
    else:
        print("   ⚠️ No hay periodo activo. Usando el primero disponible...")
        cursor.execute("SELECT id, nombre FROM periodos_escolares LIMIT 1")
        periodo = cursor.fetchone()
        if periodo:
            periodo_id = periodo[0]
            print(f"   ✅ Usando periodo: {periodo[1]} (ID: {periodo_id})")
        else:
            print("   ❌ No hay periodos escolares en la BD")
            return
    
    # 3. Cargar estudiantes
    print("\n📋 Cargando estudiantes desde BD...")
    cursor.execute("SELECT id, cedula FROM estudiantes")
    estudiantes_bd = {}
    for row in cursor.fetchall():
        estudiantes_bd[str(row[1]).strip()] = row[0]
    print(f"   ✅ {len(estudiantes_bd)} estudiantes en BD")
    
    # Mostrar ejemplos de cédulas en BD
    print("\n   Ejemplos de cédulas en BD:")
    for ced in list(estudiantes_bd.keys())[:5]:
        print(f"      {ced}")
    
    # Crear diccionario de búsqueda flexible
    busqueda = {}
    for bd_ced, bd_id in estudiantes_bd.items():
        busqueda[bd_ced] = bd_id
        # Buscar por últimos 8 dígitos
        if len(bd_ced) >= 8:
            busqueda[bd_ced[-8:]] = bd_id
        # Buscar sin ceros iniciales
        busqueda[bd_ced.lstrip('0')] = bd_id
    
    # 4. Procesar calificaciones
    print("\n📝 Procesando calificaciones...")
    
    insertados = 0
    actualizados = 0
    encontrados = 0
    no_encontrados = []
    
    for idx, row in df.iterrows():
        cedula = row['cedula']
        
        # Buscar estudiante
        estudiante_id = busqueda.get(cedula)
        
        if not estudiante_id:
            # Búsqueda más flexible
            for bd_ced, bd_id in estudiantes_bd.items():
                if bd_ced.endswith(cedula) or cedula.endswith(bd_ced) or cedula in bd_ced:
                    estudiante_id = bd_id
                    break
        
        if not estudiante_id:
            if cedula not in no_encontrados:
                no_encontrados.append(cedula)
            continue
        
        encontrados += 1
        
        # Procesar los 3 lapsos/momentos
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
                # Verificar si ya existe
                cursor.execute("""
                    SELECT id FROM calificaciones 
                    WHERE estudiante_id = %s AND asignatura_id = %s AND lapso = %s AND periodo_id = %s
                """, (estudiante_id, asignatura_id, lapso, periodo_id))
                
                if cursor.fetchone():
                    # Actualizar
                    cursor.execute("""
                        UPDATE calificaciones 
                        SET nota_1 = %s, nota_2 = %s, nota_3 = %s, definitiva = %s
                        WHERE estudiante_id = %s AND asignatura_id = %s AND lapso = %s AND periodo_id = %s
                    """, (nota1, nota2, nota3, definitiva, estudiante_id, asignatura_id, lapso, periodo_id))
                    actualizados += 1
                else:
                    # Insertar nueva
                    cursor.execute("""
                        INSERT INTO calificaciones (estudiante_id, asignatura_id, periodo_id, lapso, nota_1, nota_2, nota_3, definitiva)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (estudiante_id, asignatura_id, periodo_id, lapso, nota1, nota2, nota3, definitiva))
                    insertados += 1
                    
            except Exception as e:
                print(f"   ⚠️ Error: {e}")
        
        if (idx + 1) % 50 == 0:
            conn.commit()
            print(f"   📍 Procesados {idx + 1}, encontrados: {encontrados}")
    
    conn.commit()
    
    # Resultados
    print("\n" + "=" * 70)
    print("📊 RESULTADOS FINALES")
    print("=" * 70)
    print(f"   ✅ Estudiantes encontrados: {encontrados}")
    print(f"   ✅ Calificaciones insertadas: {insertados}")
    print(f"   🔄 Calificaciones actualizadas: {actualizados}")
    print(f"   ⚠️ Estudiantes NO encontrados: {len(no_encontrados)}")
    
    if no_encontrados:
        print("\n   📋 Primeras 20 cédulas no encontradas:")
        for ced in no_encontrados[:20]:
            print(f"      {ced}")
        print(f"\n   💡 Sugerencia: Revisa el formato de cédulas en la BD")
        print("      Las cédulas en BD parecen no tener el formato V-XXXXXXX")
    
    # Resumen por lapso
    print("\n📈 RESUMEN POR LAPSO:")
    cursor.execute("""
        SELECT lapso, COUNT(*) as calificaciones, ROUND(AVG(definitiva), 2) as promedio,
               SUM(CASE WHEN definitiva >= 10 THEN 1 ELSE 0 END) as aprobados,
               SUM(CASE WHEN definitiva < 10 AND definitiva IS NOT NULL THEN 1 ELSE 0 END) as reprobados
        FROM calificaciones 
        WHERE periodo_id = %s AND asignatura_id = %s
        GROUP BY lapso 
        ORDER BY lapso
    """, (periodo_id, asignatura_id))
    
    print("\n   Lapso | Calificaciones | Promedio | Aprobados | Reprobados")
    print("   " + "-" * 65)
    for row in cursor.fetchall():
        print(f"     {row[0]}    |      {row[1]:4d}      |   {row[2]:5.2f}   |    {row[3]:4d}    |     {row[4]:4d}")
    
    # Mostrar ejemplos de calificaciones insertadas
    print("\n📋 EJEMPLOS DE CALIFICACIONES INSERTADAS:")
    cursor.execute("""
        SELECT e.cedula, e.apellidos, e.nombres, c.lapso, c.nota_1, c.nota_2, c.nota_3, c.definitiva
        FROM calificaciones c
        JOIN estudiantes e ON e.id = c.estudiante_id
        WHERE c.periodo_id = %s AND c.asignatura_id = %s
        LIMIT 15
    """, (periodo_id, asignatura_id))
    
    for row in cursor.fetchall():
        print(f"   {row[0]} | {row[1]}, {row[2]} | Lapso {row[3]}: {row[4]}, {row[5]}, {row[6]} → {row[7]}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 70)
    print("✅ IMPORTACIÓN COMPLETADA")
    print("=" * 70)

if __name__ == "__main__":
    main()
