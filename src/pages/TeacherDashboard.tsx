import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Clock, Cloud, Calendar as CalendarIcon, Bolt, Bell,
  FileText, Scroll,
  ClipboardList, Users, MapPin, CalendarDays,
  Presentation, ChevronLeft, ChevronRight,
  AlertTriangle, LogOut, BookOpen, Star, TrendingUp
} from 'lucide-react';

const AcademicCalendar = () => {
  const [currentDate] = useState(new Date());
  const events = [
    { date: '2026-04-05', label: 'Feriado: Semana Santa', type: 'holiday' },
    { date: '2026-04-09', label: 'Reunión Coordinación', type: 'meeting' },
    { date: '2026-04-15', label: 'Entrega Boletines', type: 'delivery' },
    { date: '2026-04-20', label: 'Inicio de Evaluaciones', type: 'academic' },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: adjustedFirstDay }, (_, i) => i);

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long' });
  const year = currentDate.getFullYear();
  const today = currentDate.getDate();

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
        <p className="text-xs font-black uppercase tracking-tighter text-slate-900 italic capitalize">{monthName} {year}</p>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['L','M','M','J','V','S','D'].map(d => (
          <div key={d} className="text-[9px] font-black text-slate-300 uppercase mb-2">{d}</div>
        ))}
        {emptyDays.map(i => <div key={`e-${i}`} />)}
        {days.map(d => {
          const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const event = events.find(e => e.date === dateStr);
          const isToday = d === today;
          return (
            <div
              key={d}
              className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-xl relative cursor-help group transition-all
                ${isToday ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}
                ${event && !isToday ? 'bg-orange-50 text-orange-600 border border-orange-100' : ''}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function TeacherDashboard({ user, onLogout }: { user: { nombre: string; apellido: string; especialidad?: string }; onLogout: () => void }) {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const diaNum = date.getDate();
    const mesNombre = date.toLocaleDateString('es-ES', { month: 'long' });
    const año = date.getFullYear();
    let horas = date.getHours();
    const minutos = date.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;
    return { fecha: `${diaNum} de ${mesNombre}, ${año}`, hora: `${horas}:${minutos}`, ampm };
  };

  const dateTime = formatDate(time);

  const teacherActions = [
    { icon: ClipboardList, label: 'Ver mi Matrícula', sub: 'Estudiantes asignados', path: '/docente/estudiantes', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Clock, label: 'Asistencia', sub: 'Registro por Momento', path: '/docente/asistencia', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: FileText, label: 'Carga de Planificación', sub: 'Formato MPPE', path: '/docente/planificacion', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: BookOpen, label: 'Notas Cuantitativas', sub: 'Sistema de Evaluación', path: '/docente/notas-cuantitativas', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Star, label: 'Notas Cualitativas', sub: 'Desempeño Estudiantil', path: '/docente/notas-cualitativas', color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: TrendingUp, label: 'Notas Definitivas', sub: 'Consolidado Final', path: '/docente/notas-definitivas', color: 'text-sky-600', bg: 'bg-sky-50' },
    { icon: AlertTriangle, label: 'Reporte de Incidencias', sub: 'Registro de novedades', path: '/docente/incidencias', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const eventos = [
    { id: 1, title: 'Evaluaciones del Lapso', date: '15 JUN 2025', time: '08:00 AM', location: 'Aula Magna', color: 'bg-blue-50', iconColor: 'text-blue-600', icon: 'Presentation' },
    { id: 2, title: 'Consejo de Docentes', date: '20 JUN 2025', time: '10:00 AM', location: 'Sala de Profesores', color: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: 'Users' },
    { id: 3, title: 'Entrega de Boletines', date: '25 JUN 2025', time: '02:00 PM', location: 'Control de Estudios', color: 'bg-orange-50', iconColor: 'text-orange-600', icon: 'Calendar' },
  ];

  const menuItems = [
    { label: 'Panel Docente', path: '/docente' },
    { label: 'Asistencia', path: '/docente/asistencia' },
    { label: 'Matrícula', path: '/docente/estudiantes' },
    { label: 'Reporte Incidencias', path: '#' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* Cabecera */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 mb-8 shadow-sm border-b-[12px] border-primary flex flex-col relative overflow-hidden">
        
        {/* Fila Superior */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white p-2 rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                Sistema de Gestión Docente
              </h1>
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.3em] mt-2">
                {user.nombre} {user.apellido} • {user.especialidad || 'Docente'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-900 px-6 py-3 rounded-3xl border-b-4 border-slate-700 flex items-center gap-4">
              <div className="text-white text-right">
                <p className="text-[20px] font-black italic tracking-tighter leading-none">{dateTime.hora}</p>
                <p className="text-[8px] font-black uppercase text-blue-400">{dateTime.ampm}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-700" />
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-300" />
                <div className="text-white">
                  <p className="text-[12px] font-black italic leading-none">28°C</p>
                  <p className="text-[7px] font-bold uppercase text-slate-500">Soleado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila Inferior: Menú + Logout */}
        <div className="w-full mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              if (item.path === '#') {
                return (
                  <span key={item.label} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 cursor-not-allowed">
                    {item.label}
                  </span>
                );
              }
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${isActive ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button 
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-red-500 hover:bg-red-50 flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Funciones */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 mb-10">
              <Bolt className="w-6 h-6 text-primary" /> Mis Funciones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherActions.map((action, i) => (
                <Link key={action.label} to={action.path} className="group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-slate-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-primary hover:bg-white hover:shadow-xl transition-all h-full"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-[13px] font-black text-slate-900 uppercase italic mb-1">{action.label}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{action.sub}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Eventos Próximos */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-orange-500" /> Notificaciones
            </h3>
            <div className="space-y-4">
              {eventos.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -4 }}
                  className="bg-white border-2 border-slate-50 rounded-[1.5rem] p-5 hover:shadow-lg transition-all border-l-8 border-l-primary"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 h-10 w-10 ${event.color} rounded-xl flex items-center justify-center`}>
                      {event.icon === 'Users' && <Users className={`w-5 h-5 ${event.iconColor}`} />}
                      {event.icon === 'Presentation' && <Presentation className={`w-5 h-5 ${event.iconColor}`} />}
                      {event.icon === 'Calendar' && <CalendarIcon className={`w-5 h-5 ${event.iconColor}`} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 uppercase text-xs italic leading-tight mb-2">{event.title}</h4>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                          <CalendarDays className="w-3 h-3 text-blue-500" /> {event.date}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                          <Clock className="w-3 h-3 text-purple-500" /> {event.time}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                          <MapPin className="w-3 h-3 text-red-500" /> {event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <AcademicCalendar />
        </div>
      </div>
    </div>
  );
}
