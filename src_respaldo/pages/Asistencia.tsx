import { useState, useEffect } from 'react';
import { UserCheck, XCircle, Clock, ShieldCheck, Calendar, Layers, Save, CheckCircle2, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;
const GRADOS_IDS: Record<string, number> = {
  '1er Año': 16, '2do Año': 17, '3er Año': 18, '4to Año': 19, '5to Año': 20,
};

const NOMBRES_GRADOS: Record<string, string> = {
  '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año',
};
const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

type EstadoAsistencia = 'presente' | 'ausente' | 'justificado' | 'tardanza';

const ESTADOS_CONFIG: { id: EstadoAsistencia; icon: any; color: string; bgActive: string; borderActive: string; label: string }[] = [
  { id: 'presente', icon: UserCheck, color: 'text-emerald-600', bgActive: 'bg-emerald-50', borderActive: 'border-emerald-300', label: 'Presente' },
  { id: 'ausente', icon: XCircle, color: 'text-red-600', bgActive: 'bg-red-50', borderActive: 'border-red-300', label: 'Ausente' },
  { id: 'justificado', icon: ShieldCheck, color: 'text-blue-600', bgActive: 'bg-blue-50', borderActive: 'border-blue-300', label: 'Justificado' },
  { id: 'tardanza', icon: Clock, color: 'text-orange-600', bgActive: 'bg-orange-50', borderActive: 'border-orange-300', label: 'Tardanza' },
];

interface Props { cedula: string; user?: any; }

export default function Asistencia({ cedula }: Props) {
  const getToken = () => localStorage.getItem('siga_token') || '';
  const authHeaders = getToken() ? { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' } : {};

  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [nomina, setNomina] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [search, setSearch] = useState('');

  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [momento, setMomento] = useState(1);
  const [reg, setReg] = useState<Record<number, EstadoAsistencia>>({});
  const [saved, setSaved] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [fechasGuardadas, setFechasGuardadas] = useState<string[]>([]);

  // 1. Cargar asignaciones
  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const res = await fetch(`${API}/api/docente/asignaciones/${cedula}`, { headers: authHeaders });
        const data = await res.json();
        console.log('Asignaciones recibidas:', data);
        
        // Convertir el grado numérico a nombre
        const formateadas = data.map((a: any) => ({
          grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado),
          seccion: a.seccion,
          materia: a.materia
        }));
        
        console.log('Asignaciones formateadas:', formateadas);
        setAsignaciones(formateadas);
        
        if (formateadas.length > 0 && formateadas[0].grado) {
          setActiveGrade(formateadas[0].grado);
        }
      } catch (err) { 
        console.error('Error cargando asignaciones:', err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAsignaciones();
  }, [cedula]);

  // Derivados
  const seccionesDelGrado = asignaciones
    .filter((a: any) => a.grado === activeGrade)
    .reduce((acc: string[], curr: any) => {
      if (!acc.includes(curr.seccion)) acc.push(curr.seccion);
      return acc;
    }, [] as string[]);

  const gradosUnicos = [...new Map(asignaciones.filter((a: any) => a.grado).map((a: any) => [a.grado, a.grado])).values()];

  const handleGradoChange = (g: string) => { 
    setActiveGrade(g); 
    setActiveSection(null); 
  };

  const materiasEnSeccion = asignaciones
    .filter((a: any) => a.grado === activeGrade && a.seccion === activeSection)
    .map((a: any) => a.materia);

  // Inicializar con el primer grado
  useEffect(() => {
    if (gradosUnicos.length > 0 && !activeGrade) {
      setActiveGrade(gradosUnicos[0]);
    }
  }, [gradosUnicos, activeGrade]);

  // 2. Cargar nómina al cambiar sección
  useEffect(() => {
    if (!activeGrade || !activeSection) {
      setNomina([]);
      setReg({});
      return;
    }
    
    const gradoId = GRADOS_IDS[activeGrade];
    if (!gradoId) return;

    const fetchData = async () => {
      try {
        const estRes = await fetch(`${API}/api/estudiantes/${gradoId}/${activeSection}`, { headers: authHeaders });
        const estData = await estRes.json();
        
        const cleanData = Array.isArray(estData) ? [...estData].sort((a, b) => {
          const numA = parseInt(String(a.cedula).replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(String(b.cedula).replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        }) : [];
        
        setNomina(cleanData);

        const r: Record<number, EstadoAsistencia> = {};
        cleanData.forEach(e => { r[e.id] = 'presente'; });
        setReg(r);
      } catch (err) { 
        console.error(err); 
        setNomina([]); 
      }
    };
    fetchData();
  }, [activeGrade, activeSection]);

  const handleSetEstado = (id: number, estado: EstadoAsistencia) => {
    setReg(prev => ({ ...prev, [id]: estado }));
    setSaved(false);
  };

  const marcarTodos = (estado: EstadoAsistencia) => {
    const r: Record<number, EstadoAsistencia> = {};
    nomina.forEach(e => { r[e.id] = estado; });
    setReg(r);
    setSaved(false);
  };

  const loadHistorial = async () => {
    if (!activeGrade || !activeSection) return;
    const gradoId = GRADOS_IDS[activeGrade];
    try {
      const res = await fetch(`${API}/api/docente/asistencia/historial/${gradoId}/${activeSection}/${cedula}`, { headers: authHeaders });
      const data = await res.json();
      setFechasGuardadas(Array.isArray(data) ? data : []);
      setHistorialOpen(true);
    } catch (err) {
      setFechasGuardadas([]);
      setHistorialOpen(true);
    }
  };

  const handleGuardar = async () => {
    if (!activeGrade || !activeSection || nomina.length === 0) return;
    setLoadingSave(true);
    try {
      const gradoId = GRADOS_IDS[activeGrade];
      const registros = nomina.map(e => ({ estudiante_id: e.id, estado: reg[e.id] || 'presente' }));
      
      await fetch(`${API}/api/docente/asistencia`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          registros,
          fecha,
          momento,
          seccion_id: gradoId,
          docente_cedula: cedula
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error guardando:', err);
    } finally {
      setLoadingSave(false);
    }
  };

  // Cálculos KPI
  const presentes = Object.values(reg).filter(e => e === 'presente').length;
  const ausentes = Object.values(reg).filter(e => e === 'ausente').length;
  const justificados = Object.values(reg).filter(e => e === 'justificado').length;
  const tardanzas = Object.values(reg).filter(e => e === 'tardanza').length;
  const pct = nomina.length > 0 ? Math.round((presentes / nomina.length) * 100) : 0;

  if (loading) return <div className="p-10 text-slate-400 font-bold text-center animate-pulse">Cargando control de asistencia...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1400px] mx-auto pb-24">

      {/* HEADER */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] px-6 md:px-10 py-6 md:py-8 mb-8 shadow-sm border-b-[8px] md:border-b-[12px] border-blue-600 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Control de Asistencia</h1>
          {(() => {
            try {
              const raw = localStorage.getItem('siga_token') || '';
              const payload = JSON.parse(atob(raw.split('.')[1]));
              return (
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-3 leading-tight">
                  Nómina oficial — Docente: {payload.nombres} {payload.apellidos}
                </p>
              );
            } catch { return null; }
          })()}
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {saved && <span className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
          <button onClick={loadHistorial} disabled={!activeSection} className="flex items-center justify-center gap-2 w-full lg:w-auto px-5 py-3 lg:py-2.5 rounded-xl bg-white text-slate-700 font-black text-[10px] uppercase tracking-widest border-2 border-slate-200 hover:bg-slate-50 transition disabled:opacity-30">
            <CalendarDays className="w-4 h-4" /> Mis Registros
          </button>
          <button onClick={handleGuardar} disabled={loadingSave || !activeSection} className="siga-btn-primary flex items-center justify-center gap-2 w-full lg:w-auto disabled:opacity-50">
            <Save className="w-4 h-4" /> {loadingSave ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* 5 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
        {[
          { l: 'Asistentes', v: presentes, c: 'border-emerald-500', t: 'text-emerald-600' },
          { l: 'Inasistentes', v: ausentes, c: 'border-red-500', t: 'text-red-600' },
          { l: 'Justificados', v: justificados, c: 'border-blue-500', t: 'text-blue-600' },
          { l: 'Tardanzas', v: tardanzas, c: 'border-orange-500', t: 'text-orange-600' },
          { l: '% Asistencia', v: `${pct}%`, c: 'border-purple-500', t: 'text-purple-600' },
        ].map((k, i) => (
          <motion.div key={k.l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 shadow-sm border-l-8 ${k.c}`}>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{k.l}</p>
            <span className={`text-2xl md:text-4xl font-black italic tracking-tighter ${k.t}`}>{k.v}</span>
          </motion.div>
        ))}
      </div>

      {/* MOMENTO + FECHA + GRADO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border-l-8 border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Momento</p>
          <div className="flex gap-2">
            {[1, 2, 3].map(m => (
              <button key={m} onClick={() => setMomento(m)}
                className={`flex-1 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2
                  ${momento === m ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
              >{m}°</button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border-l-8 border-blue-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Fecha</p>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm text-slate-700 transition" />
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border-l-8 border-emerald-500">
          {gradosUnicos && gradosUnicos.length > 1 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2">Seleccionar Grado / Año:</p>
              <div className="flex flex-wrap gap-2">
                {gradosUnicos.map(g => (
                  <button key={g} onClick={() => handleGradoChange(g)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${activeGrade === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>{g}</button>
                ))}
              </div>
            </div>
          )}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Grado / Materia</p>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{activeGrade || '—'}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-7">{materiasEnSeccion.join(' / ') || 'Sin asignar'}</p>
        </div>
      </div>

      {/* BOTONES SECCIÓN A-E */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Pulse una sección para tomar asistencia:</p>
          <div className="flex gap-2">
            <button onClick={() => marcarTodos('presente')} disabled={!activeSection} className="px-4 py-2.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-black text-[9px] uppercase tracking-widest hover:bg-emerald-100 transition disabled:opacity-30">P. Todos</button>
            <button onClick={() => marcarTodos('ausente')} disabled={!activeSection} className="px-4 py-2.5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition disabled:opacity-30">A. Todos</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {TODAS_SECCIONES.map(s => {
            const available = seccionesDelGrado.includes(s);
            return (
              <button key={s} disabled={!available} onClick={() => setActiveSection(s)}
                className={`py-5 rounded-[1.5rem] font-black text-xl md:text-2xl transition-all border-4 flex flex-col items-center justify-center gap-1
                  ${!available ? 'bg-slate-50 border-slate-50 text-slate-200 cursor-not-allowed opacity-50' :
                    activeSection === s ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'}
                `}>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Sección</span>{s}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO */}
      <AnimatePresence mode="wait">
        {!activeSection ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
            <UserCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">Seleccione una sección para pasar lista</h3>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 bg-slate-900 flex justify-between items-center">
              <h3 className="font-black text-white uppercase italic tracking-tighter text-sm">Asistencia: {activeGrade} "{activeSection}" — {fecha}</h3>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{nomina.length} Registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase w-12">#</th>
                    <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Estudiante</th>
                    <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nomina.length === 0 ? (
                    <tr><td colSpan={3} className="px-8 py-16 text-center font-black text-slate-300 uppercase italic">Sin estudiantes en esta sección</td></tr>
                  ) : (
                    nomina.map((est, idx) => (
                      <tr key={est.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-4 md:px-6 py-4 font-mono font-black text-slate-300 text-xs">{idx + 1}</td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-[10px] flex-shrink-0 group-hover:scale-110 transition-transform">
                              {est.nombres?.[0]}{est.apellidos?.[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 uppercase text-[11px] leading-tight">{est.apellidos}, {est.nombres}</p>
                              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase mt-0.5">V-{est.cedula || '——'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex justify-center gap-1.5 md:gap-2">
                            {ESTADOS_CONFIG.map(btn => {
                              const Icon = btn.icon;
                              const isActive = reg[est.id] === btn.id;
                              return (
                                <button key={btn.id} onClick={() => handleSetEstado(est.id, btn.id)}
                                  className={`p-2.5 md:p-3 rounded-2xl border-2 transition-all flex items-center justify-center
                                    ${isActive ? `${btn.bgActive} ${btn.borderActive} ${btn.color} shadow-md scale-110` : 'bg-slate-50 border-transparent text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                                  title={btn.label}
                                >
                                  <Icon className="w-5 h-5" />
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL HISTORIAL */}
      <Modal open={historialOpen} onClose={() => setHistorialOpen(false)}>
        <div className="bg-slate-900 mb-0 px-8 py-6 flex justify-between items-center rounded-t-[2.5rem]">
          <h2 className="font-black uppercase tracking-tighter italic text-xl text-white">Fechas Registradas</h2>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/40 transition" onClick={() => setHistorialOpen(false)}>
            <XCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {fechasGuardadas.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-black text-slate-300 uppercase text-sm">Aún no hay registros guardados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fechasGuardadas.map(f => (
                <div key={f} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 uppercase text-sm">{f}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-[2.5rem] max-w-md w-full overflow-visible border-b-[12px] border-blue-600 shadow-2xl">
        {children}
      </motion.div>
    </motion.div>
  );
}
