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
    print("📥 IMPORTADOR - ESTRUCTURA REAL EDUGESTION")
    print("=" * 70)
    
    # Datos de conexión
    print("\n🔐 Datos de conexión:")
    db_user = input("   Usuario (default: andfertel): ").strip() or "andfertel"
    db_password = getpass("   Contraseña: ")
    db_name = input("   Base de datos (default: edugestion_siga): ").strip() or "edugestion_siga"
    
    # Leer Excel
    print("\n📂 Leyendo archivo Excel...")
    df = pd.read_excel('notas_2do_momento.xlsx', sheet_name='Hoja4', header=0)
    df.columns = ['periodo_escolar', 'grado', 'seccion', 'cedula_raw', 
                  'momento_1', 'momento_2', 'momento_3', 'definitiva'] + list(df.columns[8:])
    
    print(f"   ✅ {len(df)} filas totales")
    
    # Limpiar cédulas
    print("\n🔧 Limpiando cédulas...")
    df['cedula'] = df['cedula_raw'].apply(limpiar_cedula)
    df = df[df['cedula'].notna()]
    print(f"   ✅ {len(df)} registros con cédula válida")
    
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
    
    # 1. Buscar o crear asignatura (materia)
    print("\n📚 Buscando asignatura para las notas...")
    
    # Ver asignaturas existentes
    cursor.execute("SELECT id, nombre FROM asignaturas LIMIT 5")
    asignaturas = cursor.fetchall()
    print("   Asignaturas disponibles:")
    for asig in asignaturas:
        print(f"      ID: {asig[0]}, Nombre: {asig[1]}")
    
    # Usar la primera asignatura o pedir al usuario
    if asignaturas:
        asignatura_id = asignaturas[0][0]
        print(f"\n   ✅ Usando asignatura: {asignaturas[0][1]} (ID: {asignatura_id})")
    else:
        print("   ❌ No hay asignaturas en la BD")
        return
    
    # 2. Obtener el periodo escolar actual
    print("\n📅 Buscando periodo escolar...")
    cursor.execute("""
        SELECT id, nombre, año FROM periodos_escolares 
        WHERE activo = 1 OR nombre LIKE '%2025%'
        LIMIT 1
    """)
    periodo = cursor.fetchone()
    if periodo:
        periodo_id = periodo[0]
        print(f"   ✅ Periodo: {periodo[1]} (ID: {periodo_id})")
    else:
        print("   ⚠️ No se encontró periodo activo, se creará uno")
        cursor.execute("""
            INSERT INTO periodos_escolares (id, nombre, año, activo)
            VALUES (UUID(), '2025-2026', 2025, 1)
        """)
        conn.commit()
        periodo_id = cursor.lastrowid
    
    # 3. Cargar estudiantes
    print("\n📋 Cargando estudiantes desde BD...")
    cursor.execute("SELECT id, cedula FROM estudiantes")
    estudiantes_bd = {}
    for row in cursor.fetchall():
        estudiantes_bd[str(row[1]).strip()] = row[0]
    print(f"   ✅ {len(estudiantes_bd)} estudiantes en BD")
    
    # Crear diccionario de búsqueda flexible
    busqueda = {}
    for bd_ced, bd_id in estudiantes_bd.items():
        busqueda[bd_ced] = bd_id
        if len(bd_ced) >= 8:
            busqueda[bd_ced[-8:]] = bd_id
        busqueda[bd_ced.lstrip('0')] = bd_id
    
    # 4. Procesar calificaciones
    print("\n📝 Procesando calificaciones...")
    
    insertados = 0
    encontrados = 0
    no_encontrados = []
    
    for idx, row in df.iterrows():
        cedula = row['cedula']
        
        # Buscar estudiante
        estudiante_id = busqueda.get(cedula)
        if not estudiante_id:
            for bd_ced, bd_id in estudiantes_bd.items():
                if bd_ced.endswith(cedula) or cedula.endswith(bd_ced):
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
                # Verificar si ya existe la calificación
                cursor.execute("""
                    SELECT id FROM calificaciones 
                    WHERE estudiante_id = %s AND asignatura_id = %s AND lapso = %s AND periodo_id = %s
                """, (estudiante_id, asignatura_id, lapso, periodo_id))
                
                if cursor.fetchone():
                    # Actualizar
                    cursor.execute("""
                        UPDATE calificaciones 
                        SET nota1 = %s, nota2 = %s, nota3 = %s, nota_final = %s
                        WHERE estudiante_id = %s AND asignatura_id = %s AND lapso = %s AND periodo_id = %s
                    """, (nota1, nota2, nota3, definitiva, estudiante_id, asignatura_id, lapso, periodo_id))
                else:
                    # Insertar nueva
                    cursor.execute("""
                        INSERT INTO calificaciones (estudiante_id, asignatura_id, lapso, nota1, nota2, nota3, nota_final, periodo_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (estudiante_id, asignatura_id, lapso, nota1, nota2, nota3, definitiva, periodo_id))
                insertados += 1
            except Exception as e:
                print(f"   ⚠️ Error: {e}")
        
        if (idx + 1) % 50 == 0:
            conn.commit()
            print(f"   📍 Procesados {idx + 1}, encontrados: {encontrados}, insertados: {insertados}")
    
    conn.commit()
    
    # Resultados
    print("\n" + "=" * 70)
    print("📊 RESULTADOS FINALES")
    print("=" * 70)
    print(f"   ✅ Estudiantes encontrados: {encontrados}")
    print(f"   ✅ Calificaciones insertadas/actualizadas: {insertados}")
    print(f"   ⚠️ Estudiantes NO encontrados: {len(no_encontrados)}")
    
    if no_encontrados:
        print("\n   📋 Primeras 15 cédulas no encontradas:")
        for ced in no_encontrados[:15]:
            print(f"      {ced}")
    
    # Resumen
    print("\n📈 RESUMEN POR LAPSO:")
    cursor.execute("""
        SELECT lapso, COUNT(*) as calificaciones, ROUND(AVG(nota_final), 2) as promedio
        FROM calificaciones 
        GROUP BY lapso 
        ORDER BY lapso
    """)
    for row in cursor.fetchall():
        print(f"   Lapso {row[0]}: {row[1]} calificaciones, promedio: {row[2]}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 70)
    print("✅ IMPORTACIÓN COMPLETADA")
    print("=" * 70)

if __name__ == "__main__":
    main()
