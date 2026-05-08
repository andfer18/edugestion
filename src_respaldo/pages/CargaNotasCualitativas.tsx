import { useState, useEffect } from 'react';
import { Save, Plus, X, Trash2, Lock, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('siga_token') || '';
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const NOMBRES_GRADOS: Record<string, string> = { '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año' };
const GRADOS_IDS: Record<string, number> = { '1er Año': 16, '2do Año': 17, '3er Año': 18, '4to Año': 19, '5to Año': 20 };
const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

interface Evaluacion { id?: number; nombre: string; puntaje_maximo: number; }

export default function CargaNotasCualitativas({ cedula }: { cedula: string }) {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [grado, setGrado] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<string | null>(null);
  const [materiaNombre, setMateriaNombre] = useState<string>('');
  const [momento, setMomento] = useState<number>(1);

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [notas, setNotas] = useState<Record<number, Record<number, number | null>>>({});
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const res = await fetch(`${API}/api/docente/asignaciones/${cedula}`, { headers: authHeaders() });
        const data = await res.json();
        const formateadas = data.map((a: any) => ({ grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado), seccion: a.seccion, materia: a.materia }));
        setAsignaciones(formateadas);
        if (formateadas.length > 0) setGrado(formateadas[0].grado);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAsignaciones();
  }, [cedula]);

  const gradosUnicos = [...new Map(asignaciones.map(a => [a.grado, a.grado])).values()];
  const seccionesDelGrado = asignaciones.filter(a => a.grado === grado).reduce((acc: string[], curr) => { if (!acc.includes(curr.seccion)) acc.push(curr.seccion); return acc; }, [] as string[]);

  const handleGradoChange = (g: string) => { setGrado(g); setSeccion(null); };

  useEffect(() => {
    if (grado && seccion) { const asig = asignaciones.find(a => a.grado === grado && a.seccion === seccion); if (asig) setMateriaNombre(asig.materia); }
  }, [grado, seccion, asignaciones]);

  useEffect(() => {
    if (!grado || !seccion) return;
    const fetchData = async () => {
      try {
        const gradoId = GRADOS_IDS[grado];
        
        const estRes = await fetch(`${API}/api/estudiantes/${gradoId}/${seccion}`, { headers: authHeaders() });
        const estData = await estRes.json();
        setEstudiantes(Array.isArray(estData) ? [...estData].sort((a, b) => (parseInt(String(a.cedula).replace(/\D/g, '')) || 0) - (parseInt(String(b.cedula).replace(/\D/g, '')) || 0)) : []);

        if (materiaNombre) {
          const evalRes = await fetch(`${API}/api/docente/evaluaciones?grado_id=${gradoId}&seccion=${seccion}&materia=${materiaNombre}&momento=${momento}&tipo=cualitativa`, { headers: authHeaders() });
          const evalData = await evalRes.json();
          setEvaluaciones(evalData);

          if (evalData.length > 0) {
            const ids = evalData.map((e: any) => e.id);
            const notasRes = await fetch(`${API}/api/docente/notas-detalladas/get`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ evaluaciones_ids: ids }) });
            const notasData = await notasRes.json();
            const map: Record<number, Record<number, number | null>> = {};
            notasData.forEach((n: any) => { if (!map[n.estudiante_id]) map[n.estudiante_id] = {}; map[n.estudiante_id][n.evaluacion_id] = n.nota_valor; });
            setNotas(map);
          } else { setNotas({}); }
        } else { setEvaluaciones([]); setNotas({}); }

        const cierreRes = await fetch(`${API}/api/momentos/cerrado?lapso=${momento}`, { headers: authHeaders() });
        setIsClosed((await cierreRes.json()).cerrado);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [grado, seccion, materiaNombre, momento]);

  const handleNotaChange = (estId: number, evalId: number, valor: string, max: number) => {
    if (isClosed) return;
    const nota = valor === '' ? null : parseInt(valor);
    if (nota !== null && (nota < 0 || nota > max)) return;
    setNotas(prev => ({ ...prev, [estId]: { ...prev[estId], [evalId]: nota } }));
    setSaved(false);
  };

  const agregarEvaluacion = async (data: any) => {
    try {
      const res = await fetch(`${API}/api/docente/evaluaciones`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...data, grado_id: GRADOS_IDS[grado], seccion, materia: materiaNombre, momento, tipo: 'cualitativa', docente_cedula: cedula }) });
      const nueva = await res.json();
      setEvaluaciones(prev => [...prev, nueva]);
      setShowModal(false);
      setNotas(prev => {
        const nuevoMap = { ...prev };
        estudiantes.forEach(est => { if (!nuevoMap[est.id]) nuevoMap[est.id] = {}; nuevoMap[est.id][nueva.id] = null; });
        return nuevoMap;
      });
    } catch (err) { console.error(err); }
  };

  const eliminarEvaluacion = async (id: number) => {
    if (!confirm('¿Eliminar este criterio y todas sus notas?')) return;
    await fetch(`${API}/api/docente/evaluaciones/${id}`, { method: 'DELETE', headers: authHeaders() });
    setEvaluaciones(prev => prev.filter(e => e.id !== id));
    setNotas(prev => {
      const nuevoMap = { ...prev };
      Object.keys(nuevoMap).forEach(estId => { delete nuevoMap[parseInt(estId)][id]; });
      return nuevoMap;
    });
  };

  const guardarNotas = async () => {
    setSaving(true);
    try {
      const payload = [];
      for (const est of estudiantes) { for (const ev of evaluaciones) { const nota = notas[est.id]?.[ev.id!] ?? null; if (nota !== null) payload.push({ evaluacion_id: ev.id, estudiante_id: est.id, nota_valor: nota }); } }
      await fetch(`${API}/api/docente/notas-detalladas`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ notas: payload }) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const calcularDefinitiva = (estId: number) => {
    const notasEst = notas[estId] || {};
    const vals = Object.values(notasEst).filter(n => n !== null) as number[];
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0);
  };

  if (loading) return <div className="p-10 text-slate-400 font-bold text-center animate-pulse">Cargando sistema...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1600px] mx-auto pb-24">
      <div className="bg-white rounded-[2rem] px-6 md:px-10 py-6 md:py-8 mb-8 shadow-sm border-b-[8px] border-purple-600 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Notas Cualitativas</h1>
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-[0.2em] mt-3">Sumatoria de criterios de evaluación</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 text-[10px] font-black"><CheckCircle className="w-4 h-4" />Guardado</span>}
          <button onClick={() => setShowModal(true)} disabled={isClosed || !seccion} className="px-5 py-3 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-purple-200 hover:bg-purple-100 transition disabled:opacity-30"><Plus className="w-4 h-4 inline mr-1" /> Nuevo Criterio</button>
          <button onClick={guardarNotas} disabled={saving || isClosed || evaluaciones.length === 0} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Momento</p>
            <div className="flex gap-2">{[1, 2, 3].map(m => (<button key={m} onClick={() => setMomento(m)} className={`flex-1 py-3 rounded-2xl font-black text-[11px] uppercase border-2 ${momento === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{m}°</button>))}</div>
          </div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Grado</p><p className="text-xl font-black text-slate-800">{grado || '—'}</p></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Sección</p>
            <div className="flex gap-2">{TODAS_SECCIONES.filter(s => seccionesDelGrado.includes(s)).map(s => (<button key={s} onClick={() => setSeccion(s)} className={`px-4 py-2 rounded-xl font-black text-sm ${seccion === s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</button>))}</div>
          </div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Asignatura</p><p className="text-xl font-black text-slate-800">{materiaNombre || '—'}</p></div>
        </div>
      </div>

      {isClosed && (<div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 mb-8 flex items-center gap-4"><Lock className="w-8 h-8 text-red-600" /><div><h4 className="font-black text-red-900">Momento Cerrado</h4><p className="text-[10px] text-red-600">Este lapso ha sido cerrado por Control de Estudios.</p></div></div>)}

      {!seccion ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
          <Star className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-300">Seleccione una sección</h3>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 bg-slate-900 flex justify-between">
            <h3 className="font-black text-white">{grado} - Sección {seccion} - {momento}° Momento</h3>
            <span className="text-[10px] text-purple-400">{estudiantes.length} estudiantes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400">#</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400">Estudiante</th>
                  
                  {evaluaciones.length === 0 ? (
                    <th className="px-4 py-4 text-center text-[10px] font-black text-purple-400 uppercase italic">Sin criterios definidos</th>
                  ) : (
                    <>
                      {evaluaciones.map(ev => (
                        <th key={ev.id} className="px-2 py-4 text-center min-w-[100px]">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-[10px] font-black">{ev.nombre}</span>
                            {!isClosed && <button onClick={() => eliminarEvaluacion(ev.id!)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>}
                          </div>
                          <p className="text-[8px] text-purple-500 font-black">Máx: {ev.puntaje_maximo} pts</p>
                        </th>
                      ))}
                      <th className="px-4 py-4 text-center text-[10px] font-black text-purple-600 bg-purple-50">DEFINITIVA</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {estudiantes.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 text-sm">Cargando nómina...</td></tr>
                ) : (
                  estudiantes.map((est, idx) => (
                    <tr key={est.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3"><p className="font-bold text-sm">{est.apellidos}, {est.nombres}</p><p className="text-[9px] text-slate-400">V-{est.cedula}</p></td>
                      
                      {evaluaciones.length === 0 ? (
                        <td className="px-4 py-3 text-center text-slate-300 text-xs italic">—</td>
                      ) : (
                        <>
                          {evaluaciones.map(ev => {
                            const nota = notas[est.id]?.[ev.id!] ?? '';
                            return (
                              <td key={ev.id} className="px-2 py-2 text-center">
                                <input type="number" min="0" max={ev.puntaje_maximo} value={nota === null ? '' : nota} onChange={(e) => handleNotaChange(est.id, ev.id!, e.target.value, ev.puntaje_maximo)} disabled={isClosed} className="w-16 h-10 text-center font-black rounded-xl border-2 border-slate-200 focus:border-purple-500 outline-none disabled:bg-slate-50" />
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center bg-purple-50/50">
                            <span className={`font-black text-lg ${calcularDefinitiva(est.id) !== null && calcularDefinitiva(est.id)! >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {calcularDefinitiva(est.id) !== null ? calcularDefinitiva(est.id) : '—'}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 text-right text-[9px] text-slate-400">La Definitiva es la sumatoria de los criterios cargados.</div>
        </div>
      )}

      <ModalEval open={showModal} onClose={() => setShowModal(false)} onSave={agregarEvaluacion} />
    </div>
  );
}

function ModalEval({ open, onClose, onSave }: any) {
  const [nombre, setNombre] = useState('');
  const [puntaje, setPuntaje] = useState(5);
  if (!open) return null;
  const handleSubmit = () => { if (!nombre.trim()) return; onSave({ nombre, puntaje_maximo: puntaje }); onClose(); setNombre(''); setPuntaje(5); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[2rem] max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">Nuevo Criterio Cualitativo</h3><button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button></div>
        <div className="space-y-4">
          <input type="text" placeholder="Ej: Participación, Trabajo en Equipo..." value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-3 rounded-xl border-2 border-slate-200 font-black text-sm" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Puntaje Máximo</p>
            <input type="number" value={puntaje} onChange={e => setPuntaje(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-xl border-2 border-slate-200 font-black text-sm" />
            <p className="text-[8px] text-purple-500 mt-1 font-bold">Ej: 5 pts. Si crea 4 criterios de 5 pts, la suma da 20.</p>
          </div>
        </div>
        <button onClick={handleSubmit} className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-black text-sm">Crear Criterio</button>
      </div>
    </div>
  );
}
