import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Send, User, Calendar as CalendarIcon, 
  AlertTriangle, CheckSquare, Clipboard, History,
  MessageSquare, Users, ShieldCheck, Signature
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('siga_token') || '';
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const NOMBRES_GRADOS: Record<string, string> = { '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año' };
const GRADOS_IDS: Record<string, number> = { '1er Año': 16, '2do Año': 17, '3er Año': 18, '4to Año': 19, '5to Año': 20 };
const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

const situacionesOptions = [
  'Agresión verbal', 'Agresión física', 'No participación', 'Daño material',
  'Desacato al docente', 'Incumplimiento de material', 'Incumplimiento de trabajo en clase',
  'Participó en una pelea', 'Tiene una constante conducta agresiva',
  'Incumplimiento de tareas', 'Conducta peligrosa durante el receso',
  'Usó un lenguaje obsceno', 'Otros'
];

const antecedentesOptions = [
  'Llamada de atención verbal', 'Reincidió de 1 a 2 veces',
  'La titular dialogó con el niño (a)', 'Compromisos no cumplidos'
];

const accionesOptions = [
  'Diálogo con el estudiante', 'Estuvo un tiempo en la dirección de la escuela',
  'Se llamó a los padres de familia', 'Otras'
];

export default function ReporteIncidencias({ cedula }: { cedula: string }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Asignaciones y Estudiantes
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [grado, setGrado] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);

  const seccionesDelGrado = asignaciones.filter(a => a.grado === grado).reduce((acc: string[], curr) => { if (!acc.includes(curr.seccion)) acc.push(curr.seccion); return acc; }, [] as string[]);

  // Formulario
  const [formData, setFormData] = useState({
    estudianteId: '',
    fecha: new Date().toISOString().split('T')[0],
    situaciones: [] as string[],
    otraSituacion: '',
    descripcion: '',
    antecedentes: [] as string[],
    accionesTomadas: [] as string[],
    otraAccion: '',
    compromisosEstudiante: '',
    compromisosRepresentante: ''
  });

  // Cargar asignaciones
  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const res = await fetch(`${API}/api/docente/asignaciones/${cedula}`, { headers: authHeaders() });
        const data = await res.json();
        const formateadas = data.map((a: any) => ({ grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado), seccion: a.seccion }));
        setAsignaciones(formateadas);
        if (formateadas.length > 0) setGrado(formateadas[0].grado);
      } catch (err) { console.error(err); }
      finally { setLoadingData(false); }
    };
    fetchAsignaciones();
  }, [cedula]);

  // Cargar estudiantes al elegir sección
  useEffect(() => {
    if (!grado || !seccion) return;
    const fetchEstudiantes = async () => {
      try {
        const gradoId = GRADOS_IDS[grado];
        const res = await fetch(`${API}/api/estudiantes/${gradoId}/${seccion}`, { headers: authHeaders() });
        const data = await res.json();
        setEstudiantes(Array.isArray(data) ? [...data].sort((a, b) => (parseInt(String(a.cedula).replace(/\D/g, '')) || 0) - (parseInt(String(b.cedula).replace(/\D/g, '')) || 0)) : []);
      } catch (err) { console.error(err); }
    };
    fetchEstudiantes();
    setFormData(prev => ({ ...prev, estudianteId: '' })); // Reset estudiante al cambiar sección
  }, [grado, seccion]);

  // Calcular día de la semana dinámicamente
  const diaSemana = formData.fecha ? new Date(formData.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' }) : '';

  const handleCheckboxChange = (field: 'situaciones' | 'antecedentes' | 'accionesTomadas', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) return { ...prev, [field]: current.filter(item => item !== value) };
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleSave = async (enviarADireccion: boolean = false) => {
    if (!formData.estudianteId || !seccion) return alert('Seleccione un estudiante');
    setLoading(true);
    try {
      const estudianteSeleccionado = estudiantes.find(e => String(e.id) === formData.estudianteId);
      await fetch(`${API}/api/docente/incidencias`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          docente_cedula: cedula,
          estudiante_id: formData.estudianteId,
          estudiante_nombre: `${estudianteSeleccionado?.apellidos}, ${estudianteSeleccionado?.nombres}`,
          grado,
          seccion,
          fecha: formData.fecha,
          situaciones: JSON.stringify(formData.situaciones),
          otra_situacion: formData.otraSituacion,
          descripcion: formData.descripcion,
          antecedentes: JSON.stringify(formData.antecedentes),
          acciones_tomadas: JSON.stringify(formData.accionesTomadas),
          otra_accion: formData.otraAccion,
          compromisos_estudiante: formData.compromisosEstudiante,
          compromisos_representante: formData.compromisosRepresentante,
          estado: enviarADireccion ? 'enviada_direccion' : 'borrador'
        })
      });
      setSaved(true); setTimeout(() => setSaved(false), 4000);
    } catch (err) { console.error(err); alert('Error al guardar'); }
    finally { setLoading(false); }
  };

  if (loadingData) return <div className="p-10 text-slate-400 font-bold text-center animate-pulse">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1200px] mx-auto pb-24 font-sans">
      
      {/* Header */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 mb-8 shadow-sm border-b-[8px] md:border-b-[12px] border-amber-500 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none truncate">Reporte de Incidencias</h1>
            <p className="text-[9px] font-bold text-amber-700 uppercase tracking-[0.2em] mt-2 md:mt-3 truncate">Formato Oficial • Control de Disciplina</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <button onClick={() => handleSave(false)} disabled={loading} className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Procesando...' : 'Guardar Borrador'}
          </button>
          <button onClick={() => handleSave(true)} disabled={loading} className="w-full sm:w-auto px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50">
            <Send className="w-4 h-4" /> Enviar a Dirección
          </button>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white"><ShieldCheck className="w-5 h-5" /></div>
          <p className="text-xs font-black text-emerald-800 uppercase italic">¡Reporte guardado exitosamente en el historial del estudiante!</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Datos del Estudiante (Selectores Reales) */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-amber-500" /> Datos del Estudiante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Grado</p>
                <p className="text-lg font-black text-slate-800">{grado || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Sección</p>
                <div className="flex gap-2">
                  {TODAS_SECCIONES.filter(s => seccionesDelGrado.includes(s)).map(s => (
                    <button key={s} onClick={() => setSeccion(s)} className={`px-4 py-2 rounded-xl font-black text-sm ${seccion === s ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {seccion && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 ml-1">Seleccionar Estudiante</p>
                <select 
                  value={formData.estudianteId} 
                  onChange={(e) => setFormData({...formData, estudianteId: e.target.value})}
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl text-xs font-bold outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Seleccione --</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>{est.apellidos}, {est.nombres} (V-{est.cedula})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Situación y Descripción */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Descripción de la Incidencia
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {situacionesOptions.map(opt => (
                  <button key={opt} onClick={() => handleCheckboxChange('situaciones', opt)} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.situaciones.includes(opt) ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-md' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${formData.situaciones.includes(opt) ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {formData.situaciones.includes(opt) && <CheckSquare className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{opt}</span>
                  </button>
                ))}
              </div>
              {formData.situaciones.includes('Otros') && (
                <input type="text" placeholder="Especifique otra situación..." className="w-full px-6 py-4 bg-slate-50 border-2 border-amber-500 rounded-2xl text-xs font-bold outline-none" value={formData.otraSituacion} onChange={(e) => setFormData({...formData, otraSituacion: e.target.value})} />
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Breve descripción de la incidencia</label>
                <textarea rows={6} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-3xl text-xs font-bold outline-none transition-all resize-none" placeholder="Detalle lo sucedido de forma objetiva..." value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Compromisos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4"><MessageSquare className="w-4 h-4 text-blue-500" /> Compromisos del Estudiante</h3>
              <textarea rows={4} className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-xs font-bold outline-none transition-all resize-none" placeholder="Escriba los acuerdos alcanzados..." value={formData.compromisosEstudiante} onChange={(e) => setFormData({...formData, compromisosEstudiante: e.target.value})} />
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-purple-500" /> Compromisos del Representante</h3>
              <textarea rows={4} className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white rounded-2xl text-xs font-bold outline-none transition-all resize-none" placeholder="Escriba los acuerdos del representante..." value={formData.compromisosRepresentante} onChange={(e) => setFormData({...formData, compromisosRepresentante: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">Nro. de Incidencia</p>
                <h2 className="text-3xl font-black italic tracking-tighter">Automático</h2>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fecha del Suceso</p>
                    <input type="date" className="bg-transparent border-none text-xs font-bold text-white outline-none w-full" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clipboard className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Día de la Semana</p>
                    <p className="text-xs font-bold text-white uppercase">{diaSemana}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><History className="w-4 h-4 text-slate-600" /> Antecedentes</h3>
            <div className="space-y-3">
              {antecedentesOptions.map(opt => (
                <button key={opt} onClick={() => handleCheckboxChange('antecedentes', opt)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.antecedentes.includes(opt) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${formData.antecedentes.includes(opt) ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`} />
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Acciones Tomadas</h3>
            <div className="space-y-3">
              {accionesOptions.map(opt => (
                <button key={opt} onClick={() => handleCheckboxChange('accionesTomadas', opt)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.accionesTomadas.includes(opt) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${formData.accionesTomadas.includes(opt) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {formData.accionesTomadas.includes(opt) && <CheckSquare className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">{opt}</span>
                </button>
              ))}
              {formData.accionesTomadas.includes('Otras') && (
                <input type="text" placeholder="Especifique..." className="w-full px-4 py-3 bg-slate-50 border-2 border-emerald-500 rounded-xl text-[10px] font-bold outline-none" value={formData.otraAccion} onChange={(e) => setFormData({...formData, otraAccion: e.target.value})} />
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-6 border-2 border-dashed border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Signature className="w-4 h-4" /> Control de Firmas</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed italic">Al guardar, se generará una versión digital para la firma biométrica o física del representante y el directivo de guardia.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
