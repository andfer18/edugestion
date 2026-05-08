import { useState, useEffect } from 'react';
import { Lock, Calculator, Award, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('siga_token') || '';
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const NOMBRES_GRADOS: Record<string, string> = { '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año' };
const GRADOS_IDS: Record<string, number> = { '1er Año': 16, '2do Año': 17, '3er Año': 18, '4to Año': 19, '5to Año': 20 };
const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

export default function NotasDefinitivas({ cedula }: { cedula?: string }) {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [grado, setGrado] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<string | null>(null);
  const [materiaNombre, setMateriaNombre] = useState<string>('');
  const [momento, setMomento] = useState<number>(1);

  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [notasFinales, setNotasFinales] = useState<Record<number, { cuanti: number | null; cuali: number | null; def: number | null }>>({});
  const [isClosed, setIsClosed] = useState(false);

  const [stats, setStats] = useState({ aprobados: 0, reprobados: 0, promedio: 0 });

  // 1. Cargar asignaciones
  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const res = await fetch(`${API}/api/docente/asignaciones/${cedula}`, { headers: authHeaders() });
        const data = await res.json();
        const formateadas = data.map((a: any) => ({ grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado), seccion: a.seccion, materia: a.materia }));
        setAsignaciones(formateadas);
        if (formateadas.length > 0) setGrado(formateadas[0].grado);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAsignaciones();
  }, [cedula]);

  const gradosUnicos = [...new Map(asignaciones.map(a => [a.grado, a.grado])).values()];
  const seccionesDelGrado = asignaciones.filter(a => a.grado === grado).reduce((acc: string[], curr) => { if (!acc.includes(curr.seccion)) acc.push(curr.seccion); return acc; }, [] as string[]);

  const handleGradoChange = (g: string) => { setGrado(g); setSeccion(null); };

  useEffect(() => {
    if (grado && seccion) { const asig = asignaciones.find(a => a.grado === grado && a.seccion === seccion); if (asig) setMateriaNombre(asig.materia); }
  }, [grado, seccion, asignaciones]);

  // 2. Cargar datos y calcular definitivas
  useEffect(() => {
    if (!grado || !seccion) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const gradoId = GRADOS_IDS[grado];

        // Estudiantes
        const estRes = await fetch(`${API}/api/estudiantes/${gradoId}/${seccion}`, { headers: authHeaders() });
        const estData = await estRes.json();
        const sorted = Array.isArray(estData) ? [...estData].sort((a, b) => (parseInt(String(a.cedula).replace(/\D/g, '')) || 0) - (parseInt(String(b.cedula).replace(/\D/g, '')) || 0)) : [];
        setEstudiantes(sorted);

        // Evaluaciones Cuantitativas
        const cuantiRes = await fetch(`${API}/api/docente/evaluaciones?grado_id=${gradoId}&seccion=${seccion}&materia=${materiaNombre}&momento=${momento}&tipo=cuantitativa`, { headers: authHeaders() });
        const cuantiEvals = await cuantiRes.json();

        // Evaluaciones Cualitativas
        const cualiRes = await fetch(`${API}/api/docente/evaluaciones?grado_id=${gradoId}&seccion=${seccion}&materia=${materiaNombre}&momento=${momento}&tipo=cualitativa`, { headers: authHeaders() });
        const cualiEvals = await cualiRes.json();

        // Notas Cuantitativas (Masivo)
        let mapaCuanti: Record<number, number[]> = {};
        if (cuantiEvals.length > 0) {
          const idsC = cuantiEvals.map((e: any) => e.id);
          const notasCRes = await fetch(`${API}/api/docente/notas-detalladas/get`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ evaluaciones_ids: idsC }) });
          const notasC = await notasCRes.json();
          notasC.forEach((n: any) => {
            if (!mapaCuanti[n.estudiante_id]) mapaCuanti[n.estudiante_id] = [];
            mapaCuanti[n.estudiante_id].push(n.nota_valor);
          });
        }

        // Notas Cualitativas (Masivo)
        let mapaCuali: Record<number, number[]> = {};
        if (cualiEvals.length > 0) {
          const idsQ = cualiEvals.map((e: any) => e.id);
          const notasQRes = await fetch(`${API}/api/docente/notas-detalladas/get`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ evaluaciones_ids: idsQ }) });
          const notasQ = await notasQRes.json();
          notasQ.forEach((n: any) => {
            if (!mapaCuali[n.estudiante_id]) mapaCuali[n.estudiante_id] = [];
            mapaCuali[n.estudiante_id].push(n.nota_valor);
          });
        }

        // Calcular Definitivas
        const resultados: Record<number, { cuanti: number | null; cuali: number | null; def: number | null }> = {};
        let totalAprobados = 0;
        let totalReprobados = 0;
        let sumaDefinitivas = 0;
        let countDefinitivas = 0;

        for (const est of sorted) {
          const notasC = mapaCuanti[est.id] || [];
          const notasQ = mapaCuali[est.id] || [];

          // Sumatorias puras (tal como se definió)
          const sumCuanti = notasC.length > 0 ? notasC.reduce((a, b) => a + b, 0) : null;
          const sumCuali = notasQ.length > 0 ? notasQ.reduce((a, b) => a + b, 0) : null;

          let definitiva: number | null = null;
          if (sumCuanti !== null && sumCuali !== null) {
            // Fórmula de la MPPE: (Cuantitativo * 0.70) + (Cualitativo * 0.30)
            definitiva = (sumCuanti * 0.7) + (sumCuali * 0.3);
          } else if (sumCuanti !== null) {
            definitiva = sumCuanti; // Si solo hay cuantitativas, esa es la definitiva
          } else if (sumCuali !== null) {
            definitiva = sumCuali; // Si solo hay cualitativas, esa es la definitiva
          }

          const defRedondeada = definitiva !== null ? Math.round(definitiva * 100) / 100 : null;
          
          resultados[est.id] = { cuanti: sumCuanti, cuali: sumCuali, def: defRedondeada };

          if (defRedondeada !== null) {
            if (defRedondeada >= 10) totalAprobados++; else totalReprobados++;
            sumaDefinitivas += defRedondeada;
            countDefinitivas++;
          }
        }

        setNotasFinales(resultados);
        setStats({
          aprobados: totalAprobados,
          reprobados: totalReprobados,
          promedio: countDefinitivas > 0 ? Math.round((sumaDefinitivas / countDefinitivas) * 100) / 100 : 0
        });

        // Verificar cierre
        try {
          const cierreRes = await fetch(`${API}/api/momentos/cerrado?lapso=${momento}`, { headers: authHeaders() });
          setIsClosed((await cierreRes.json()).cerrado);
        } catch { setIsClosed(false); }

      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [grado, seccion, materiaNombre, momento]);

  const formatear = (n: number | null) => n === null ? '—' : (Number.isInteger(n) ? n.toString() : n.toFixed(2));
  const getColor = (n: number | null) => { if (n === null) return 'text-slate-300'; if (n >= 15) return 'text-emerald-600'; if (n >= 10) return 'text-yellow-600'; return 'text-red-600'; };

  if (loading && estudiantes.length === 0) return <div className="p-10 text-slate-400 font-bold text-center animate-pulse">Cargando definitivas...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1600px] mx-auto pb-24">
      
      <div className="bg-white rounded-[2rem] px-6 md:px-10 py-6 md:py-8 mb-8 shadow-sm border-b-[8px] border-blue-600 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Notas Definitivas</h1>
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-3">Fórmula: (Cuantitativo × 70%) + (Cualitativo × 30%)</p>
        </div>
        {isClosed && (<div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 border border-red-200"><Lock className="w-4 h-4 text-red-600" /><span className="text-[9px] font-black text-red-600 uppercase">Momento Cerrado</span></div>)}
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[1.5rem] p-5 text-white shadow-lg flex justify-between items-center">
          <div><p className="text-[9px] font-black uppercase opacity-80">Aprobados</p><p className="text-3xl font-black">{stats.aprobados}</p></div>
          <Award className="w-8 h-8 opacity-80" />
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-[1.5rem] p-5 text-white shadow-lg flex justify-between items-center">
          <div><p className="text-[9px] font-black uppercase opacity-80">Reprobados</p><p className="text-3xl font-black">{stats.reprobados}</p></div>
          <TrendingDown className="w-8 h-8 opacity-80" />
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[1.5rem] p-5 text-white shadow-lg flex justify-between items-center">
          <div><p className="text-[9px] font-black uppercase opacity-80">Promedio del Grupo</p><p className="text-3xl font-black">{formatear(stats.promedio)} pts</p></div>
          <Calculator className="w-8 h-8 opacity-80" />
        </div>
      </div>

      {/* SELECTORES */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Momento</p>
            <div className="flex gap-2">{[1, 2, 3].map(m => (<button key={m} onClick={() => setMomento(m)} className={`flex-1 py-3 rounded-2xl font-black text-[11px] uppercase border-2 ${momento === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{m}°</button>))}</div>
          </div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Grado</p><p className="text-xl font-black text-slate-800">{grado || '—'}</p></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Sección</p>
            <div className="flex gap-2">{TODAS_SECCIONES.filter(s => seccionesDelGrado.includes(s)).map(s => (<button key={s} onClick={() => setSeccion(s)} className={`px-4 py-2 rounded-xl font-black text-sm ${seccion === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</button>))}</div>
          </div>
          <div className="flex items-end"><div className="bg-slate-100 rounded-xl p-3 w-full"><p className="text-[8px] font-black text-slate-400 uppercase">Asignatura</p><p className="text-lg font-black text-slate-800 leading-tight">{materiaNombre || '—'}</p></div></div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
          <h3 className="font-black text-white uppercase text-sm">{grado} - Sección {seccion} — {momento}° Momento</h3>
          <span className="text-[10px] text-slate-400">{estudiantes.length} estudiantes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 w-12">#</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400">Estudiante</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 bg-emerald-50">Suma Cuanti.<br/><span className="text-[8px]">(70%)</span></th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 bg-purple-50">Suma Cuali.<br/><span className="text-[8px]">(30%)</span></th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 bg-blue-100">DEFINITIVA</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estudiantes.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center font-black text-slate-300 uppercase italic">No hay estudiantes</td></tr>
              ) : (
                estudiantes.map((est, idx) => {
                  const data = notasFinales[est.id] || { cuanti: null, cuali: null, def: null };
                  return (
                    <tr key={est.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-black text-slate-300 text-xs">{idx + 1}</td>
                      <td className="px-6 py-4"><p className="font-bold text-sm">{est.apellidos}, {est.nombres}</p><p className="text-[9px] text-slate-400">V-{est.cedula}</p></td>
                      <td className="px-6 py-4 text-center bg-emerald-50/30"><span className={`font-black text-lg ${getColor(data.cuanti)}`}>{formatear(data.cuanti)}</span></td>
                      <td className="px-6 py-4 text-center bg-purple-50/30"><span className={`font-black text-lg ${getColor(data.cuali)}`}>{formatear(data.cuali)}</span></td>
                      <td className="px-6 py-4 text-center bg-blue-50/30"><span className={`text-xl font-black ${data.def !== null && data.def >= 10 ? 'text-emerald-600' : 'text-red-600'}`}>{formatear(data.def)}</span></td>
                      <td className="px-6 py-4 text-center">
                        {data.def !== null ? (
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${data.def >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {data.def >= 10 ? 'Aprobado' : 'Reprobado'}
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-slate-300 uppercase">Sin notas</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t text-center text-[9px] text-slate-500 font-bold">
          Definitiva = (Sumatoria Cuantitativa × 0.7) + (Sumatoria Cualitativa × 0.3) | Si solo existe un tipo, se toma como definitiva.
        </div>
      </div>
    </div>
  );
}
