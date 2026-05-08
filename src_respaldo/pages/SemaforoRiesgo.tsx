import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronLeft, Search, Filter, Download, ClipboardCheck, GraduationCap, BookOpen, UserX, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { estudiantes, notas, materias } from '@/data/index';

// ─── Lógica de cálculo de riesgo ──────────────────────────────
function getEstudiantesEnRiesgo() {
  const result: any[] = [];
  
  estudiantes.forEach(est => {
    const notasEst = notas.filter(n => n.estudianteId === est.id);
    if (notasEst.length === 0) return;

    // Calculamos materias reprobadas (definitiva < 10)
    const reprobadas = notasEst.filter(n => n.definitiva < 10);
    const promedio = notasEst.reduce((s, n) => s + n.definitiva, 0) / notasEst.length;

    if (promedio < 10 || reprobadas.length > 0) {
      result.push({
        ...est,
        promedio: promedio.toFixed(2),
        materiasReprobadas: reprobadas.map(r => {
          const mat = materias.find(m => m.id === r.materiaId);
          return { nombre: mat?.nombre, nota: r.definitiva };
        }),
        totalReprobadas: reprobadas.length
      });
    }
  });

  return result;
}

export default function SemaforoRiesgo() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('todos');

  const dataRiesgo = useMemo(() => getEstudiantesEnRiesgo(), []);
  
  const filtrados = dataRiesgo.filter(est => {
    const matchBusqueda = `${est.nombre} ${est.apellido} ${est.cedula}`.toLowerCase().includes(busqueda.toLowerCase());
    const matchGrado = filtroGrado === 'todos' || est.grado === filtroGrado;
    return matchBusqueda && matchGrado;
  });

  const totalMateriasAplazadas = dataRiesgo.reduce((s, e) => s + e.totalReprobadas, 0);
  
  // Materia más crítica
  const conteoMaterias: Record<string, number> = {};
  dataRiesgo.forEach(e => {
    e.materiasReprobadas.forEach((m: any) => {
      conteoMaterias[m.nombre] = (conteoMaterias[m.nombre] || 0) + 1;
    });
  });
  const materiaCritica = Object.entries(conteoMaterias).sort((a, b) => b[1] - a[1])[0] || ['Ninguna', 0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased pb-20">
      <div className="max-w-7xl mx-auto py-10 px-4">

        {/* ── ENCABEZADO DE ALERTA (SIGA ORIGINAL) ──────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-700 rounded-[3rem] p-10 mb-10 shadow-2xl text-white relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Semáforo de Riesgo</h1>
              <p className="text-red-200 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">
                Coordinación Pedagógica — COMPLEJO EDUCATIVO LA PAZ
              </p>
            </div>
            <div className="flex gap-4">
              <button className="bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl font-black uppercase text-[10px] transition border border-white/20 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" /> Seguimiento Pedagógico
              </button>
              <button 
                onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
                className="bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition"
              >
                Volver
              </button>
            </div>
          </div>
          {/* Círculo decorativo blur */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </motion.div>

        {/* ── INDICADORES (KPIS) ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-8 border-red-500"
          >
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-3">Estudiantes en Riesgo</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">{dataRiesgo.length}</span>
              <span className="text-red-500 font-bold text-xs uppercase">Alumnos</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-8 border-orange-500"
          >
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-3">Materias Aplazadas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">{totalMateriasAplazadas}</span>
              <span className="text-orange-500 font-bold text-xs uppercase">Registros</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white border-l-8 border-blue-500"
          >
            <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-3">Zona de Crisis</p>
            {materiaCritica[1] > 0 ? (
              <>
                <p className="text-xl font-black uppercase tracking-tight leading-none">{materiaCritica[0]}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 italic">{materiaCritica[1]} alumnos reprobados</p>
              </>
            ) : (
              <p className="text-emerald-400 font-black uppercase italic">Sin alertas críticas</p>
            )}
          </motion.div>
        </div>

        {/* ── TABLA CON FILTROS ─────────────────────────────────── */}
        <div className="bg-white rounded-[3.5rem] shadow-sm overflow-hidden border border-slate-200">
          
          {/* Barra de Filtros */}
          <div className="p-8 bg-slate-50 border-b flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Detalle de Alumnos en Riesgo</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Listado automático: Promedio general {'<'} 10 o materias pendientes</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar estudiante..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-red-500 font-bold text-xs shadow-inner"
                />
              </div>
              <select 
                value={filtroGrado}
                onChange={e => setFiltroGrado(e.target.value)}
                className="w-full sm:w-40 px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-red-500 font-black text-[10px] uppercase tracking-widest shadow-inner cursor-pointer"
              >
                <option value="todos">Todos los Grados</option>
                <option value="1er Año">1er Año</option>
                <option value="2do Año">2do Año</option>
                <option value="3er Año">3er Año</option>
                <option value="4to Año">4to Año</option>
                <option value="5to Año">5to Año</option>
              </select>
              <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-slate-800 transition shadow-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] border-b">
                <tr>
                  <th className="px-8 py-5">Estudiante</th>
                  <th className="px-8 py-5">Año / Sección</th>
                  <th className="px-8 py-5 text-center">Promedio</th>
                  <th className="px-8 py-5">Materias Aplazadas</th>
                  <th className="px-8 py-5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <CheckCircle className="w-12 h-12 mb-3 text-emerald-600" />
                        <p className="font-black uppercase tracking-widest text-slate-900">Sin alumnos en riesgo</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((est, idx) => (
                    <motion.tr 
                      key={est.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-red-50/30 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                            {est.nombre[0]}{est.apellido[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 uppercase text-xs leading-tight">{est.apellido}, {est.nombre}</p>
                            <p className="text-slate-400 font-mono text-[10px] mt-1 tracking-widest">V-{est.cedula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-slate-700 text-[10px] uppercase tracking-tighter bg-slate-100 px-3 py-1.5 rounded-xl">
                          {est.grado} — SECC "{est.seccion}"
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`text-xl font-black ${parseFloat(est.promedio) < 10 ? 'text-red-600' : 'text-orange-500'}`}>
                          {est.promedio}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1.5">
                          {est.materiasReprobadas.map((m: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[8px] font-black uppercase border border-red-200">
                              {m.nombre} ({m.nota})
                            </span>
                          ))}
                          {est.totalReprobadas === 0 && <span className="text-orange-500 text-[9px] font-black uppercase italic">Bajo Promedio General</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 transition shadow-md group-hover:scale-105">
                          Ver Historial
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de la tabla */}
          <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mostrando {filtrados.length} de {dataRiesgo.length} registros en riesgo
            </p>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-500 hover:text-red-500 transition shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-[10px] shadow-lg">1</button>
              <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-red-500 hover:text-red-500 transition shadow-sm">
                <span className="w-4 h-4 flex items-center justify-center rotate-180"><ChevronLeft className="w-4 h-4" /></span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
