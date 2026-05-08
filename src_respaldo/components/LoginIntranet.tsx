import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { RolAsignado } from '@/types/auth';

export function LoginIntranet() {
    const {
        step, verificarCedula, verificarContrasena, seleccionarRol,
        rolesDisponibles, nombreCompleto, loading, error, dispositivoNuevo, volver
    } = useAuth();

    const [cedula, setCedula] = useState('');
    const [password, setPassword] = useState('');
    const cedulaRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 'idle') cedulaRef.current?.focus();
        if (step === 'password') passRef.current?.focus();
    }, [step]);

    const handleVerificar = async (e: React.FormEvent) => {
        e.preventDefault();
        await verificarCedula(cedula);
    };

    const handleContrasena = async (e: React.FormEvent) => {
        e.preventDefault();
        await verificarContrasena(password);
    };

    return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">

                {/* ===== Header (común a todos los pasos) ===== */}
                <div className="text-center pt-10 pb-6 px-8">
                    <img
                        src="/logo.png"
                        alt="Logo La Paz"
                        className="w-[72px] h-[72px] rounded-full mx-auto mb-4 object-cover border-2 border-white shadow-lg"
                    />
                    <h1 className="text-[22px] font-[800] text-[#1a3a6e] tracking-[2px] leading-none">
                        EDUGESTIÓN
                    </h1>
                    <p className="text-[11px] text-[#6b7b8d] tracking-[1px] mt-1.5">
                        INTRANET DE SEGURIDAD SIGA
                    </p>
                </div>

                {/* ===== Contenido dinámico ===== */}
                <div className="px-8 pb-8">

                    {/* Error */}
                    {error && step !== 'dispositivo_bloqueado' && (
                        <div className="mb-5 bg-[#fdecea] text-[#c62828] text-[13px] px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
                            <i className="fa-solid fa-exclamation-circle flex-shrink-0"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* =============================== */}
                    {/* PASO 1: Cédula                   */}
                    {/* =============================== */}
                    {step === 'idle' && (
                        <form onSubmit={handleVerificar}>
                            <div className="mb-5">
                                <label className="block text-[12px] font-[600] text-[#1a3a6e] mb-1.5 tracking-wide">
                                    CÉDULA DE IDENTIDAD (CI)
                                </label>
                                <input
                                    ref={cedulaRef}
                                    type="text"
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    className="w-full border-2 border-[#d0d7de] rounded-xl px-4 py-3 text-[16px] focus:border-[#1a3a6e] focus:outline-none transition outline-none"
                                    placeholder="Ej: 12345678"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1a3a6e] text-white text-[15px] font-[700] py-3.5 rounded-xl tracking-wide hover:bg-[#14305a] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Verificando...</>
                                    : <>INGRESAR A INTRANET <i className="fa-solid fa-arrow-right text-sm"></i></>
                                }
                            </button>
                        </form>
                    )}

                    {/* =============================== */}
                    {/* PASO 2: Contraseña              */}
                    {/* =============================== */}
                    {step === 'password' && nombreCompleto && (
                        <form onSubmit={handleContrasena}>
                            {/* Badge de confirmación */}
                            <div className="text-center py-4 px-3 bg-[#e8f5e9] rounded-xl mb-5">
                                <i className="fa-solid fa-circle-check text-[#2e7d32] text-[26px]"></i>
                                <p className="text-[11px] text-[#2e7d32] font-[700] tracking-wide mt-1">
                                    IDENTIDAD CONFIRMADA
                                </p>
                                <p className="text-[17px] font-[700] text-[#1a3a6e] mt-0.5">
                                    {nombreCompleto}
                                </p>
                                <p className="text-[12px] text-[#666] mt-0.5">
                                    Cédula verificada en el sistema
                                </p>
                            </div>

                            <div className="mb-5">
                                <label className="block text-[12px] font-[600] text-[#1a3a6e] mb-1.5 tracking-wide">
                                    CONTRASEÑA DE ACCESO
                                </label>
                                <input
                                    ref={passRef}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-2 border-[#d0d7de] rounded-xl px-4 py-3 text-[16px] focus:border-[#1a3a6e] focus:outline-none transition outline-none"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1a3a6e] text-white text-[15px] font-[700] py-3.5 rounded-xl tracking-wide hover:bg-[#14305a] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <><span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Verificando...</>
                                    : <><i className="fa-solid fa-shield-halved text-sm"></i>CONFIRMAR</>
                                }
                            </button>
                            <button
                                type="button"
                                onClick={volver}
                                disabled={loading}
                                className="w-full text-[#1a3a6e] text-[14px] font-[600] py-3 rounded-xl border-2 border-[#1a3a6e] mt-3 hover:bg-[#f0f4fa] transition disabled:opacity-50"
                            >
                                VOLVER
                            </button>
                        </form>
                    )}

                    {/* =============================== */}
                    {/* PASO 3: Selección de rol        */}
                    {/* =============================== */}
                    {step === 'seleccion_rol' && nombreCompleto && (
                        <div>
                            <p className="text-[14px] font-[700] text-[#1a3a6e] text-center mb-5">
                                SELECCIONE PERFIL DE TRABAJO
                            </p>

                            {dispositivoNuevo && (
                                <div className="text-center bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5 mb-4">
                                    <i className="fa-solid fa-laptop text-sky-400 text-sm"></i>
                                    <p className="text-[11px] text-sky-600 font-semibold mt-0.5">
                                        Dispositivo registrado exitosamente
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {rolesDisponibles.map((rol: RolAsignado) => (
                                    <button
                                        key={rol.asignacion_id}
                                        type="button"
                                        onClick={() => seleccionarRol(rol)}
                                        disabled={loading}
                                        className="w-full p-4 rounded-xl border-2 border-[#d0d7de] hover:border-[#1a3a6e] hover:bg-[#eef2fa] transition-all text-left flex items-center gap-3.5 disabled:opacity-50"
                                    >
                                        <div
                                            className="w-11 h-11 rounded-xl text-white flex items-center justify-center flex-shrink-0"
                                            style={{ background: rol.color || '#1a3a6e' }}
                                        >
                                            <i className={`fa-solid ${rol.icono || 'fa-user'} text-[17px]`}></i>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-[700] text-[#1a3a6e] text-[14px] truncate">
                                                ENTRAR COMO {rol.etiqueta?.toUpperCase() || rol.nombre.toUpperCase()}
                                            </p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-[#bbb] text-[13px] flex-shrink-0"></i>
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={volver}
                                disabled={loading}
                                className="w-full text-[#1a3a6e] text-[14px] font-[600] py-3 rounded-xl border-2 border-[#1a3a6e] mt-4 hover:bg-[#f0f4fa] transition disabled:opacity-50"
                            >
                                VOLVER
                            </button>
                        </div>
                    )}

                    {/* =============================== */}
                    {/* Dispositivo bloqueado            */}
                    {/* =============================== */}
                    {step === 'dispositivo_bloqueado' && (
                        <div className="text-center space-y-3 py-3">
                            <div className="w-16 h-16 bg-[#fdecea] rounded-full mx-auto flex items-center justify-center">
                                <i className="fa-solid fa-laptop-code text-[#c62828] text-2xl"></i>
                            </div>
                            <h3 className="text-[16px] font-[700] text-[#c62828]">Dispositivo No Reconocido</h3>
                            <p className="text-[13px] text-slate-600 leading-relaxed">
                                Por políticas de seguridad y protección de datos de menores,
                                este equipo no está autorizado para acceder al sistema.
                            </p>
                            <div className="bg-[#f8f9fc] rounded-xl p-4">
                                <p className="text-[12px] text-slate-500 leading-relaxed">
                                    Contacte al <span className="font-[700] text-[#1a3a6e]">Coordinador de Control y Evaluación</span>
                                    para solicitar la autorización de este dispositivo.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={volver}
                                className="w-full text-[#1a3a6e] text-[14px] font-[600] py-3 rounded-xl border-2 border-[#1a3a6e] mt-2 hover:bg-[#f0f4fa] transition"
                            >
                                VOLVER AL INICIO
                            </button>
                        </div>
                    )}
                </div>

                {/* ===== Footer ===== */}
                <div className="flex justify-between items-center px-8 py-4 border-t border-[#eee]">
                    <span className="text-[11px] text-[#2e7d32] font-[600] flex items-center gap-1.5">
                        <span className="w-[7px] h-[7px] bg-[#2e7d32] rounded-full animate-pulse"></span>
                        INTRANET ACTIVA
                    </span>
                    <span className="text-[11px] text-[#aab]">V3.5.0 - 8</span>
                </div>
            </div>
        </div>
    );
}
