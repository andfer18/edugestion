import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, BookOpen, UserCheck, PlusCircle, Trash2, 
  AlertTriangle, CheckSquare, Users, GraduationCap
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
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

export default function AsignacionDocentes() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [grado, setGrado] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<string | null>(null);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    materiaCodigo: '',
    docenteCedula: ''
  });

  // Cargar lista general de docentes
  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await fetch(`${API}/api/personal`, { headers: authHeaders() });
        const data = await res.json();
        setDocentes(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
      finally { setLoadingData(false); }
    };
    fetchDocentes();
  }, []);

  // Cargar asignaciones existentes al elegir grado y sección
  useEffect(() => {
    if (!grado || !seccion) return;
    const fetchAsignaciones = async () => {
      try {
        const gradoId = GRADOS_IDS[grado];
        const res = await fetch(`${API}/api/asignaciones-docentes?grado_id=${gradoId}&seccion=${seccion}`, { headers: authHeaders() }); 
        const data = await res.json();
        setAsignaciones(Array.isArray(data) ? data : []);
      } catch (err) { 
        console.error(err); 
        setAsignaciones([]);
      }
    };
    fetchAsignaciones();
  }, [grado, seccion]);

  const gradoId = grado ? GRADOS_IDS[grado] : null;
  const materiasGrado = gradoId ? MATERIAS_POR_GRADO[gradoId] : [];
  const materiasAsignadasCodigos = asignaciones.map((a: any) => a.materia_codigo);
  const materiasDisponibles = materiasGrado.filter(m => !materiasAsignadasCodigos.includes(m.codigo));

  // Filtrar docentes por la materia seleccionada
    // 🚀 FILTRO INTELIGENTE: Busca por nombre oficial, código o abreviatura histórica
  const docentesFiltrados = formData.materiaCodigo 
    ? docentes.filter(d => {
        const espDocente = (d.materia_especialidad || '').toUpperCase().trim();
        if (!espDocente) return false;

        const dictEntry = MATERIA_DICT[formData.materiaCodigo];
        if (!dictEntry) return false;

        // Palabras clave a buscar: el nombre oficial + todos sus alias
        const terminosABuscar = [dictEntry.oficial, ...dictEntry.alias];

        // Comprobamos si la especialidad del docente coincide con alguno de los términos
        return terminosABuscar.some(termino => 
          espDocente === termino || 
          espDocente.includes(termino) || 
          termino.includes(espDocente)
        );
      })
    : [];

  const handleAsignar = async () => {
    if (!formData.docenteCedula || !formData.materiaCodigo || !gradoId || !seccion) {
      return alert('Seleccione materia y docente');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/asignaciones-docentes/individual`, {
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
      const res = await fetch(`${API}/api/asignaciones-docentes/individual`, { 
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda (Selección) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Selección de Grado y Sección */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-indigo-500" /> Seleccionar Sección
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest">Grado</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(GRADOS_IDS).map(g => (
                    <button key={g} onClick={() => { setGrado(g); setSeccion(null); setAsignaciones([]); }} className={`px-5 py-3 rounded-2xl font-black text-xs transition-all ${grado === g ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {grado && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest">Sección</p>
                  <div className="flex gap-2">
                    {TODAS_SECCIONES.map(s => (
                      <button key={s} onClick={() => setSeccion(s)} className={`px-6 py-3 rounded-xl font-black text-sm ${seccion === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Asignación */}
          {seccion && (
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
                <PlusCircle className="w-5 h-5 text-emerald-500" /> Nueva Asignación
              </h3>
              
              {materiasDisponibles.length === 0 ? (
                 <div className="p-6 bg-slate-50 rounded-2xl text-center">
                    <p className="text-xs font-black text-emerald-600 uppercase italic">¡Todas las materias de este grado ya tienen docente asignado!</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block tracking-widest">1. Materia Disponible</label>
                    <select 
                      value={formData.materiaCodigo} 
                      onChange={(e) => setFormData({...formData, materiaCodigo: e.target.value, docenteCedula: ''})} 
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-xs font-bold outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Seleccione Materia --</option>
                      {materiasDisponibles.map(mat => (
                        <option key={mat.codigo} value={mat.codigo}>{mat.nombre} ({mat.codigo})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block tracking-widest">2. Docente Especialista</label>
                    <select 
                      value={formData.docenteCedula} 
                      onChange={(e) => setFormData({...formData, docenteCedula: e.target.value})}
                      disabled={!formData.materiaCodigo} 
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-xs font-bold outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Seleccione Docente --</option>
                      {docentesFiltrados.length > 0 ? (
                        docentesFiltrados.map(doc => (
                          <option key={doc.cedula} value={doc.cedula}>{doc.apellidos}, {doc.nombres}</option>
                        ))
                      ) : (
                        formData.materiaCodigo ? <option disabled value="">No hay docentes para esta materia</option> : null
                      )}
                    </select>
                  </div>
                  
                  <button onClick={handleAsignar} disabled={loading || !formData.materiaCodigo || !formData.docenteCedula} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    <PlusCircle className="w-4 h-4" /> {loading ? 'Guardando...' : 'Asignar'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha (Listado Actual) */}
        <div className="space-y-8">
          
          {/* Card Dark - Resumen */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Planificación</p>
                <h2 className="text-2xl font-black italic tracking-tighter">{grado || '—'} {seccion || ''}</h2>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Asignadas</p>
                  <p className="text-xl font-black">{asignaciones.length} / {materiasGrado.length}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${asignaciones.length === materiasGrado.length && materiasGrado.length > 0 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                  {asignaciones.length === materiasGrado.length && materiasGrado.length > 0 ? 'Completa' : 'Incompleta'}
                </div>
              </div>
            </div>
          </div>

          {/* Listado de Docentes Actuales */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Users className="w-4 h-4 text-slate-600" /> Docentes Asignados
            </h3>
            {asignaciones.length === 0 ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">No hay docentes asignados aún para esta sección</p>
              </div>
            ) : (
              <div className="space-y-3">
                {asignaciones.map((asig: any) => {
                  const materiaInfo = materiasGrado.find(m => m.codigo === asig.materia_codigo);
                  return (
                    <div key={asig.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-slate-200 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0">
                          {asig.materia_codigo}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-800 truncate">{materiaInfo?.nombre || asig.materia_codigo}</p>
                          <p className="text-[9px] font-bold text-slate-500 truncate">{asig.nombres ? `${asig.nombres} ${asig.apellidos}` : `V-${asig.personal_cedula}`}</p>
                        </div>
                      </div>
                      <button onClick={() => handleEliminar(asig.materia_codigo)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
			<Trash2 className="w-4 h-4" />
		      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
