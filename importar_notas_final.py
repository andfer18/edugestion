import pandas as pd
import mysql.connector
import re
import sys

# ============================================
# CONFIGURACIÓN - CAMBIA AQUÍ TU CONTRASEÑA
# ============================================
DB_CONFIG = {
    'host': 'localhost',
    'database': 'edugestion_siga',
    'user': 'root',
    'password': '@Relampago906'
}

def extraer_notas(cadena):
    """Extrae las notas de la cadena del Excel (formato especial)"""
    if pd.isna(cadena) or cadena == '' or cadena == 'N N N' or cadena == 'I I I':
        return None, None, None
    
    cadena_str = str(cadena).strip()
    
    # Limpiar caracteres no numéricos
    cadena_str = re.sub(r'[^0-9]', ' ', cadena_str)
    
    # Extraer todos los números de 2 dígitos
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

def main():
    print("=" * 60)
    print("📥 IMPORTADOR DE NOTAS - EDUGESTION")
    print("=" * 60)
    
    # 1. Leer CSV
    print("\n📂 Leyendo archivo CSV...")
    try:
        df = pd.read_csv('notas_preparadas.csv')
        print(f"   ✅ {len(df)} registros encontrados")
    except FileNotFoundError:
        print("   ❌ Archivo 'notas_preparadas.csv' no encontrado")
        print("   Generando CSV desde Excel...")
        try:
            df_excel = pd.read_excel('notas_2do_momento.xlsx', sheet_name='Hoja4')
            df_clean = df_excel.iloc[:, [0, 1, 2, 3, 4, 5, 6, 7]]
            df_clean.columns = ['periodo_escolar', 'grado', 'seccion', 'cedula', 'momento_1', 'momento_2', 'momento_3', 'definitiva']
            df_clean.to_csv('notas_preparadas.csv', index=False, encoding='utf-8')
            df = df_clean
            print(f"   ✅ CSV generado con {len(df)} registros")
        except Exception as e:
            print(f"   ❌ Error al generar CSV: {e}")
            sys.exit(1)
    
    # 2. Conectar a BD
    print("\n🔌 Conectando a la base de datos...")
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("   ✅ Conexión exitosa")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        print("\n   Verifica:")
        print("   1. MySQL/MariaDB está corriendo")
        print("   2. La base de datos 'edugestion_siga' existe")
        print("   3. La contraseña es correcta")
        sys.exit(1)
    
    # 3. Verificar/crear materia
    print("\n📚 Verificando materias...")
    cursor.execute("SELECT id FROM materias LIMIT 1")
    materia = cursor.fetchone()
    if not materia:
        cursor.execute("""
            INSERT INTO materias (id, nombre, codigo, gradoId, docenteId, horasSemanales)
            VALUES ('m-import', 'Materia Importada', 'IMP', '1er Año', 'd1', 4)
        """)
        conn.commit()
        cursor.execute("SELECT id FROM materias LIMIT 1")
        materia = cursor.fetchone()
        print("   ✅ Materia creada: 'Materia Importada'")
    else:
        print(f"   ✅ Materia encontrada: {materia[0]}")
    
    materia_id = materia[0]
    
    # 4. Limpiar cédulas
    print("\n🔧 Limpiando cédulas...")
    def limpiar_cedula(ced):
        if pd.isna(ced):
            return ''
        ced_str = str(ced).strip()
        numeros = re.sub(r'[^0-9]', '', ced_str)
        if numeros:
            numeros = numeros.lstrip('0')
            return f"V-{numeros}"
        return ''
    
    df['cedula'] = df['cedula'].apply(limpiar_cedula)
    df = df[df['cedula'] != '']
    print(f"   ✅ {len(df)} registros después de limpiar cédulas")
    
    # 5. Procesar notas
    print("\n📝 Procesando notas...")
    
    insertados = 0
    actualizados = 0
    errores = 0
    estudiantes_no_encontrados = set()
    
    for idx, row in df.iterrows():
        cedula = row['cedula']
        
        # Buscar estudiante
        cursor.execute("SELECT id FROM estudiantes WHERE cedula = %s", (cedula,))
        estudiante = cursor.fetchone()
        
        if not estudiante:
            estudiantes_no_encontrados.add(cedula)
            errores += 1
            continue
        
        estudiante_id = estudiante[0]
        periodo = row['periodo_escolar']
        
        # Procesar Momento 1, 2 y 3
        for lapso in range(1, 4):
            col_momento = f'momento_{lapso}'
            valor = row[col_momento]
            
            nota1, nota2, nota3 = extraer_notas(valor)
            
            if nota1 is None and nota2 is None and nota3 is None:
                continue
            
            # Calcular definitiva
            notas_validas = [n for n in [nota1, nota2, nota3] if n is not None]
            definitiva = round(sum(notas_validas) / len(notas_validas), 2) if notas_validas else None
            
            # Verificar si ya existe
            cursor.execute("""
                SELECT id FROM notas 
                WHERE estudiante_id = %s AND lapso = %s AND periodo_escolar = %s
            """, (estudiante_id, lapso, periodo))
            
            if cursor.fetchone():
                cursor.execute("""
                    UPDATE notas 
                    SET nota1 = %s, nota2 = %s, nota3 = %s, definitiva = %s, materia_id = %s
                    WHERE estudiante_id = %s AND lapso = %s AND periodo_escolar = %s
                """, (nota1, nota2, nota3, definitiva, materia_id, estudiante_id, lapso, periodo))
                actualizados += 1
            else:
                cursor.execute("""
                    INSERT INTO notas (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo_escolar)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (estudiante_id, materia_id, lapso, nota1, nota2, nota3, definitiva, periodo))
                insertados += 1
        
        # Feedback cada 100 estudiantes
        if (idx + 1) % 100 == 0:
            conn.commit()
            print(f"   📍 Procesados {(idx + 1)} estudiantes, {insertados} insertados, {actualizados} actualizados...")
    
    conn.commit()
    
    # 6. Resultados
    print("\n" + "=" * 60)
    print("📊 RESULTADOS DE LA IMPORTACIÓN")
    print("=" * 60)
    print(f"   ✅ Notas insertadas: {insertados}")
    print(f"   🔄 Notas actualizadas: {actualizados}")
    print(f"   ❌ Estudiantes no encontrados: {len(estudiantes_no_encontrados)}")
    
    if estudiantes_no_encontrados:
        print("\n   📋 Cédulas no encontradas (primeras 10):")
        for ced in list(estudiantes_no_encontrados)[:10]:
            print(f"      - {ced}")
    
    # 7. Resumen por lapso
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
    
    print("   Lapso | Notas | Estudiantes | Promedio | Aprobados | Reprobados")
    print("   " + "-" * 65)
    for row in cursor.fetchall():
        print(f"     {row[0]}     |  {row[1]:4d} |     {row[2]:4d}    |   {row[3]:5.2f}  |    {row[4]:4d}    |     {row[5]:4d}")
    
    # 8. Mostrar ejemplos
    print("\n📋 EJEMPLOS DE NOTAS IMPORTADAS (primeras 10):")
    cursor.execute("""
        SELECT e.cedula, e.apellido, e.nombre, e.grado, e.seccion, n.lapso, n.nota1, n.nota2, n.nota3, n.definitiva
        FROM notas n
        JOIN estudiantes e ON e.id = n.estudiante_id
        WHERE n.periodo_escolar = '2025-2026'
        LIMIT 10
    """)
    
    for row in cursor.fetchall():
        print(f"   {row[0]} | {row[1]}, {row[2]} | {row[3]} - Secc {row[4]} | Lapso {row[5]}: {row[6]}, {row[7]}, {row[8]} → {row[9]}")
    
    # 9. Limpiar
    cursor.close()
    conn.close()
    
    print("\n" + "=" * 60)
    print("✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 60)

if __name__ == "__main__":
    main()
