import { useState } from 'react';
import { Search, Plus, Eye, Edit, Download, UserCheck, UserX, Users, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { estudiantes as data } from '@/data/index';
import { GRADOS_SECUNDARIA, ESTADO_ESTUDIANTE_LABELS, formatearFecha } from '@/lib/index';
import type { Estudiante } from '@/lib/index';

function KpiCard({ label, value, color, idx }: { label:string; value:string|number; color:string; idx:number }) {
  return (
    <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:idx*0.06 }}
      className={`bg-white rounded-[2rem] p-7 shadow-sm border-l-8 ${color}`}>
      <p className="siga-label mb-2">{label}</p>
      <span className="siga-kpi">{value}</span>
    </motion.div>
  );
}

export default function Estudiantes() {
  const [search, setSearch] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [sel, setSel] = useState<Estudiante|null>(null);

  const filtered = data.filter(e => {
    const ms = search === '' || `${e.nombre} ${e.apellido} ${e.cedula}`.toLowerCase().includes(search.toLowerCase());
    const mg = filtroGrado === 'todos' || e.grado === filtroGrado;
    const me = filtroEstado === 'todos' || e.estado === filtroEstado;
    return ms && mg && me;
  });

  const estadoBadge = (s: Estudiante['estado']) => {
    const map: Record<string,string> = { activo:'siga-badge-green', retirado:'siga-badge-red', egresado:'siga-badge-blue', reprobado:'siga-badge-red' };
    return map[s] ?? 'siga-badge-slate';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 max-w-[1400px]">

      {/* Header SIGA */}
      <div className="bg-white rounded-[2.5rem] px-8 py-7 mb-8 shadow-sm border-b-8 border-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Gestión de Estudiantes</h1>
          <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-2">Registro y control del estudiantado matriculado</p>
        </div>
        <div className="flex gap-3">
          <button className="siga-btn-dark flex items-center gap-2"><Download className="w-3.5 h-3.5" />Exportar</button>
          <button className="siga-btn-primary flex items-center gap-2"><Plus className="w-3.5 h-3.5" />Nuevo Estudiante</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-7">
        <KpiCard label="Total Matriculados" value={data.length}                                  color="border-primary"    idx={0} />
        <KpiCard label="Activos"            value={data.filter(e=>e.estado==='activo').length}   color="border-emerald-500" idx={1} />
        <KpiCard label="Retirados"          value={data.filter(e=>e.estado==='retirado').length} color="border-red-500"    idx={2} />
        <KpiCard label="Secciones"          value="10"                                           color="border-blue-400"   idx={3} />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar por nombre o cédula..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-primary font-bold text-sm text-slate-700 transition" />
          </div>
          <Select value={filtroGrado} onValueChange={setFiltroGrado}>
            <SelectTrigger className="w-40 rounded-2xl border-2 border-slate-200 font-black text-xs uppercase"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los grados</SelectItem>
              {GRADOS_SECUNDARIA.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-36 rounded-2xl border-2 border-slate-200 font-black text-xs uppercase"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="retirado">Retirado</SelectItem>
              <SelectItem value="egresado">Egresado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="siga-label mt-3">{filtered.length} estudiante(s) encontrado(s)</p>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['Estudiante','Cédula','Grado / Sección','Representante','Teléfono','Estado','Acción'].map(h=>(
                <th key={h} className="px-8 py-4 siga-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(est=>(
              <tr key={est.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px] flex-shrink-0">
                      {est.nombre?.[0]}{est.apellido?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 uppercase text-xs">{est.apellido}, {est.nombre}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{est.genero==='M'?'Masculino':'Femenino'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-mono font-black text-slate-700 text-sm">V-{est.cedula}</td>
                <td className="px-8 py-5 font-black text-slate-700 text-xs uppercase">{est.grado} "{est.seccion}"</td>
                <td className="px-8 py-5 font-bold text-slate-600 text-xs">{est.representante?.nombre || '—'} {est.representante?.apellido || '—'}</td>
                <td className="px-8 py-5 font-mono text-slate-500 text-xs">{est.representante?.telefono || '—'}</td>
                <td className="px-8 py-5"><span className={estadoBadge(est.estado)}>{ESTADO_ESTUDIANTE_LABELS[est.estado]}</span></td>
                <td className="px-8 py-5">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button onClick={()=>setSel(est)}
                        className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition flex items-center gap-1">
                        <Eye className="w-3 h-3" />Ver
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl">
                      <DialogHeader><DialogTitle className="font-black uppercase tracking-tighter">Expediente Estudiantil</DialogTitle></DialogHeader>
                      {sel && <FichaEstudiante est={sel} />}
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-8 py-4 bg-slate-50 border-t">
          <p className="siga-label">Mostrando {filtered.length} de {data.length} registros</p>
        </div>
      </div>
    </div>
  );
}

function FichaEstudiante({ est }: { est: Estudiante }) {
  return (
    <Tabs defaultValue="personal">
      <TabsList className="grid w-full grid-cols-3 rounded-2xl">
        <TabsTrigger value="personal" className="rounded-xl font-black text-[10px] uppercase">Datos</TabsTrigger>
        <TabsTrigger value="representante" className="rounded-xl font-black text-[10px] uppercase">Representante</TabsTrigger>
        <TabsTrigger value="academico" className="rounded-xl font-black text-[10px] uppercase">Académico</TabsTrigger>
      </TabsList>
      <TabsContent value="personal" className="mt-4 space-y-2">
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-xl">{est.nombre[0]}{est.apellido[0]}</div>
          <div>
            <h3 className="font-black text-slate-900 uppercase text-lg tracking-tight leading-none">{est.nombre} {est.apellido}</h3>
            <p className="font-mono font-black text-slate-500 text-xs mt-1">V-{est.cedula}</p>
          </div>
        </div>
        {[['Fecha de nacimiento', formatearFecha(est.fechaNacimiento)],['Género',est.genero==='M'?'Masculino':'Femenino'],['Año Escolar','2024-2025']].map(([k,v])=>(
          <div key={k} className="flex justify-between py-2 border-b border-slate-100">
            <span className="siga-label">{k}</span>
            <span className="font-black text-slate-700 text-xs uppercase">{v}</span>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="representante" className="mt-4 space-y-2">
	{[['Nombre',`${est.representante?.nombre || '—'} ${est.representante?.apellido || '—'}`],['Cédula',`V-${est.representante?.cedula || '—'}`],['Parentesco',est.representante?.parentesco || '—'],['Teléfono',est.representante?.telefono || '—'],['Correo',est.representante?.email || '—'],['Dirección',est.representante?.direccion || '—']].map(([k,v])=>(
          <div key={k} className="flex justify-between py-2 border-b border-slate-100">
            <span className="siga-label">{k}</span>
            <span className="font-black text-slate-700 text-xs uppercase text-right max-w-[55%]">{v}</span>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="academico" className="mt-4 space-y-2">
        {[['Grado / Año',est.grado],['Sección',est.seccion],['Estado',ESTADO_ESTUDIANTE_LABELS[est.estado]]].map(([k,v])=>(
          <div key={k} className="flex justify-between py-2 border-b border-slate-100">
            <span className="siga-label">{k}</span>
            <span className="font-black text-slate-700 text-xs uppercase">{v}</span>
          </div>
        ))}
        <button className="w-full mt-3 siga-btn-dark flex items-center justify-center gap-2"><Download className="w-3.5 h-3.5" />Generar Constancia</button>
      </TabsContent>
    </Tabs>
  );
}
