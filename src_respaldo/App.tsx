import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, LogOut, X } from 'lucide-react';
import { LoginIntranet } from '@/components/LoginIntranet';
import { useAuth } from '@/hooks/useAuth';
import Asistencia from '@/pages/Asistencia';
import Estudiantes from '@/pages/Estudiantes';
import MiMatricula from '@/pages/MiMatricula';
import SigaDashboard from '@/pages/SigaDashboard';
import TeacherDashboard from '@/pages/TeacherDashboard';
import CargaNotasCuantitativas from '@/pages/CargaNotasCuantitativas';
import CargaNotasCualitativas from '@/pages/CargaNotasCualitativas';
import NotasDefinitivas from '@/pages/NotasDefinitivas';
import ReporteIncidencias from '@/pages/ReporteIncidencias';
import PlanificacionDocente from '@/pages/PlanificacionDocente';

// ============================================================
// Botón de usuario (Para otros roles)
// ============================================================
function UserMenu({ nombres, apellidos, etiqueta, onLogout }: {
    nombres: string; apellidos: string; etiqueta: string; onLogout: () => void;
}) {
    const [show, setShow] = useState(false);
    const iniciales = nombres?.[0] + apellidos?.[0];

    if (!show) {
        return (
            <button onClick={() => setShow(true)}
                className="fixed top-4 right-4 z-50 bg-slate-900/90 backdrop-blur text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-[11px] font-bold hover:bg-slate-800 transition cursor-pointer">
                <span className="w-6 h-6 rounded-full bg-[#F4B41A] flex items-center justify-center text-[9px] font-black text-slate-900">{iniciales}</span>
                {nombres} {apellidos?.charAt(0)}.
            </button>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 min-w-[230px] animate-fadeIn">
            <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-4 h-4" /></button>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center text-white font-black text-sm">{iniciales}</div>
                <div>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{nombres} {apellidos}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{etiqueta}</p>
                </div>
            </div>
            <button onClick={() => { onLogout(); setShow(false); }}
                className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
            </button>
        </div>
    );
}

// ============================================================
// Menú de emergencia (Solo aparece en sub-páginas como Notas)
// ============================================================
function DocenteMenu({ onLogout }: { onLogout: () => void }) {
    const location = useLocation();
    if (location.pathname === '/docente') return null;

    return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-2 flex gap-2 md:bottom-auto md:left-4 md:right-auto md:top-4 md:bg-white md:backdrop-blur-none md:border md:border-slate-200 md:rounded-xl md:shadow-lg md:p-1.5">
       <Link to="/docente" className="flex-1 md:flex-none px-4 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer bg-slate-50 text-slate-900 hover:bg-slate-100 text-center md:bg-white md:hover:bg-slate-100">
           ← Volver al Panel
       </Link>
       <button onClick={onLogout} className="flex-1 md:flex-none px-4 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center gap-2 border border-red-100">
           <LogOut className="w-3.5 h-3.5" /> Salir
       </button>
    </div>
    );
}

// ============================================================
// Layout Docente (Contenedor que usa <Outlet />)
// ============================================================
function DocenteLayout({ onLogout }: { onLogout: () => void }) {
    return (
        <>
            <DocenteMenu onLogout={onLogout} />
            {/* Outlet es el hueco donde React Router inyectará las sub-páginas */}
            <Outlet />
        </>
    );
}

// ============================================================
// Panel Control de Estudios
// ============================================================
function ControlEstudiosPanel({ nombres, apellidos, etiqueta, onLogout }: { nombres: string; apellidos: string; etiqueta: string; onLogout: () => void }) {
    const usuarioAdaptado = { id: '0', nombre: nombres, apellido: apellidos, cedula: '', rol: 'ctrl_estudios' as const, email: '' };
    return <SigaDashboard user={usuarioAdaptado} onLogout={onLogout} />;
}

// ============================================================
// Placeholder
// ============================================================
function PlaceholderPanel({ titulo, color, nombres, apellidos, etiqueta, onLogout }: { titulo: string; color: string; nombres: string; apellidos: string; etiqueta: string; onLogout: () => void }) {
    return (
        <>
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg" style={{ background: color }}>{titulo.charAt(0)}</div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{titulo}</h1>
                    <p className="text-slate-500 mt-3 text-sm">Dashboard en construcción</p>
                </div>
            </div>
            <UserMenu nombres={nombres} apellidos={apellidos} etiqueta={etiqueta} onLogout={onLogout} />
        </>
    );
}

// ============================================================
// App (UNICO lugar que llama useAuth)
// ============================================================
function App() {
    const { isAuthenticated, user, step, logout } = useAuth();
    const loggedIn = isAuthenticated && step === 'autenticado';
    const rol = user?.rol?.codigo || '';
    const nombres = user?.nombres || '';
    const apellidos = user?.apellidos || '';
    const etiqueta = user?.rol?.etiqueta || user?.rol?.nombre || '';
    const cedula = user?.cedula || '';

    const usuarioAdaptado = { id: '0', nombre: nombres, apellido: apellidos, cedula: '', rol: 'docente' as const, email: '', especialidad: etiqueta };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={loggedIn ? <Navigate to="/" replace /> : <LoginIntranet />} />
                
                {/* ── Rutas del Docente (anidadas, SIN / al inicio) ── */}
                <Route path="/docente" element={
                    !loggedIn ? <Navigate to="/login" replace /> 
                    : rol !== 'docente' ? <Navigate to="/" replace />
                    : <DocenteLayout onLogout={logout} />
                }>
                    <Route index element={<TeacherDashboard user={usuarioAdaptado} onLogout={logout} />} />
                    <Route path="notas-cuantitativas" element={<CargaNotasCuantitativas user={usuarioAdaptado} cedula={cedula} />} />
                    <Route path="notas-cualitativas" element={<CargaNotasCualitativas user={usuarioAdaptado} cedula={cedula} />} />
                    <Route path="notas-definitivas" element={<NotasDefinitivas user={usuarioAdaptado} cedula={cedula} />} />
                    <Route path="asistencia" element={<Asistencia user={usuarioAdaptado} cedula={cedula} />} />
                    <Route path="estudiantes" element={<MiMatricula user={usuarioAdaptado} cedula={cedula} />} />
		    <Route path="incidencias" element={<ReporteIncidencias cedula={cedula} />} />
		    <Route path="planificacion" element={<PlanificacionDocente cedula={cedula} user={usuarioAdaptado} />} />
                    <Route path="*" element={<Navigate to="/docente" replace />} />
                </Route>

                {/* ── Rutas de Notas (TOP LEVEL, para Ctrl. de Estudios) ── */}
                <Route path="/notas-cuantitativas" element={
                    loggedIn
                        ? <CargaNotasCuantitativas user={usuarioAdaptado} cedula={cedula} />
                        : <Navigate to="/login" replace />
                } />
                <Route path="/notas-cualitativas" element={
                    loggedIn
                        ? <CargaNotasCualitativas user={usuarioAdaptado} cedula={cedula} />
                        : <Navigate to="/login" replace />
                } />
                <Route path="/notas-definitivas" element={
                    loggedIn
                        ? <NotasDefinitivas user={usuarioAdaptado} cedula={cedula} />
                        : <Navigate to="/login" replace />
                } />

                {/* ── Ruta raíz: redirige según rol ── */}
                <Route path="/" element={
                    !loggedIn ? <Navigate to="/login" replace />
                        : rol === 'docente' ? <Navigate to="/docente" replace />
                        : rol === 'ctrl_estudios' ? <ControlEstudiosPanel nombres={nombres} apellidos={apellidos} etiqueta={etiqueta} onLogout={logout} />
                        : rol === 'sistema' ? <PlaceholderPanel titulo="Sistema" color="#c62828" nombres={nombres} apellidos={apellidos} etiqueta={etiqueta} onLogout={logout} />
                        : rol === 'directivos' ? <PlaceholderPanel titulo="Directivos" color="#6a1b9a" nombres={nombres} apellidos={apellidos} etiqueta={etiqueta} onLogout={logout} />
                        : rol === 'secretaria' ? <PlaceholderPanel titulo="Secretaría" color="#00695c" nombres={nombres} apellidos={apellidos} etiqueta={etiqueta} onLogout={logout} />
                        : <Navigate to="/login" replace />
                } />
                
                <Route path="*" element={loggedIn ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
