import { motion } from 'framer-motion';
import { 
  Users, ShieldAlert, ClipboardList, Database, 
  UserPlus, Settings, Lock, ShieldCheck, 
  BarChart3, Activity, Bell, Info, 
  RefreshCw, Power
} from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Usuarios Registrados', value: '127', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Alertas de Seguridad', value: '3', icon: ShieldAlert, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Solicitudes', value: '18', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Backups', value: '2', icon: Database, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
  ];

  const actions = [
    { label: 'Crear Usuario', icon: UserPlus, color: 'purple' },
    { label: 'Configuración del Sistema', icon: Settings, color: 'indigo' },
    { label: 'Permisos y Roles', icon: Lock, color: 'blue' },
    { label: 'Respaldo de Datos', icon: Database, color: 'slate' },
    { label: 'Seguridad', icon: ShieldCheck, color: 'red' },
    { label: 'Reportes', icon: BarChart3, color: 'emerald' },
  ];

  const logs = [
    { type: 'login', desc: 'Inicio de sesión administrativo', time: 'Hoy, 09:15 AM', user: 'admin@lapaz.edu.ve', ip: '192.168.1.100' },
    { type: 'config', desc: 'Cambio en configuración de seguridad', time: 'Hoy, 08:30 AM', user: 'admin@lapaz.edu.ve', ip: '192.168.1.100' },
    { type: 'user', desc: 'Nuevo usuario creado: evaluador2', time: 'Ayer, 04:45 PM', user: 'admin@lapaz.edu.ve', ip: '192.168.1.105' },
    { type: 'backup', desc: 'Respaldo de base de datos completado', time: 'Ayer, 11:00 PM', user: 'sistema', ip: 'localhost' },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full p-2 shadow-sm border border-slate-100">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Panel de Administración</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              admin@lapaz.edu.ve <span className="w-1 h-1 bg-slate-300 rounded-full" /> 
              <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[9px]">Administrador del Sistema</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} ${stat.border} border-2 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-default group`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-black uppercase text-[10px] tracking-widest ${stat.color}`}>{stat.label}</h3>
              <div className={`${stat.bg.replace('50', '100')} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Estado del Sistema</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" /> Acciones de Administración
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {actions.map((action, i) => (
                <button 
                  key={i}
                  className={`bg-slate-50 border-2 border-slate-50 hover:border-purple-200 hover:bg-purple-50 p-6 rounded-[2rem] text-center transition-all group`}
                >
                  <div className="w-12 h-12 mx-auto bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <action.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-black text-slate-700 uppercase text-[10px] tracking-tight">{action.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2 mb-8">
              <Activity className="w-5 h-5 text-indigo-600" /> Registro de Actividad
            </h2>
            <div className="space-y-4">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {log.type === 'login' && <Lock className="w-4 h-4 text-blue-600" />}
                    {log.type === 'config' && <Settings className="w-4 h-4 text-purple-600" />}
                    {log.type === 'user' && <UserPlus className="w-4 h-4 text-emerald-600" />}
                    {log.type === 'backup' && <Database className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{log.desc}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{log.time}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-slate-500 uppercase">{log.user}</p>
                    <p className="text-[9px] font-bold text-slate-400 font-mono">{log.ip}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 transition">
              Ver registro completo
            </button>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-red-600" /> Alertas del Sistema
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 border-l-4 border-red-500">
                <p className="text-sm font-black text-red-900 uppercase tracking-tight">Intento de acceso fallido</p>
                <p className="text-[10px] font-bold text-red-600 uppercase mt-1">Hoy, 08:45 AM • IP: 190.202.x.x</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border-l-4 border-amber-500">
                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Backup pendiente</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">Ayer, 11:30 PM • Servidor: DB-01</p>
              </div>
            </div>
            <button className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">
              Ver todas las alertas
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white">
            <h2 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2 mb-6">
              <RefreshCw className="w-5 h-5 text-purple-400" /> Configuración Rápida
            </h2>
            <div className="space-y-6">
              {[
                { label: 'Modo Mantenimiento', desc: 'Restringe acceso público', active: false },
                { label: 'Autenticación 2FA', desc: 'Requerir código móvil', active: true },
                { label: 'Registro Detallado', desc: 'Logs de transacciones', active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{item.label}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${item.active ? 'bg-purple-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 bg-white text-slate-900 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-400 transition shadow-lg flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
