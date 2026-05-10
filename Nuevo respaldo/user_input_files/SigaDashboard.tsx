import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ResumenFinal31059 from './ResumenFinal31059';
import AsignacionDocentes from './AsignacionDocentes'; // 🚀 NUEVO IMPORT
import { 
  Clock, Cloud, Calendar as CalendarIcon, Bolt, Bell, 
  FileText, ChartLine, Scroll, Book, Award, 
  ClipboardList, Plus, Printer, FileOutput, RefreshCw, 
  PieChart, Settings, ChevronLeft, ChevronRight,
  GraduationCap, AlertTriangle, CheckCircle, Users,
  History, Search, Activity, BookOpen, UserPlus,
  FileCheck, LogOut, ClipboardCheck, Power, Star, TrendingUp,
  UserCheck // 🚀 NUEVO ÍCONO
} from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import { ROUTE_PATHS, type Usuario } from '@/lib/index';

// ─── Componente de Calendario Académico Reducido ──────────────────
const AcademicCalendar = () => {
  const [currentDate] = useState(new Date(2026, 3, 9));
  const events = [
    { date: '2026-04-05', label: 'Feriado: Semana Santa', type: 'holiday' },
    { date: '2026-04-09', label: 'Reunión de Coordinación', type: 'meeting' },
    { date: '2026-04-15', label: 'Entrega de Boletines', type: 'delivery' },
    { date: '2026-05-01', label: 'Día del Trabajo', type: 'holiday' },
    { date: '2026-06-15', label: 'Cierre de Momento', type: 'academic' },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: adjustedFirstDay }, (_, i) => i);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-100">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> Calendario Académico
        </h3>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-slate-50 rounded-lg transition text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1 hover:bg-slate-50 rounded-lg transition text-slate-400"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-xs font-black uppercase tracking-tighter text-slate-900 italic">Abril 2026</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
    {['L','M','M','J','V','S','D'].map((d, i) => (
      <div key={i} className="text-[9px] font-black text-slate-300 uppercase mb-2">{d}</div>
            ))}
      {emptyDays.map(i => <div key={`e-${i}`} />)}
      {days.map(d => {
          const dateStr = `2026-04-${String(d).padStart(2, '0')}`;
          const event = events.find(e => e.date === dateStr);
          const isToday = d === 9;

          return (
            <div 
              key={d} 
              className={`
                aspect-square flex items-center justify-center text-[11px] font-black rounded-xl relative cursor-help group transition-all
                ${isToday ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}
                ${event && !isToday ? 'bg-orange-50 text-orange-600 border border-orange-100' : ''}
              `}
            >
              {d}
              {event && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-slate-900 text-white text-[9px] p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none shadow-2xl border border-slate-800">
                  <p className="font-black uppercase tracking-tight text-blue-400 mb-1">{event.label}</p>
                  <p className="text-[8px] font-bold text-slate-500">Evento Programado</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Dashboard del Docente ────────────────────────────────────────
 export default function SigaDashboard({ user, onLogout }: { user: Usuario; onLogout: () => void }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [showConsolidar, setShowConsolidar] = useState(false);
  const [showMP, setShowMP] = useState(false);
  const [mpGrado, setMpGrado] = useState('');
  const [mpLoading, setMpLoading] = useState(false);
  const [consGrado, setConsGrado] = useState('');
  const [consSeccion, setConsSeccion] = useState('');
  const [consLoading, setConsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const diaNombre = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const diaNum = date.getDate();
    const mesNombre = date.toLocaleDateString('es-ES', { month: 'long' });
    const año = date.getFullYear();

    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, '0');
    const segundos = date.getSeconds().toString().padStart(2, '0');
    const periodo = horas >= 12 ? 'pm' : 'am';
    horas = horas % 12 || 12;
    
    return `Hoy es ${diaNombre}, ${diaNum} de ${mesNombre} de ${año} y son las ${horas}:${minutos}:${segundos} ${periodo}`;
  };

   const [periodoActivo, setPeriodoActivo] = useState('Cargando...');

  // 🆕 Leer el periodo activo de la BD al cargar el Dashboard
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('siga_token');
        const res = await fetch(`${API_BASE_URL}/api/config`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.periodos) {
          const activo = data.periodos.find((p: any) => p.activo === 1);
          if (activo) setPeriodoActivo(activo.nombre);
        }
      } catch (err) { console.error(err); }
    };
    fetchConfig();
  }, []);

  const actionsPrincipales = [
    {
      title: 'Boletines',
      icon: FileText,
      items: [
        { label: 'Reporte Evaluativo Lapso', path: ROUTE_PATHS.BOLETINES },
        { label: 'Imprimir Boletines', path: '#' },
        { label: 'Imprimir Boletines en Lote', path: '#' },
        { label: 'Mejores Promedios', path: ROUTE_PATHS.CUADRO_HONOR },
        { label: 'Sabana Consejo de Curso', path: '#' },
      ]
    },
    {
      title: 'Informes Descriptivos',
      icon: Scroll,
      items: [
        { label: 'Resumen Final', path: ROUTE_PATHS.REPORTES_MINISTERIO },
        { label: 'Historial Académico', path: ROUTE_PATHS.HISTORICO },
        { label: 'Notas Certificadas', path: '#' },
        { label: 'Notas Certificadas en Lote', path: '#' },
        { label: 'Riesgo Pedagógico', path: ROUTE_PATHS.SEMAFORO_RIESGO },
      ]
    },
    {
      title: 'Configuración',
      icon: Scroll,
      items: [
        { label: 'Datos del Plantel', path: '#' },
        { label: 'Periodo Escolar', path: '#' },
        { label: 'Gestión de Usuarios y Perfiles', path: '#' },
        { label: 'Periodo Escolar', path: '#' },
        { label: 'Asignaturas del Plan', path: ROUTE_PATHS.PLANES_ESTUDIO },
      ]
    },
    {
      title: 'Revisiones',
      icon: ChartLine,
      items: [
        { label: 'Listados Revisiones', path: ROUTE_PATHS.REVISION },
        { label: 'Carga de Calificaciones Revisión', path: '#' },
        { label: 'Profesores Asignados', path: '#' },
        { label: 'Traslado a Historial Académico', path: '#' },
      ]
    },
    {
      title: 'Materias Pendientes',
      icon: Book,
      items: [
        { label: 'Listado de Alumnos', path: '#' },
        { label: 'Actualizar Notas MP', path: ROUTE_PATHS.NOTAS_CARGA },
        { label: 'Traslado a Historial Académico', path: '#' },
      ]
    },
    {
      title: 'Títulos y Certificados',
      icon: Award,
      items: [
        { label: 'Registro de Egresados', path: '#' },
        { label: 'Promociones de Grado', path: '#' },
        { label: 'Diplomas y Menciones', path: '#' },
        { label: 'Certificado Básica', path: '#' },
      ]
    }
  ];

    // ── VISTA DE PLANILLA 31059 ──────────────────────────────────
  if (vistaActiva === 'resumen') {
    return (
      <div className="min-h-screen bg-slate-100 p-6 md:p-10 font-sans antialiased">
        <button 
          onClick={() => setVistaActiva('dashboard')} 
          className="mb-6 bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 border-slate-200 shadow-sm"
        >
          ⬅ Volver al Panel de Control
        </button>
        <ResumenFinal31059 />
      </div>
    );
  }

  // ── VISTA DE ASIGNACIÓN DE DOCENTES ──────────────────────────
  if (vistaActiva === 'asignacion') {
    return (
      <div className="min-h-screen bg-slate-100 p-6 md:p-10 font-sans antialiased">
        <button 
          onClick={() => setVistaActiva('dashboard')} 
          className="mb-6 bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 border-slate-200 shadow-sm"
        >
          ⬅ Volver al Panel de Control
        </button>
        <AsignacionDocentes />
      </div>
    );
  }
  // ── FIN VISTAS ───────────────────────────────────────────────        

       return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10 font-sans antialiased overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-10">
     {/* ── HEADER BANNER ────────────────────────────────────────── */}
        <header className="bg-white rounded-[3rem] p-10 text-slate-900 relative overflow-hidden shadow-sm border-b-8 border-blue-600 border-x-2 border-t-2 border-slate-200">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] p-3 flex items-center justify-center shadow-2xl border-2 border-slate-100">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4 italic flex items-center gap-4">
                  <GraduationCap className="w-10 h-10 text-blue-600" /> Control de Estudios y Evaluación
                </h1>
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-blue-700 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {formatDate(time)}
                  </p>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-blue-400" /> El clima está despejado y tenemos una temperatura de 28ºC
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right hidden lg:flex flex-col items-end gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 mb-2">Periodo Escolar</p>
                <p className="text-5xl font-black italic tracking-tighter text-blue-600 leading-none">{periodoActivo.replace('-', ' — ')}</p>
              </div>
              <button 
                onClick={onLogout}
                className="bg-slate-900/50 hover:bg-red-600 text-white px-6 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
              >
                <Power className="w-3 h-3" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* COLUMNA PRINCIPAL (3/4) */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* ACCIONES PRINCIPALES */}
            <section className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-blue-200">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">Acciones Principales</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Gestión integral de control de estudios</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {actionsPrincipales.map((cat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[3rem] p-10 shadow-sm border-2 border-slate-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 group-hover:scale-110">
                        <cat.icon className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-black uppercase text-sm tracking-tight text-slate-900 italic leading-tight">{cat.title}</h3>
                    </div>
                    <ul className="space-y-4">
                      {cat.items.map((item, j) => (
                        <li key={j}>
               <a href="#" onClick={(e) => { 
  e.preventDefault(); 
  if(item.label === 'Resumen Final') { 
    setVistaActiva('resumen'); 
  } else if (item.label === 'Historial Académico') { 
    navigate('/historico-estudiantes'); 
  } else { 
    navigate(item.path); 
  } 
}} className="flex items-center gap-4 text-[11px] font-black uppercase text-slate-500 hover:text-blue-600 transition-colors group/item cursor-pointer">
                            <div className="w-2 h-2 bg-slate-200 rounded-full group-hover/item:bg-blue-600 transition-colors" />
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECCIONES (Acceso Directo) */}
            <section className="bg-white rounded-[3.5rem] p-12 shadow-sm border-2 border-slate-100">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-100">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">Matrícula Estudiantil</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Consulta por grados y secciones</p>
                  </div>
                </div>
                <a href={ROUTE_PATHS.ESTUDIANTES} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-lg">Ver Listado Maestro</a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                {['1A','1B','1C','1D','1E','2A','2B','2C','2D','2E','3A','3B','3C','3D','3E','4A','4B','4C','4D','4E','5A','5B','5C','5D','5E'].map(s => (
                  <div key={s} className="bg-slate-50 rounded-[2rem] p-6 text-center hover:bg-white hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-400 group">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Sección</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter group-hover:scale-110 transition-transform">{s}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR (1/4) */}
          <aside className="space-y-10">
            
            {/* ACCIONES RÁPIDAS */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border-2 border-slate-100">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8 flex items-center gap-3">
                <Bolt className="w-4 h-4 text-orange-500" /> Acciones Rápidas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate(ROUTE_PATHS.NOTAS_CARGA)} className="bg-blue-50 text-blue-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105">
                  <Plus className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Nueva Nota</span>
                </button>
                <button className="bg-slate-50 text-slate-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-slate-900 hover:text-white hover:scale-105">
                  <Printer className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Imprimir</span>
                </button>
        <button 
                  onClick={() => setShowMP(true)}
                  className="bg-indigo-50 text-indigo-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-indigo-600 hover:text-white hover:scale-105"
                >
                  <FileOutput className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Generar MP</span>
                </button>
                <button 
                  onClick={() => setShowConsolidar(true)}
                  className="bg-emerald-50 text-emerald-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:scale-105"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Consolidar</span>
                </button>
                
                {/* 🚀 BOTÓN MODIFICADO: ASIGNACIÓN DOCENTES */}
                <button 
                  onClick={() => setVistaActiva('asignacion')} 
                  className="bg-purple-50 text-purple-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-105"
                >
                  <UserCheck className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Asignación</span>
                </button>
                
        <button 
                  onClick={() => navigate(ROUTE_PATHS.CONFIGURACION)}
                  className="bg-rose-50 text-rose-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-rose-600 hover:text-white hover:scale-105"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Ajustes</span>
                </button>
              </div>
            </section>

            {/* SISTEMA DE NOTAS - NUEVA SECCIÓN */}
            <section className="bg-white rounded-[3rem] p-10 shadow-sm border-2 border-slate-100">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-8 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Sistema de Notas
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => navigate('/notas-cuantitativas')}
                  className="bg-emerald-50 text-emerald-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:scale-105"
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight text-center">Cuantitativas</span>
                </button>
                <button 
                  onClick={() => navigate('/notas-cualitativas')}
                  className="bg-purple-50 text-purple-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-105"
                >
                  <Star className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight text-center">Cualitativas</span>
                </button>
                <button 
                  onClick={() => navigate('/notas-definitivas')}
                  className="bg-blue-50 text-blue-600 p-5 rounded-[2rem] flex flex-col items-center gap-3 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105"
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tight text-center">Definitivas</span>
                </button>
              </div>
            </section>

            {/* CALENDARIO ACADÉMICO */}
            <AcademicCalendar />

            {/* PRÓXIMOS EVENTOS */}
            <section className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400 mb-8 flex items-center gap-3">
                  <Bell className="w-4 h-4" /> Próximos Eventos
                </h3>
                <div className="space-y-8">
                  {[
                    { date: '15 JUN', title: 'Cierre Académico', time: 'Todo el día', color: 'border-blue-500' },
                    { date: '20 JUN', title: 'Graduación', time: '10:00 AM', color: 'border-orange-500' },
                    { date: '25 JUN', title: 'Certificados', time: '02:00 PM', color: 'border-emerald-500' },
                  ].map((ev, i) => (
                    <div key={i} className="flex gap-5 items-center group cursor-pointer">
                      <div className={`w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border-l-4 ${ev.color} group-hover:bg-white/10 transition-colors`}>
                        <span className="text-[11px] font-black leading-none">{ev.date.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-slate-500">{ev.date.split(' ')[1]}</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">{ev.title}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{ev.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors border-t border-white/5">
                  Ver Agenda Completa
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/5 rounded-full blur-2xl" />
            </section>

          </aside>
                {/* ── MODAL DE CONSOLIDACIÓN ────────────────────────────────── */}
      {showConsolidar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowConsolidar(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 p-8 text-white relative border-b-8 border-emerald-600">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Proceso Crítico</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">Consolidar Definitivas</h2>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Este proceso calculará las definitivas (Promedio de 3 Lapsos) y asignará el estatus de aprobado (F) o reprobado a los estudiantes de la sección seleccionada.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Grado</label>
                  <select value={consGrado} onChange={e => setConsGrado(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition">
                    <option value="">Seleccionar...</option>
                    <option value="16">1er Año</option>
                    <option value="17">2do Año</option>
                    <option value="18">3er Año</option>
                    <option value="19">4to Año</option>
                    <option value="20">5to Año</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Sección</label>
                  <select value={consSeccion} onChange={e => setConsSeccion(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-emerald-600 transition">
                    <option value="">Seleccionar...</option>
                    {['A', 'B', 'C', 'D', 'E', 'U'].map(s => <option key={s} value={s}>Sección {s}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!consGrado || !consSeccion) return alert('Seleccione Grado y Sección');
                  setConsLoading(true);
                  try {
                    const token = localStorage.getItem('siga_token');
                    const res = await fetch(`${API_BASE_URL}/api/ctrl-estudios/consolidar-definitivas`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ grado_id: consGrado, seccion: consSeccion })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`✅ ${data.mensaje} - Estudiantes procesados: ${data.estudiantes_procesados}`);
                      setShowConsolidar(false);
                    } else {
                      alert(`❌ Error: ${data.error}`);
                    }
                  } catch (err) {
                    alert('Error de conexión al consolidar');
                  } finally {
                    setConsLoading(false);
                  }
                }}
                disabled={consLoading}
                className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {consLoading ? 'Procesando...' : '⚡ Ejecutar Consolidación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
          {/* ── MODAL DE MATERIAS PENDIENTES ──────────────────────────── */}
      {showMP && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowMP(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 p-8 text-white relative border-b-8 border-orange-600">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <AlertTriangle className="w-7 h-7 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-1">Clasificación Final</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">Generar MP / Repitientes</h2>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                El sistema evaluará las materias reprobadas. Alumnos con 1 o 2 pasarán con MP, y con 3 o más repetirán grado.
              </p>

              <div>
                <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Grado a Procesar</label>
                <select value={mpGrado} onChange={e => setMpGrado(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-orange-600 transition">
                  <option value="">Seleccionar...</option>
                  <option value="16">1er Año</option>
                  <option value="17">2do Año</option>
                  <option value="18">3er Año</option>
                  <option value="19">4to Año</option>
                  <option value="20">5to Año</option>
                </select>
              </div>

              <button 
                onClick={async () => {
                  if (!mpGrado) return alert('Seleccione un Grado');
                  setMpLoading(true);
                  try {
                    const token = localStorage.getItem('siga_token');
                    const res = await fetch(`${API_BASE_URL}/api/ctrl-estudios/generar-mp`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ grado_id: mpGrado })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`✅ ${data.mensaje}\n\nAlumnos con MP: ${data.alumnos_mp}\nAlumnos que repiten: ${data.alumnos_repiten}`);
                      setShowMP(false);
                    } else {
                      alert(`❌ Error: ${data.error}`);
                    }
                  } catch (err) {
                    alert('Error de conexión al generar MP');
                  } finally {
                    setMpLoading(false);
                  }
                }}
                disabled={mpLoading}
                className="w-full bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {mpLoading ? 'Procesando...' : '⚠️ Ejecutar Clasificación MP'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
