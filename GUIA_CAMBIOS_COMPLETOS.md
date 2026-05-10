# ============================================================
# GUÍA COMPLETA DE CAMBIOS - EDUGESTION SIGA
# ============================================================
# Sigue estos pasos en orden para aplicar todos los cambios
# ============================================================

## PASO 1: ACTUALIZAR BASE DE DATOS (MariaDB)

Abre una terminal MySQL y ejecuta:

```sql
-- Ejecuta cada bloque por separado

-- 1. Cambiar tipo de columna para permitir nuevos roles
ALTER TABLE personal MODIFY COLUMN tipo VARCHAR(50) NOT NULL DEFAULT 'docente';

-- 2. Actualizar tipo de personal según corresponda
UPDATE personal SET tipo = 'DOCENTE' WHERE materia_especialidad IS NOT NULL AND materia_especialidad != '';
UPDATE personal SET tipo = 'ADMINISTRATIVO' WHERE tipo = 'administrativo';

-- 3. Actualizar Lisbeth Bastidas como Subdirectora
UPDATE personal
SET tipo = 'ADMINISTRATIVO',
    cargo = 'SUBDIRECTORA ACADEMICA',
    grado_asignado = NULL,
    seccion_asignada = NULL,
    materia_especialidad = NULL
WHERE cedula = '9734976';

-- 4. Verificar
SELECT cedula, nombres, apellidos, tipo, cargo FROM personal WHERE cedula = '9734976';
```

## PASO 2: CREAR TABLAS SEPARADAS PARA ROLES (Opcional pero recomendado)

```sql
-- Crea las tablas separadas para mejor organización

-- Tabla de Docentes
CREATE TABLE IF NOT EXISTS personal_docente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    materia_especialidad VARCHAR(150),
    telefono VARCHAR(50),
    email VARCHAR(150),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    FOREIGN KEY (cedula) REFERENCES personal(cedula) ON DELETE CASCADE
);

-- Tabla de Directivos
CREATE TABLE IF NOT EXISTS directivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    cargo ENUM('DIRECTOR', 'SUBDIRECTOR', 'COORDINADOR') NOT NULL,
    area VARCHAR(100),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    FOREIGN KEY (cedula) REFERENCES personal(cedula) ON DELETE CASCADE
);

-- Tabla de Administrativos
CREATE TABLE IF NOT EXISTS administrativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    cargo ENUM('SECRETARIA', 'OBRERO', 'OTRO') NOT NULL,
    area_atencion VARCHAR(100),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    FOREIGN KEY (cedula) REFERENCES personal(cedula) ON DELETE CASCADE
);

-- Insertar datos organizados
-- Docentes
INSERT INTO personal_docente (cedula, nombres, apellidos, materia_especialidad)
SELECT cedula, nombres, apellidos, materia_especialidad
FROM personal
WHERE materia_especialidad IS NOT NULL
  AND materia_especialidad != ''
  AND materia_especialidad NOT LIKE '%SUBDIRECTOR%'
  AND materia_especialidad NOT LIKE '%SECRETAR%'
  AND materia_especialidad NOT LIKE '%DIRECTOR%';

-- Lisbeth Bastidas como Subdirectora
INSERT INTO directivos (cedula, nombres, apellidos, cargo, area)
SELECT cedula, nombres, apellidos, 'SUBDIRECTOR', 'ACADEMICO'
FROM personal WHERE cedula = '9734976';

-- Secretarias
INSERT INTO administrativos (cedula, nombres, apellidos, cargo, area_atencion)
SELECT cedula, nombres, apellidos, 'SECRETARIA', COALESCE(area_atencion, 'SECRETARIA')
FROM personal
WHERE tipo = 'administrativo' OR LOWER(cargo) LIKE '%secretar%';

-- Verificar
SELECT 'DOCENTES' AS tipo, COUNT(*) AS cantidad FROM personal_docente
UNION ALL SELECT 'DIRECTIVOS', COUNT(*) FROM directivos
UNION ALL SELECT 'ADMINISTRATIVOS', COUNT(*) FROM administrativos;
```

## PASO 3: ACTUALIZAR ARCHIVOS DEL PROYECTO

### Archivo 1: src/pages/AsignacionDocentes.tsx

Reemplaza TODO el archivo con este contenido:

```typescript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, BookOpen, UserCheck, PlusCircle, Trash2,
  AlertTriangle, CheckSquare, Users, GraduationCap
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const getToken = () => localStorage.getItem('siga_token') || '';
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const NOMBRES_GRADOS: Record<string, string> = { '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año' };
const GRADOS_IDS: Record<string, number> = { '1er Año': 16, '2do Año': 17, '3er Año': 18, '4to Año': 19, '5to Año': 20 };
const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

const MATERIAS_POR_GRADO: Record<number, { codigo: string, nombre: string }[]> = {
  16: [
    { codigo: 'CA', nombre: 'Castellano' }, { codigo: 'IO', nombre: 'Inglés y Otras Lenguas Extranjeras' }, { codigo: 'MA', nombre: 'Matemáticas' },
    { codigo: 'EF', nombre: 'Educación Física' }, { codigo: 'AP', nombre: 'Arte y Patrimonio' }, { codigo: 'CN', nombre: 'Ciencias Naturales' },
    { codigo: 'GH', nombre: 'Geografía, Historia y Ciudadanía' }, { codigo: 'OC', nombre: 'Orientación y Convivencia' }, { codigo: 'PG', nombre: 'Participación en Grupos de Creación, Recreación y Producción' }
  ],
  17: [
    { codigo: 'CA', nombre: 'Castellano' }, { codigo: 'IO', nombre: 'Inglés y Otras Lenguas Extranjeras' }, { codigo: 'MA', nombre: 'Matemáticas' },
    { codigo: 'EF', nombre: 'Educación Física' }, { codigo: 'AP', nombre: 'Arte y Patrimonio' }, { codigo: 'CN', nombre: 'Ciencias Naturales' },
    { codigo: 'GH', nombre: 'Geografía, Historia y Ciudadanía' }, { codigo: 'OC', nombre: 'Orientación y Convivencia' }, { codigo: 'PG', nombre: 'Participación en Grupos de Creación, Recreación y Producción' }
  ],
  18: [
    { codigo: 'CA', nombre: 'Castellano' }, { codigo: 'IO', nombre: 'Inglés y Otras Lenguas Extranjeras' }, { codigo: 'MA', nombre: 'Matemáticas' },
    { codigo: 'EF', nombre: 'Educación Física' }, { codigo: 'FI', nombre: 'Física' }, { codigo: 'QU', nombre: 'Química' },
    { codigo: 'BI', nombre: 'Biología' }, { codigo: 'GH', nombre: 'Geografía, Historia y Ciudadanía' }, { codigo: 'OC', nombre: 'Orientación y Convivencia' }, { codigo: 'PG', nombre: 'Participación en Grupos de Creación, Recreación y Producción' }
  ],
  19: [
    { codigo: 'CA', nombre: 'Castellano' }, { codigo: 'IO', nombre: 'Inglés y Otras Lenguas Extranjeras' }, { codigo: 'MA', nombre: 'Matemáticas' },
    { codigo: 'EF', nombre: 'Educación Física' }, { codigo: 'FI', nombre: 'Física' }, { codigo: 'QU', nombre: 'Química' },
    { codigo: 'BI', nombre: 'Biología' }, { codigo: 'GH', nombre: 'Geografía, Historia y Ciudadanía' }, { codigo: 'FS', nombre: 'Formación para la Soberanía Nacional' }, { codigo: 'OC', nombre: 'Orientación y Convivencia' }, { codigo: 'PG', nombre: 'Participación en Grupos de Creación, Recreación y Producción' }
  ],
  20: [
    { codigo: 'CA', nombre: 'Castellano' }, { codigo: 'IO', nombre: 'Inglés y Otras Lenguas Extranjeras' }, { codigo: 'MA', nombre: 'Matemáticas' },
    { codigo: 'EF', nombre: 'Educación Física' }, { codigo: 'FI', nombre: 'Física' }, { codigo: 'QU', nombre: 'Química' },
    { codigo: 'BI', nombre: 'Biología' }, { codigo: 'CT', nombre: 'Ciencias de la Tierra' }, { codigo: 'GH', nombre: 'Geografía, Historia y Ciudadanía' }, { codigo: 'FS', nombre: 'Formación para la Soberanía Nacional' }, { codigo: 'OC', nombre: 'Orientación y Convivencia' }, { codigo: 'PG', nombre: 'Participación en Grupos de Creación, Recreación y Producción' }
  ]
};

const MATERIA_NOMBRE_MAP: Record<string, string> = {
  'CA': 'CASTELLANO', 'IO': 'INGLES Y OTRAS LENGUAS EXTRANJERAS', 'MA': 'MATEMATICAS',
  'EF': 'EDUCACION FISICA', 'AP': 'ARTE Y PATRIMONIO', 'CN': 'CIENCIAS NATURALES',
  'GH': 'GEOGRAFIA, HISTORIA Y CIUDADANIA', 'OC': 'ORIENTACION Y CONVIVENCIA',
  'PG': 'PARTICIPACION EN GRUPOS DE CREACION, RECREACION Y PRODUCCION', 'FI': 'FISICA',
  'QU': 'QUIMICA', 'BI': 'BIOLOGIA', 'FS': 'FORMACION PARA LA SOBERANIA NACIONAL',
  'CT': 'CIENCIAS DE LA TIERRA'
};

// MATERIA_DICT: Alias y sinónimos de cada materia
const MATERIA_DICT: Record<string, { oficial: string, alias: string[] }> = {
  'CA': { oficial: 'CASTELLANO', alias: ['CASTELLANO Y LITERATURA', 'LENGUA CASTELLANA', 'CASTY LIT'] },
  'IO': { oficial: 'INGLES Y OTRAS LENGUAS EXTRANJERAS', alias: ['INGLES', 'INGLÉS', 'IDIOMA EXTRANJERO'] },
  'MA': { oficial: 'MATEMATICAS', alias: ['MATEMATICA', 'MAT', 'MATEM'] },
  'EF': { oficial: 'EDUCACION FISICA', alias: ['EDF', 'ED.FISICA', 'EDUCACIÓN FÍSICA'] },
  'AP': { oficial: 'ARTE Y PATRIMONIO', alias: ['AP', 'ARTE', 'EDUCACION ARTISTICA', 'ARTES'] },
  'CN': { oficial: 'CIENCIAS NATURALES', alias: ['CIENCIAS NATURAL', 'CIENCIAS', 'CIEN NAT'] },
  'GH': { oficial: 'GEOGRAFIA, HISTORIA Y CIUDADANIA', alias: ['GHC', 'GEOGRAFIA E HISTORIA', 'HISTORIA', 'GEOGRAFÍA, HISTORIA Y CIUDADANÍA'] },
  'OC': { oficial: 'ORIENTACION Y CONVIVENCIA', alias: ['ORIENTACION', 'CONVIVENCIA', 'ORIENTADORA', 'ORIENTACIÓN Y CONVIVENCIA'] },
  'PG': { oficial: 'PARTICIPACION EN GRUPOS DE CREACION, RECREACION Y PRODUCCION', alias: ['PGCRP', 'CRP', 'PARTICIPACION EN GRUPOS', 'GRUPOS DE CREACION'] },
  'FI': { oficial: 'FISICA', alias: ['FIS', 'FÍSICA'] },
  'QU': { oficial: 'QUIMICA', alias: ['QUI', 'QUÍMICA'] },
  'BI': { oficial: 'BIOLOGIA', alias: ['BIOL', 'BIOLOGÍA'] },
  'FS': { oficial: 'FORMACION PARA LA SOBERANIA NACIONAL', alias: ['FS', 'SOBERANIA NACIONAL', 'FORMACIÓN PARA LA SOBERANÍA NACIONAL'] },
  'CT': { oficial: 'CIENCIAS DE LA TIERRA', alias: ['CIENCIAS DE LA TIERRA Y DEL AMBIENTE', 'GEOAMBIENTAL'] }
};

export default function AsignacionDocentes() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [grado, setGrado] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<string | null>(null);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [formData, setFormData] = useState({ materiaCodigo: '', docenteCedula: '' });

  // URL del backend
  const BACKEND_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchDocentes = async () => {
      setLoadingData(true);
      try {
        const token = getToken();
        console.log('🔍 Token presente:', !!token);

        const res = await fetch(`${BACKEND_URL}/api/personal`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) {
          console.error('❌ Error HTTP:', res.status);
          setDocentes([]);
          setLoadingData(false);
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          setDocentes([]);
          setLoadingData(false);
          return;
        }

        console.log('✅ Total docentes cargados:', data.length);

        // Filtrar solo docentes válidos
        const docentesActivos = data.filter(d => {
          const esp = (d.materia_especialidad || '').toUpperCase();
          return esp && esp !== 'NULL' && esp !== '' &&
            !esp.includes('SUBDIRECTOR') &&
            !esp.includes('SECRETAR') &&
            !esp.includes('DIRECTOR') &&
            !esp.includes('COORDINADOR') &&
            !esp.includes('OBRER');
        });

        console.log('📋 Docentes con especialidad:', docentesActivos.length);
        setDocentes(docentesActivos);

      } catch (err) {
        console.error('❌ Error:', err.message);
        setDocentes([]);
      }
      finally { setLoadingData(false); }
    };
    fetchDocentes();
  }, []);

  useEffect(() => {
    if (!grado || !seccion) return;
    const fetchAsignaciones = async () => {
      try {
        const gradoId = GRADOS_IDS[grado];
        const res = await fetch(`${BACKEND_URL}/api/asignaciones-docentes?grado_id=${gradoId}&seccion=${seccion}`, {
          headers: authHeaders(),
          signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        setAsignaciones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error:', err.message);
        setAsignaciones([]);
      }
    };
    fetchAsignaciones();
  }, [grado, seccion]);

  const gradoId = grado ? GRADOS_IDS[grado] : null;
  const materiasGrado = gradoId ? MATERIAS_POR_GRADO[gradoId] : [];
  const materiasAsignadasCodigos = asignaciones.map((a: any) => a.materia_codigo);
  const materiasDisponibles = materiasGrado.filter(m => !materiasAsignadasCodigos.includes(m.codigo));

  const docentesFiltrados = formData.materiaCodigo
    ? docentes.filter(d => {
        const espDocente = (d.materia_especialidad || '').toUpperCase().trim();
        if (!espDocente) return false;
        const dictEntry = MATERIA_DICT[formData.materiaCodigo];
        if (!dictEntry) return false;
        const terminosABuscar = [dictEntry.oficial, ...dictEntry.alias];
        return terminosABuscar.some(termino =>
          espDocente === termino || espDocente.includes(termino) || termino.includes(espDocente)
        );
      })
    : [];

  const handleAsignar = async () => {
    if (!formData.docenteCedula || !formData.materiaCodigo || !gradoId || !seccion) {
      return alert('Seleccione materia y docente');
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/asignaciones-docentes/individual`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          grado_id: gradoId,
          seccion: seccion,
          materia_codigo: formData.materiaCodigo,
          docente_cedula: formData.docenteCedula
        })
      });

      if (res.ok) {
        const newAsignacion = await res.json();
        setAsignaciones(prev => [
          ...prev.filter((a: any) => a.materia_codigo !== newAsignacion.materia_codigo),
          newAsignacion
        ]);
        setFormData({ materiaCodigo: '', docenteCedula: '' });
        setSaved(true); setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Error al asignar docente');
      }
    } catch (err) { console.error(err); alert('Error de conexión'); }
    finally { setLoading(false); }
  };

  const handleEliminar = async (materiaCodigo: string) => {
    if (!confirm('¿Remover a este docente de la materia?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/asignaciones-docentes/individual`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({
          grado_id: gradoId,
          seccion: seccion,
          materia_codigo: materiaCodigo
        })
      });
      if (res.ok) {
        setAsignaciones(prev => prev.filter((a: any) => a.materia_codigo !== materiaCodigo));
      }
    } catch (err) { console.error(err); }
  };

  if (loadingData) return <div className="p-10 text-slate-400 font-bold text-center animate-pulse">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1200px] mx-auto pb-24 font-sans">
      {/* Header */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 mb-8 shadow-sm border-b-[8px] md:border-b-[12px] border-indigo-500 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none truncate">Asignación Docente</h1>
            <p className="text-[9px] font-bold text-indigo-700 uppercase tracking-[0.2em] mt-2 md:mt-3 truncate">Planificación Académica • Carga de Materias</p>
          </div>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white"><CheckSquare className="w-5 h-5" /></div>
          <p className="text-xs font-black text-emerald-800 uppercase italic">¡Docente asignado exitosamente!</p>
        </motion.div>
      )}

      {/* Selector Grado y Sección */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Seleccionar Grado y Sección</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Grado</label>
            <select value={grado || ''} onChange={e => { setGrado(e.target.value || null); setSeccion(null); }} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:border-indigo-500 focus:outline-none">
              <option value="">Seleccionar grado...</option>
              {Object.keys(NOMBRES_GRADOS).map(id => <option key={id} value={NOMBRES_GRADOS[id]}>{NOMBRES_GRADOS[id]}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sección</label>
            <div className="flex gap-2 flex-wrap">
              {TODAS_SECCIONES.map(sec => (
                <button key={sec} onClick={() => setSeccion(sec)} className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${seccion === sec ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{sec}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {grado && seccion && (
        <>
          {/* Asignaciones Actuales */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2"><BookOpen className="w-4 h-4" /> Docentes Asignados</h2>
            {asignaciones.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No hay docentes asignados a este grado y sección.</p>
            ) : (
              <div className="space-y-3">
                {asignaciones.map((asig: any) => {
                  const materia = MATERIAS_POR_GRADO[gradoId!]?.find(m => m.codigo === asig.materia_codigo);
                  return (
                    <div key={asig.materia_codigo} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{materia?.nombre || asig.materia_codigo}</p>
                        <p className="text-sm text-slate-600">{asig.nombres} {asig.apellidos}</p>
                      </div>
                      <button onClick={() => handleEliminar(asig.materia_codigo)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nueva Asignación */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Nueva Asignación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Materia</label>
                <select value={formData.materiaCodigo} onChange={e => setFormData({ ...formData, materiaCodigo: e.target.value, docenteCedula: '' })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:border-indigo-500 focus:outline-none">
                  <option value="">Seleccionar materia...</option>
                  {materiasDisponibles.map(m => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Docente ({docentesFiltrados.length} disponibles)</label>
                <select value={formData.docenteCedula} onChange={e => setFormData({ ...formData, docenteCedula: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:border-indigo-500 focus:outline-none" disabled={!formData.materiaCodigo}>
                  <option value="">Seleccionar docente...</option>
                  {docentesFiltrados.map(d => <option key={d.cedula} value={d.cedula}>{d.nombres} {d.apellidos} ({d.materia_especialidad})</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAsignar} disabled={loading || !formData.materiaCodigo || !formData.docenteCedula} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? 'Asignando...' : <><UserCheck className="w-5 h-5" /> Asignar Docente</>}
            </button>
          </div>
        </>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><div className="text-2xl font-black text-indigo-600">{Object.keys(GRADOS_IDS).length}</div><div className="text-xs text-slate-500 uppercase font-bold">Grados</div></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><div className="text-2xl font-black text-indigo-600">{docentes.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Docentes</div></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><div className="text-2xl font-black text-indigo-600">{asignaciones.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Asignaciones</div></div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><div className="text-2xl font-black text-indigo-600">{docentesFiltrados.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Filtrados</div></div>
      </div>
    </div>
  );
}
```

## PASO 4: VERIFICAR CAMBIOS

1. Reinicia el frontend: `npm run dev`
2. Abre http://localhost:8080
3. Ve a Asignación de Docentes
4. En la consola del navegador deberías ver:
   - `🔍 Token presente: true`
   - `✅ Total docentes cargados: XX`
   - `📋 Docentes con especialidad: XX`

## PROBLEMAS COMUNES Y SOLUCIONES

### Problema: ERR_CONNECTION_REFUSED
**Causa**: El backend no está corriendo
**Solución**: En otra terminal ejecuta:
```bash
cd backend
node server.js
```

### Problema: Token presente pero no carga docentes
**Causa**: La API /api/personal no existe o hay error en la consulta
**Solución**: Verifica que el backend muestre:
```
🚀 Servidor API corriendo en http://localhost:3000
```

### Verificar conexión manual:
```bash
# En otra terminal ejecuta:
curl http://localhost:3000/api/personal -H "Authorization: Bearer $(cat ~/.siga_token 2>/dev/null || echo 'tu_token_aqui')"
```

## ARCHIVOS ACTUALIZADOS EN ESTE PAQUETE

1. `AsignacionDocentes.tsx` - Componente actualizado con mejor manejo de conexión
2. `migracion_roles_separados.sql` - Script para separar roles en tablas
3. `fix_tipo_subdirectora.sql` - Script para actualizar tipo de Lisbeth Bastidas