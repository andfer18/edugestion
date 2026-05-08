import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROL_LABELS } from '@/lib/index';
import type { Usuario } from '@/lib/index';

const ROL_ACCENT: Record<string, string> = {
  administrador:    'border-purple-500',
  ctrl_estudios:    'border-blue-500',
  secretaria:       'border-orange-500',
  secretaria_jefe:  'border-orange-600',
  secretaria_ctrl:  'border-orange-400',
  secretaria_reg:   'border-orange-300',
  secretaria_aux:   'border-orange-200',
  coord_pedagogico: 'border-emerald-500',
  docente:          'border-slate-400',
};

interface LayoutProps { 
  user: Usuario; 
  onLogout: () => void; 
  children: React.ReactNode; 
}

export function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const initials = `${user?.nombre?.[0] || 'U'}${user?.apellido?.[0] || ''}`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Se eliminó el <aside> aquí */}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            {/* Logo movido al header principal */}
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg p-1.5 shrink-0 border border-slate-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1 truncate">
                EduGestión
              </h2>
              <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">Complejo Educativo La Paz</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <p className="font-black text-slate-900 uppercase italic text-[10px] md:text-[11px] leading-none mb-1 truncate max-w-[120px]">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-[8px] md:text-[9px] font-bold text-blue-600 uppercase tracking-widest truncate max-w-[120px]">
                {ROL_LABELS[user?.rol] || 'Usuario'}
              </p>
            </div>
            {/* Avatar ahora sirve como botón para cerrar sesión */}
            <div 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border-2 md:border-4 flex items-center justify-center font-black text-xs md:text-sm text-slate-600 shadow-sm relative cursor-pointer hover:scale-105 transition-all ${ROL_ACCENT[user?.rol] || 'border-slate-200'}`}
              onClick={onLogout}
              title="Cerrar Sesión"
            >
              {initials}
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Se eliminó el Drawer/Overlay del Sidebar móvil aquí */}
    </div>
  );
}
