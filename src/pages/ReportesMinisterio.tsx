import { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { estadisticasDashboard } from '@/data/index';

const REPORTES = [
  { id:'me2',       nombre:'Formulario ME-2',      desc:'Matrícula inicial por grado, sección y género', estado:'disponible', lapso:null },
  { id:'me3',       nombre:'Formulario ME-3',       desc:'Matrícula y rendimiento por lapso',             estado:'pendiente',  lapso:'2do Lapso' },
  { id:'31059',     nombre:'Resumen Final (31059)', desc:'Rendimiento Estudiantil EMG — Formato Oficial',  estado:'disponible', lapso:'Final' },
  { id:'estadistica',nombre:'Estadística Educativa',desc:'Resumen general para el MPPE',                  estado:'disponible', lapso:null },
  { id:'rendimiento',nombre:'Rendimiento Escolar',  desc:'Porcentaje aprobados/reprobados por materia',   estado:'disponible', lapso:'1er Lapso' },
];

const ME2 = [
  { grado:'1er Año', secciones:2, hembras:52, varones:46, total:98 },
  { grado:'2do Año', secciones:2, hembras:55, varones:47, total:102 },
  { grado:'3er Año', secciones:2, hembras:49, varones:46, total:95 },
  { grado:'4to Año', secciones:2, hembras:51, varones:46, total:97 },
  { grado:'5to Año', secciones:2, hembras:50, varones:45, total:95 },
];

import { generateExcel31059 } from '@/lib/excelGenerator';

export default function ReportesMinisterio() {
  const navigate = useNavigate();
  const [gen,setGen] = useState<string|null>(null);
  const [done,setDone] = useState(new Set(['me2','estadistica']));
  const s = estadisticasDashboard;

  // Parámetros para el 31059
  const [selectedAño, setSelectedAño] = useState('1er Año');
  const [selectedTipoID, setSelectedTipoID] = useState('CI');

  const handleGen=(id:string)=>{
    setGen(id);
    setTimeout(()=>{
      setGen(null);
      setDone(p=>new Set([...p,id]));
    },1800);
  };

  const handleDownload = async (id: string) => {
    if (id === '31059') {
      // Preguntar si quiere ver previa o descargar directo el original
      const action = window.confirm("¿Desea descargar directamente el archivo Excel oficial completado?\n\n(Aceptar: Descargar Original | Cancelar: Ver Previa Digital)");
      if (action) {
        await generateExcel31059({ año: selectedAño, tipo: selectedTipoID });
      } else {
        navigate(`/reporte-31059-preview?año=${selectedAño}&tipo=${selectedTipoID}`);
      }
    } else {
      // Simulador de descarga para otros reportes
      const blob = new Blob([`Reporte ${id} generado por EduGestión — U.E. Ejemplo`], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${id}.txt`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 max-w-[1400px]">
      <div className="bg-white rounded-[2.5rem] px-8 py-7 mb-8 shadow-sm border-b-8 border-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Reportes MPPE</h1>
          <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-2">Formularios estadísticos — Generación automática sin errores</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition"><RefreshCw className="w-3.5 h-3.5" />Actualizar</button>
          <button className="siga-btn-primary flex items-center gap-2"><Download className="w-3.5 h-3.5" />Descargar Todos</button>
        </div>
      </div>

      <div className="flex items-start gap-3 px-6 py-4 rounded-3xl bg-emerald-50 border-2 border-emerald-200 mb-7">
        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-black text-emerald-900 text-xs uppercase tracking-wide">Datos validados automáticamente</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-0.5">El sistema verifica coherencia entre matrículas, notas y asistencia. 0 errores detectados.</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {REPORTES.map(rep=>(
          <div key={rep.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
            <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">{rep.nombre}</h3>
                        {rep.lapso && <span className="siga-badge-blue">{rep.lapso}</span>}
                        <span className={rep.estado==='disponible'?'siga-badge-green':'siga-badge-orange'}>{rep.estado==='disponible'?'Disponible':'Incompleto'}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{rep.desc}</p>
                      
                      {/* Selectores específicos para el 31059 */}
                      {rep.id === '31059' && (
                        <div className="flex gap-2 mt-3">
                          <select 
                            value={selectedAño} 
                            onChange={(e) => setSelectedAño(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 font-black text-[9px] uppercase outline-none focus:border-primary"
                          >
                            <option value="1er Año">1er Año</option>
                            <option value="2do Año">2do Año</option>
                            <option value="3er Año">3er Año</option>
                            <option value="4to Año">4to Año</option>
                            <option value="5to Año">5to Año</option>
                          </select>
                          <select 
                            value={selectedTipoID} 
                            onChange={(e) => setSelectedTipoID(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 font-black text-[9px] uppercase outline-none focus:border-primary"
                          >
                            <option value="CI">Estudiantes con CI</option>
                            <option value="CE">Estudiantes con CE</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

              <div className="flex items-center gap-2">
                {done.has(rep.id)&&<span className="siga-badge-green flex items-center gap-1"><CheckCircle className="w-3 h-3" />Generado</span>}
                {rep.estado==='pendiente'&&<span className="siga-badge-orange flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Completar notas</span>}
                <button disabled={rep.estado==='pendiente'||gen===rep.id} 
                  onClick={() => done.has(rep.id) ? handleDownload(rep.id) : handleGen(rep.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition shadow-lg disabled:opacity-40 ${done.has(rep.id)?'bg-slate-100 text-slate-600 hover:bg-slate-200':'siga-btn-primary'}`}>
                  {gen===rep.id ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generando...</>
                    : done.has(rep.id) ? <><Download className="w-3.5 h-3.5" />Descargar</>
                    : <><FileSpreadsheet className="w-3.5 h-3.5" />Generar</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-200 mb-8">
        <div className="px-8 py-6 bg-slate-900 text-white border-b-4 border-blue-500">
          <h2 className="font-black uppercase italic tracking-tight text-xl">Formulario ME-2 — Vista Previa</h2>
          <p className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Matrícula Inicial · AÑO ESCOLAR 2024-2025</p>
        </div>
        <div className="p-8">
          <p className="text-center font-black text-slate-900 uppercase text-sm mb-1">U.E. Ejemplo</p>
          <p className="text-center siga-label mb-6">RIF: J-00000000-0 | Zona Educativa: Distrito Capital</p>
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-primary text-white">
              {['Grado / Año','Secciones','Hembras','Varones','Total'].map(h=><th key={h} className="px-6 py-3 font-black uppercase text-[10px] tracking-widest border border-primary/20">{h}</th>)}
            </tr></thead>
            <tbody>{ME2.map((r,i)=>(
              <tr key={r.grado} className={i%2===0?'bg-slate-50':'bg-white'}>
                <td className="px-6 py-3 font-black text-slate-800 uppercase text-xs border border-slate-200">{r.grado}</td>
                <td className="px-6 py-3 font-black text-center text-slate-700 border border-slate-200">{r.secciones}</td>
                <td className="px-6 py-3 font-black text-center text-slate-700 border border-slate-200">{r.hembras}</td>
                <td className="px-6 py-3 font-black text-center text-slate-700 border border-slate-200">{r.varones}</td>
                <td className="px-6 py-3 font-black text-center text-primary text-lg border border-slate-200">{r.total}</td>
              </tr>))}
              <tr className="bg-slate-900 text-white">
                <td className="px-6 py-3 font-black uppercase text-xs border border-slate-700">Totales</td>
                <td className="px-6 py-3 font-black text-center border border-slate-700">10</td>
                <td className="px-6 py-3 font-black text-center border border-slate-700">{ME2.reduce((s,r)=>s+r.hembras,0)}</td>
                <td className="px-6 py-3 font-black text-center border border-slate-700">{ME2.reduce((s,r)=>s+r.varones,0)}</td>
                <td className="px-6 py-3 font-black text-center text-blue-400 text-xl border border-slate-700">{ME2.reduce((s,r)=>s+r.total,0)}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex gap-3 mt-5">
            <button className="siga-btn-primary flex items-center gap-2"><Download className="w-4 h-4" />Excel</button>
            <button className="siga-btn-dark flex items-center gap-2"><Download className="w-4 h-4" />PDF</button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter italic mb-5">Rendimiento por Grado</h3>
          <div className="space-y-4">
            {s.gradosPorEstudiantes.map(g=>{const pct=Math.round((g.aprobados/g.cantidad)*100);return(
              <div key={g.grado}><div className="flex justify-between mb-1.5">
                <span className="font-black text-[11px] uppercase text-slate-700">{g.grado}</span>
                <span className="font-black text-primary text-sm">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2.5 rounded-full" />
              <div className="flex justify-between text-[9px] mt-1">
                <span className="font-black text-emerald-600">✓ {g.aprobados}</span>
                <span className="font-black text-red-600">✗ {g.reprobados}</span>
              </div></div>);})}
        </div></div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter italic mb-5">Resumen MPPE</h3>
          <div className="space-y-2">
            {[['Matrícula total','487'],['Hembras','257 (52.7%)'],['Varones','230 (47.3%)'],['Promedio general','14.80'],['% Aprobación','84.4%'],['Docentes activos','35'],['Secciones','10'],['Zona Educativa','Distrito Capital']].map(([k,v])=>(
              <div key={k} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="siga-label">{k}</span>
                <span className="font-black text-slate-700 text-xs uppercase">{v}</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
