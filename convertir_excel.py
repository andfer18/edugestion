import pandas as pd
import re

print("📂 Leyendo archivo Excel...")
df = pd.read_excel('notas_2do_momento.xlsx', sheet_name='Hoja4')

print(f"📊 Dimensiones del DataFrame: {df.shape}")
print(f"📋 Columnas encontradas: {len(df.columns)}")

# Seleccionar todas las columnas que necesitas
# Asumiendo que las primeras 8 columnas son las que nos interesan
df_clean = df.iloc[:, 0:8]  # Esto selecciona las primeras 8 columnas (0-7)
df_clean.columns = ['periodo_escolar', 'grado', 'seccion', 'cedula', 'momento_1', 'momento_2', 'momento_3', 'definitiva']

# Limpiar cédulas (solo números)
def limpiar_cedula(val):
    if pd.isna(val):
        return ''
    val_str = str(val).strip()
    numeros = re.sub(r'[^0-9]', '', val_str)
    if numeros:
        numeros = numeros.lstrip('0')
        if numeros:
            return f"V-{numeros}"
    return ''

df_clean['cedula'] = df_clean['cedula'].apply(limpiar_cedula)

# Filtrar filas sin cédula válida
df_clean = df_clean[df_clean['cedula'] != '']

# Guardar CSV
df_clean.to_csv('notas_preparadas.csv', index=False, encoding='utf-8')
print(f"✅ CSV preparado con {len(df_clean)} estudiantes")
print("📁 Archivo: notas_preparadas.csv")
