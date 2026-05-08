import { useState, useEffect } from 'react';
import { Save, Send, Plus, Trash2, Layers, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('siga_token') || '';
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const NOMBRES_GRADOS: Record<string, string> = { '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año' };
const GRADOS_SECUNDARIA = ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año'];
const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

export default function PlanificacionDocente({ cedula, user }: { cedula: string; user?: any }) {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [planId, setPlanId] = useState<number | null>(null);

  const [grado, setGrado] = useState<string>('');
  const [secciones, setSecciones] = useState<string[]>([]);
  const [materia, setMateria] = useState<string>('');
  const [momento, setMomento] = useState<number>(1);

  const [peic, setPeic] = useState('');
  const [temaIndispensable, setTemaIndispensable] = useState('');
  const [temaGenerador, setTemaGenerador] = useState('');

  const [contenidos, setContenidos] = useState([{ tejido: '', conceptualizacion: '', referentes: '', competencias: '', estrategias: '', recursos: '' }]);
  const [evaluaciones, setEvaluaciones] = useState([{ estrategia: '', instrumento: '', prueba: '', criterios: '' }]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`${API}/api/docente/asignaciones/${cedula}`, { headers: authHeaders() });
        const data = await res.json();
        setAsignaciones(data);
        if (data.length > 0) {
          const g = NOMBRES_GRADOS[String(data[0].grado)] || String(data[0].grado);
          setGrado(g);
          setMateria(data[0].materia);
          setSecciones([...new Set(data.filter((a: any) => (NOMBRES_GRADOS[String(a.grado)] || String(a.grado)) === g).map((a: any) => a.seccion))]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, [cedula]);

  const addRow = (setter: any, template: any) => setter((prev: any) => [...prev, { ...template }]);
  const removeRow = (setter: any, idx: number) => setter((prev: any) => prev.filter((_: any, i: number) => i !== idx));
  const updateRow = (setter: any, idx: number, field: string, value: string) => {
    setter((prev: any) => { const n = [...prev]; n[idx] = { ...n[idx], [field]: value }; return n; });
  };

  const handleSave = async (enviar: boolean = false) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/docente/planificaciones`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          docente_cedula: cedula, materia, grado, secciones: secciones.join(', '), momento, peic, tema_indispensable, tema_generador, estado: enviar ? 'enviada' : 'borrador', contenidos, evaluaciones
        })
      });
      const data = await res.json();
      setPlanId(data.planId);
      setSaved(true); setTimeout(() => setSaved(false), 4000);
    } catch (err) { console.error(err); alert('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 text-slate-400 font-bold text-center animate-pulse">Cargando datos...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1600px] mx-auto pb-24 font-sans">
      <div className="bg-white rounded-[2rem] p-6 md:p-10 mb-8 shadow-sm border-b-[8px] border-blue-600 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Planificación de Clases</h1>
          <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-2">Formato Oficial MPPE • {user?.nombre || ''} {user?.apellido || ''} • C.I: {cedula}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? '...' : 'Guardar Borrador'}</button>
          <button onClick={() => handleSave(true)} disabled={saving} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> Enviar a Coord.</button>
        </div>
      </div>

      {saved && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 mb-8 flex items-center gap-3"><p className="text-xs font-black text-emerald-800 uppercase italic">¡Planificación guardada con éxito!</p></motion.div>}

      {/* Encabezado */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Área de Formación</p><p className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-xs">{materia || '—'}</p></div>
          <div><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Año / Grado</p><p className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-xs">{grado || '—'}</p></div>
          <div><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Secciones</p><p className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-black text-xs">{secciones.length > 0 ? secciones.join(', ') : '—'}</p></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Momento</p>
            <div className="flex gap-2">{[1, 2, 3].map(m => (<button key={m} onClick={() => setMomento(m)} className={`flex-1 py-3 rounded-xl font-black text-[11px] border-2 ${momento === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{m}°</button>))}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
          <div><p className="text-[9px] font-black text-blue-600 uppercase mb-2">P.E.I.C.</p><textarea value={peic} onChange={e => setPeic(e.target.value)} className="w-full min-h-[80px] p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs outline-none focus:border-blue-500 resize-none" placeholder="Proyecto Comunitario..." /></div>
          <div><p className="text-[9px] font-black text-blue-800 uppercase mb-2">Tema Indispensable</p><textarea value={temaIndispensable} onChange={e => setTemaIndispensable(e.target.value)} className="w-full min-h-[80px] p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs outline-none focus:border-blue-500 resize-none" placeholder="Ej: Fuerzas y campos..." /></div>
          <div><p className="text-[9px] font-black text-orange-600 uppercase mb-2">Tema Generador</p><textarea value={temaGenerador} onChange={e => setTemaGenerador(e.target.value)} className="w-full min-h-[80px] p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs outline-none focus:border-orange-500 resize-none" placeholder="Ej: La electricidad..." /></div>
        </div>
      </div>

      {/* Tejido Temático */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-8 py-5 bg-slate-900 flex justify-between items-center">
          <h3 className="font-black text-white uppercase italic text-sm flex items-center gap-3"><Layers className="w-5 h-5 text-blue-400" /> Tejido Temático</h3>
          <button onClick={() => addRow(setContenidos, { tejido: '', conceptualizacion: '', referentes: '', competencias: '', estrategias: '', recursos: '' })} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[9px] uppercase">+ Fila</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 w-10">#</th>
                {['Tejido Temático', 'Conceptualización', 'Referentes T-P', 'Competencias', 'Estrategias', 'Recursos'].map(h => (<th key={h} className="px-4 py-3 text-[9px] font-black text-slate-400">{h}</th>))}
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contenidos.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-mono text-slate-300 text-xs text-center">{i + 1}</td>
                  {['tejido', 'conceptualizacion', 'referentes', 'competencias', 'estrategias', 'recursos'].map(f => (
                    <td key={f} className="px-2 py-2"><textarea value={(c as any)[f]} onChange={e => updateRow(setContenidos, i, f, e.target.value)} className="w-full min-h-[60px] p-2 bg-white border-2 border-slate-100 rounded-xl text-[10px] outline-none focus:border-blue-500 resize-none" /></td>
                  ))}
                  <td className="px-4 py-2 text-center"><button onClick={() => removeRow(setContenidos, i)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluación */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-5 bg-orange-600 flex justify-between items-center">
          <h3 className="font-black text-white uppercase italic text-sm flex items-center gap-3"><ClipboardCheck className="w-5 h-5" /> Plan de Evaluación</h3>
          <button onClick={() => addRow(setEvaluaciones, { estrategia: '', instrumento: '', prueba: '', criterios: '' })} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[9px] uppercase">+ Eval.</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-orange-50 border-b-2 border-orange-100">
              <tr>
                {['Estrategias de Evaluación', 'Instrumentos', 'Pruebas', 'Criterios Cualitativos'].map(h => (<th key={h} className="px-6 py-3 text-[9px] font-black text-orange-800">{h}</th>))}
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluaciones.map((ev, i) => (
                <tr key={i} className="hover:bg-orange-50/20">
                  {['estrategia', 'instrumento', 'prueba', 'criterios'].map(f => (
                    <td key={f} className="px-4 py-3"><textarea value={(ev as any)[f]} onChange={e => updateRow(setEvaluaciones, i, f, e.target.value)} className="w-full min-h-[60px] p-2 bg-white border-2 border-orange-50 rounded-xl text-[10px] outline-none focus:border-orange-500 resize-none" /></td>
                  ))}
                  <td className="px-6 py-3 text-center"><button onClick={() => removeRow(setEvaluaciones, i)} className="p-2 text-orange-200 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
