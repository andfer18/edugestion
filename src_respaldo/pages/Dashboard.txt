import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCheck, BarChart3, AlertTriangle, CheckCircle2, TrendingUp, FileText, BookOpen, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { estadisticasDashboard, inscripciones, estudiantes } from '@/data/index';
import { ROUTE_PATHS } from '@/lib/index';
import type { Usuario } from '@/lib/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface DashboardProps { user: Usuario; }

function KpiCard({ label, value, sub, color, idx }: { label: string; value: string|number; sub: string; color: string; idx: number }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.06 }}
      className={`bg-white rounded-[2rem] p-7 shadow-sm border-l-8 ${color}`}>
      <p className="siga-label mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="siga-kpi">{value}</span>
        <span className={`text-xs font-black uppercase ${color.replace('border-','text-').replace('-500','').replace('-700','')}-500`}>{sub}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard({ user }: DashboardProps) {
  const s = estadisticasDashboard;
  const pendientes = inscripciones.filter(i => i.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-slate-100 p-6 max-w-[1600px]">

      {/* ── Encabezado estilo SIGA ── */}
      <div className="bg-white rounded-[2.5rem] px-8 py-7 mb-8 shadow-sm border-b-8 border-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-full p-2 shadow-sm border border-slate-100 hidden md:flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Panel de Control
            </h1>
            <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-2">
              {user.nombre} {user.apellido} — Año Escolar 2024-2025
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {pendientes > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-200 text-orange-700 px-5 py-2.5 rounded-2xl">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-black text-[10px] uppercase tracking-widest">{pendientes} Inscripciones Pendientes</span>
            </div>
          )}
          <Link to={ROUTE_PATHS.PRE_INSCRIPCIONES}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition shadow-lg">
            Ver Inscripciones →
          </Link>
        </div>
      </div>

      {/* ── KPIs fila 1 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <KpiCard label="Total Estudiantes" value={s.totalEstudiantes} sub="Matriculados" color="border-primary" idx={0} />
        <KpiCard label="Docentes Activos"  value={s.docentesActivos}  sub="Activos"     color="border-blue-400" idx={1} />
        <KpiCard label="Asistencia Hoy"    value={`${s.porcentajeAsistencia}%`} sub="Presente" color="border-emerald-500" idx={2} />
        <KpiCard label="Promedio General"  value={s.promedioGeneral}  sub="1er Lapso"   color="border-orange-500" idx={3} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <KpiCard label="Inscripciones OK"  value={s.inscripcionesConfirmadas} sub="Confirmadas" color="border-emerald-500" idx={0} />
        <KpiCard label="Docs Emitidos"     value={s.documentosEmitidos}       sub="Este mes"   color="border-blue-400" idx={1} />
        <KpiCard label="Reportes Generados" value={s.reportesGenerados}       sub="Total año"  color="border-primary" idx={2} />
        <KpiCard label="Notas Pendientes"  value={14}                         sub="2do Lapso"  color="border-red-500" idx={3} />
      </div>

      {/* ── Gráficos ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-base mb-1">Asistencia Semanal</h3>
          <p className="siga-label mb-5">Semana del 31 Mar al 4 Abr, 2025</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={s.asistenciaSemanal} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize:11, fontWeight:700, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fontWeight:700, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, fontSize:11, fontWeight:700 }} />
              <Bar dataKey="presentes" name="Presentes" fill="#16a34a" radius={[6,6,0,0]} />
              <Bar dataKey="ausentes"  name="Ausentes"  fill="#b91c1c" radius={[6,6,0,0]} />
              <Bar dataKey="tardanza"  name="Tardanza"  fill="#d97706" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-base mb-1">Rendimiento por Lapso</h3>
          <p className="siga-label mb-5">Promedio general de notas</p>
          <div className="space-y-5">
            {s.notasPorLapso.map(l => (
              <div key={l.lapso}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-black text-[11px] uppercase text-slate-700">{l.lapso}</span>
                  <span className="font-black text-primary text-sm">{l.promedio}</span>
                </div>
                <Progress value={(l.promedio/20)*100} className="h-2.5 rounded-full" />
                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] font-black text-emerald-600 uppercase">✓ {l.aprobados}% Aprobados</span>
                  <span className="text-[9px] font-black text-red-600 uppercase">✗ {l.reprobados}% Reprobados</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabla grados ── */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-200 mb-8">
        <div className="px-8 py-6 bg-slate-50 border-b">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter italic">Distribución por Grado / Año</h3>
          <p className="siga-label mt-1">Año Escolar 2024-2025</p>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['Grado / Año','Total','Aprobados','Reprobados','% Aprobación'].map(h => (
                <th key={h} className="px-8 py-4 siga-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {s.gradosPorEstudiantes.map(g => {
              const pct = Math.round((g.aprobados/g.cantidad)*100);
              return (
                <tr key={g.grado} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800 uppercase text-xs">{g.grado}</td>
                  <td className="px-8 py-5 font-black text-slate-700 text-sm">{g.cantidad}</td>
                  <td className="px-8 py-5 font-black text-emerald-600 text-sm">{g.aprobados}</td>
                  <td className="px-8 py-5 font-black text-red-600 text-sm">{g.reprobados}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[80px] bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{width:`${pct}%`}} />
                      </div>
                      <span className="font-black text-slate-600 text-xs">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Estado del sistema ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter italic mb-5">Últimas Inscripciones</h3>
          <div className="space-y-3">
            {inscripciones.slice(0,5).map(ins => {
              const est = estudiantes.find(e => e.id === ins.estudianteId);
              return (
                <div key={ins.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px]">
                    {est?.nombre[0]}{est?.apellido[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800 uppercase text-[11px]">{est?.apellido}, {est?.nombre}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{ins.gradoId} "{ins.seccion}" — {ins.fecha}</p>
                  </div>
                  <span className={`siga-badge-${ins.estado==='confirmada'?'green':ins.estado==='pendiente'?'orange':'red'}`}>
                    {ins.estado}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter italic mb-5">Estado del Sistema</h3>
          <div className="space-y-3">
            {[
              { label:'Período de inscripciones',      estado:'Activo',        ok:true },
              { label:'Carga de notas — 1er Lapso',    estado:'Cerrado',       ok:true },
              { label:'Carga de notas — 2do Lapso',    estado:'Abierto',       ok:true },
              { label:'Boletines 1er Lapso',            estado:'Disponibles',   ok:true },
              { label:'Reportes ME-2',                  estado:'Pendiente',     ok:false },
              { label:'Certificados de culminación',    estado:'No disponible', ok:false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  {item.ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    : <AlertTriangle className="w-4 h-4 text-orange-500" />}
                  <span className={`font-black text-[10px] uppercase ${item.ok?'text-emerald-600':'text-orange-500'}`}>{item.estado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
