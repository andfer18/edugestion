import { useState } from 'react';
import { Search, Download, Printer, FileText, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { estudiantes, notas, materias } from '@/data/index';
import { GRADOS_SECUNDARIA, estaAprobado } from '@/lib/index';

export default function Boletines() {
  const [search, setSearch] = useState('');
  const [grado, setGrado]   = useState('1er Año');
  const [sec,   setSec]     = useState('A');
  const [sel,   setSel]     = useState(estudiantes[0]);
  const [lapso, setLapso]   = useState<'1'|'2'|'3'>('1');

  const lista = estudiantes.filter(e => e.grado===grado && e.seccion===sec && (search===''||`${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase())));
  const notasEst = notas.filter(n => n.estudianteId===sel?.id && n.lapso===Number(lapso));
  const prom = notasEst.length ? (notasEst.reduce((s,n)=>s+n.definitiva,0)/notasEst.length).toFixed(2) : '—';
  const aprobadas = notasEst.filter(n=>estaAprobado(n.definitiva)).length;
  const reprobadas = notasEst.filter(n=>!estaAprobado(n.definitiva)).length;

  return (
    <div className="min-h-screen bg-slate-100 p-6 max-w-[1400px]">
      <div className="bg-white rounded-[2.5rem] px-8 py-7 mb-8 shadow-sm border-b-8 border-primary flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Boletines de Notas</h1>
          <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-2">Generación y descarga por estudiante y lapso</p>
        </div>
        <button className="siga-btn-dark flex items-center gap-2"><Download className="w-3.5 h-3.5" />Descarga Masiva</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista estudiantes */}
        <div className="space-y-3">
          <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-200 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-primary font-bold text-xs transition" />
            </div>
            <div className="flex gap-2">
              <Select value={grado} onValueChange={setGrado}>
                <SelectTrigger className="flex-1 rounded-2xl border-2 text-[10px] font-black uppercase h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{GRADOS_SECUNDARIA.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={sec} onValueChange={setSec}>
                <SelectTrigger className="w-16 rounded-2xl border-2 text-[10px] font-black uppercase h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{['A','B','C'].map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b">
              <p className="siga-label">{lista.length} estudiantes</p>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
              {lista.map(e=>(
                <button key={e.id} onClick={()=>setSel(e)} className={`w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-50 transition ${sel?.id===e.id?'bg-blue-50 border-l-4 border-primary':''}`}>
                  <div className="w-8 h-8 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px] flex-shrink-0">{e.nombre[0]}{e.apellido[0]}</div>
                  <div>
                    <p className="font-black text-slate-800 uppercase text-[11px]">{e.apellido}, {e.nombre}</p>
                    <p className="font-mono text-[9px] text-slate-400">V-{e.cedula}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Boletín */}
        <div className="lg:col-span-2">
          {sel ? (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center border-b-4 border-blue-500">
                <div>
                  <h2 className="font-black uppercase italic tracking-tight text-xl">{sel.apellido}, {sel.nombre}</h2>
                  <p className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.2em]">{sel.grado} "{sel.seccion}" — Cédula: V-{sel.cedula}</p>
                </div>
                <div className="flex gap-1">
                  {(['1','2','3'] as const).map(l=>(
                    <button key={l} onClick={()=>setLapso(l)} className={`px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest transition ${lapso===l?'bg-blue-600 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}>{l}er</button>
                  ))}
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-6 p-5 rounded-3xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">U.E. Ejemplo</h3>
                  <p className="siga-label">RIF: J-00000000-0 | Código MECD: 000000</p>
                  <p className="font-black text-primary uppercase text-sm mt-2">Boletín de Calificaciones — 2024-2025</p>
                  <p className="siga-label">{lapso}er Lapso</p>
                </div>

                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-primary/20">
                      {['Materia / Asignatura','Nota 1','Nota 2','Nota 3','Definitiva','Estado'].map(h=>(
                        <th key={h} className="px-4 py-3 siga-label">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notasEst.length===0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center">
                        <p className="font-black text-slate-400 uppercase text-xs">Sin notas para el {lapso}er lapso</p>
                      </td></tr>
                    ) : notasEst.map(n=>{
                      const mat=materias.find(m=>m.id===n.materiaId);
                      const ok=estaAprobado(n.definitiva);
                      return (
                        <tr key={n.materiaId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-black text-slate-800 uppercase text-xs">{mat?.nombre??n.materiaId}</td>
                          <td className="px-4 py-3 font-mono font-black text-center text-sm">{n.nota1}</td>
                          <td className="px-4 py-3 font-mono font-black text-center text-sm">{n.nota2}</td>
                          <td className="px-4 py-3 font-mono font-black text-center text-sm">{n.nota3}</td>
                          <td className={`px-4 py-3 text-center font-black font-mono text-lg ${ok?'text-emerald-600':'text-red-600'}`}>{n.definitiva.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center"><span className={ok?'siga-badge-green':'siga-badge-red'}>{ok?'Aprobado':'Reprobado'}</span></td>
                        </tr>
                      );
                    })}
                    {notasEst.length>0 && (
                      <tr className="bg-slate-900 text-white">
                        <td className="px-4 py-3 font-black uppercase text-xs" colSpan={4}>Promedio General</td>
                        <td className="px-4 py-3 text-center font-black font-mono text-xl text-blue-400">{prom}</td>
                        <td className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase">{aprobadas}✓ {reprobadas}✗</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="flex gap-3 mt-6">
                  <button className="siga-btn-primary flex items-center gap-2"><Download className="w-4 h-4" />Descargar PDF</button>
                  <button className="siga-btn-dark flex items-center gap-2"><Printer className="w-4 h-4" />Imprimir</button>
                  <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-200 font-black text-[10px] uppercase text-slate-600 hover:border-primary hover:text-primary transition"><FileText className="w-3.5 h-3.5" />Enviar</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex items-center justify-center h-64">
              <div className="text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Selecciona un estudiante</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
