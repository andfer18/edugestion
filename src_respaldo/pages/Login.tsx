import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Eye, EyeOff } from 'lucide-react';
import { ROUTE_PATHS, ROL_LABELS } from '@/lib/index';
import type { Rol } from '@/lib/index';

const rolDemos: { rol: Rol; email: string; label: string; color: string }[] = [
  { rol: 'administrador',    email: 'admin@ueejemplo.edu.ve',         label: 'Admin Sistema',     color: 'border-purple-500 hover:border-purple-400' },
  { rol: 'ctrl_estudios',    email: 'directora@ueejemplo.edu.ve',     label: 'Control Estudios',  color: 'border-blue-500   hover:border-blue-400' },
  { rol: 'coord_pedagogico', email: 'coordinador@ueejemplo.edu.ve',   label: 'Coord. Pedagógico', color: 'border-emerald-500 hover:border-emerald-400' },
  { rol: 'secretaria',       email: 'secretaria@ueejemplo.edu.ve',    label: 'Secretaría',        color: 'border-orange-500 hover:border-orange-400' },
  { rol: 'docente',          email: 'amartinez@ueejemplo.edu.ve',     label: 'Docente',           color: 'border-slate-500  hover:border-slate-400' },
];

interface LoginPageProps { onLogin: (email: string, password: string, rol: Rol) => boolean; }

export default function Login({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('admin@ueejemplo.edu.ve');
  const [password, setPassword] = useState('demo1234');
  const [rol,      setRol]      = useState<Rol>('administrador');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 550));
    const ok = onLogin(email, password, rol);
    setLoading(false);
    if (ok) navigate(ROUTE_PATHS.DASHBOARD);
    else setError('Credenciales incorrectas. Verifica tus datos.');
  };

  const handleQuick = (d: typeof rolDemos[0]) => { setRol(d.rol); setEmail(d.email); setPassword('demo1234'); };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased">

      {/* ── Panel izquierdo oscuro — estilo SIGA hero ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-slate-900 p-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-full p-1 shadow-sm border border-slate-100">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-black text-white text-lg uppercase tracking-tight leading-none">EduGestión</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Complejo Educativo La Paz</p>
          </div>
        </div>

        {/* Hero copy */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none mb-6">
            Sistema Inteligente<br />de Gestión Escolar
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
            Automatiza inscripciones, notas, boletines, constancias y reportes para el Ministerio. Todo en un solo sistema.
          </p>          
        </motion.div>

        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">
          © 2025 EduGestión — Inspirado en SIGA
        </p>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg p-1.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-slate-900 text-xl uppercase tracking-tight">EduGestión</span>
          </div>

          {/* Card formulario */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-b-8 border-primary">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-1">
              Iniciar Sesión
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
              Complejo Educativo La Paz — Acceso al Sistema
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Perfil */}
              <div>
                <label className="block text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Perfil de Acceso</label>
                <select
                  value={rol}
                  onChange={e => setRol(e.target.value as Rol)}
                  className="siga-input cursor-pointer"
                >
                  {(Object.keys(ROL_LABELS) as Rol[]).map(r => (
                    <option key={r} value={r}>{ROL_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Correo / Cédula</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@ueejemplo.edu.ve" required
                  className="siga-input"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    className="siga-input pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold uppercase tracking-wide">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full siga-btn-primary flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verificando...</>
                ) : 'Bienvenido →'}
              </button>
            </form>

            {/* Acceso rápido demo */}
            <div className="mt-7 pt-6 border-t-2 border-slate-100">
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Acceso Rápido — Demo</p>
              <div className="grid grid-cols-1 gap-2">
                {rolDemos.map(d => (
                  <button key={d.rol} onClick={() => handleQuick(d)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 bg-slate-50 hover:bg-white transition-all text-left ${
                      rol === d.rol ? d.color + ' bg-white shadow-sm' : 'border-slate-200'
                    }`}>
                    <span className="font-black text-slate-700 text-[10px] uppercase tracking-wide">{d.label}</span>
                    {rol === d.rol && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
