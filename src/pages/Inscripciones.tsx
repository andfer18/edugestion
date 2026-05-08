import { useState } from 'react';
import { Plus, CheckCircle, XCircle, Clock, Download, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { inscripciones as data, estudiantes, añosEscolares } from '@/data/index';
import { GRADOS_SECUNDARIA, SECCIONES, formatearFecha } from '@/lib/index';

export default function Inscripciones() {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroGrado, setFiltroGrado] = useState('todos');
  const [showForm, setShowForm] = useState(false);

  const filtered = data.filter(ins => {
    const est = estudiantes.find(e=>e.id===ins.estudianteId);
    const ms = search===''||`${est?.nombre} ${est?.apellido} ${est?.cedula}`.toLowerCase().includes(search.toLowerCase());
    return ms && (filtroEstado==='todos'||ins.estado===filtroEstado) && (filtroGrado==='todos'||ins.gradoId===filtroGrado);
  });
  const confirmadas=data.filter(i=>i.estado==='confirmada').length;
  const pendientes=data.filter(i=>i.estado==='pendiente').length;
  const rechazadas=data.filter(i=>i.estado==='rechazada').length;

  return (
    <div className="min-h-screen bg-slate-100 p-6 max-w-[1400px]">
      <div className="bg-white rounded-[2.5rem] px-8 py-7 mb-8 shadow-sm border-b-8 border-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Control de Inscripciones</h1>
          <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-2">Gestión de matrícula — Año Escolar 2024-2025</p>
        </div>
        <div className="flex gap-3">
          <button className="siga-btn-dark flex items-center gap-2"><Download className="w-3.5 h-3.5" />Exportar</button>
          <button className="siga-btn-primary flex items-center gap-2" onClick={()=>setShowForm(true)}><Plus className="w-3.5 h-3.5" />Nueva Inscripción</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-7">
        {[{l:'Confirmadas',v:confirmadas,c:'border-emerald-500'},{l:'Pendientes',v:pendientes,c:'border-orange-500'},{l:'Rechazadas',v:rechazadas,c:'border-red-500'}].map((k,i)=>(
          <motion.div key={k.l} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className={`bg-white rounded-[2rem] p-7 shadow-sm border-l-8 ${k.c}`}>
            <p className="siga-label mb-2">{k.l}</p>
            <span className="siga-kpi">{k.v}</span>
          </motion.div>
        ))}
      </div>

      {pendientes>0 && (
        <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-orange-50 border-2 border-orange-200 mb-5">
          <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <p className="font-black text-orange-900 text-xs uppercase tracking-wide">{pendientes} inscripciones requieren confirmación de documentos</p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-200 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar estudiante..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-primary font-bold text-sm transition" />
          </div>
          {[{v:filtroEstado,sv:setFiltroEstado,opts:['todos','confirmada','pendiente','rechazada'],w:'w-36'},{v:filtroGrado,sv:setFiltroGrado,opts:['todos',...GRADOS_SECUNDARIA],w:'w-40'}].map((s,i)=>(
            <Select key={i} value={s.v} onValueChange={s.sv}>
              <SelectTrigger className={`${s.w} rounded-2xl border-2 border-slate-200 font-black text-xs uppercase`}><SelectValue /></SelectTrigger>
              <SelectContent>{s.opts.map(o=><SelectItem key={o} value={o}>{o==='todos'?'Todos':o}</SelectItem>)}</SelectContent>
            </Select>
          ))}
        </div>
        <p className="siga-label mt-3">{filtered.length} inscripción(es)</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>{['Estudiante','Cédula','Grado / Sección','Fecha','Estado','Acciones'].map(h=><th key={h} className="px-8 py-4 siga-label">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(ins=>{
              const est=estudiantes.find(e=>e.id===ins.estudianteId);
              return (
                <tr key={ins.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[9px]">{est?.nombre[0]}{est?.apellido[0]}</div>
                      <p className="font-black text-slate-800 uppercase text-xs">{est?.apellido}, {est?.nombre}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono font-black text-slate-600 text-sm">V-{est?.cedula}</td>
                  <td className="px-8 py-5 font-black text-slate-700 uppercase text-xs">{ins.gradoId} "{ins.seccion}"</td>
                  <td className="px-8 py-5 font-black text-slate-600 text-xs">{formatearFecha(ins.fecha)}</td>
                  <td className="px-8 py-5">
                    <span className={ins.estado==='confirmada'?'siga-badge-green':ins.estado==='pendiente'?'siga-badge-orange':'siga-badge-red'}>
                      {ins.estado}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {ins.estado==='pendiente' && (
                      <div className="flex gap-2">
                        <button className="siga-badge-green cursor-pointer hover:opacity-80 transition flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confirmar</button>
                        <button className="siga-badge-red cursor-pointer hover:opacity-80 transition"><XCircle className="w-3 h-3" /></button>
                      </div>
                    )}
                    {ins.estado === 'confirmada' && (
                      <Link to="/planilla-preview" className="bg-slate-900 text-white flex items-center gap-1 text-[9px] px-3 py-1.5 rounded-xl font-black uppercase shadow-lg hover:bg-slate-800 transition">
                        <FileText className="w-3 h-3" />Ver Planilla
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader><DialogTitle className="font-black uppercase tracking-tighter">Nueva Inscripción</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="siga-label">Estudiante</Label>
              <Select><SelectTrigger className="rounded-2xl mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{estudiantes.map(e=><SelectItem key={e.id} value={e.id}>{e.apellido}, {e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="siga-label">Grado</Label>
                <Select><SelectTrigger className="rounded-2xl mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{GRADOS_SECUNDARIA.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="siga-label">Sección</Label>
                <Select><SelectTrigger className="rounded-2xl mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{SECCIONES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="siga-label">Observaciones</Label><Textarea className="rounded-2xl mt-1" rows={3} /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setShowForm(false)} className="flex-1 px-5 py-3 rounded-2xl border-2 border-slate-200 font-black text-[10px] uppercase text-slate-500 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={()=>setShowForm(false)} className="flex-1 siga-btn-primary">Registrar →</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
