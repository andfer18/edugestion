import { useState, useEffect } from 'react';
import { Search, Users, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CONFIG ───────────────────────────────────────────────
const API = `http://${window.location.hostname}:3000`;

const GRADOS_IDS: Record<string, number> = {
  '1er Año': 16,
  '2do Año': 17,
  '3er Año': 18,
  '4to Año': 19,
  '5to Año': 20,
};

// Mapeo inverso: traduce el ID (19) al nombre legible ("4to Año")
const NOMBRES_GRADOS: Record<string, string> = {
  '16': '1er Año',
  '17': '2do Año',
  '18': '3er Año',
  '19': '4to Año',
  '20': '5to Año',
};

const TODAS_SECCIONES = ['A', 'B', 'C', 'D', 'E'];

// ─── TIPOS ────────────────────────────────────────────────
interface Asignacion {
  grado: string;
  seccion: string;
  materia: string;
}

interface EstudianteReal {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  [key: string]: any;
}

// ─── KPI CARD ─────────────────────────────────────────────
function KpiCard({ label, value, color, idx }: { label: string; value: string | number; color: string; idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className={`bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-7 shadow-sm border-l-8 ${color}`}
    >
      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{label}</p>
      <span className="text-2xl md:text-4xl font-black italic tracking-tighter text-slate-900 leading-none">{value}</span>
    </motion.div>
  );
}

// ─── MODAL SIMPLE ─────────────────────────────────────────
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white rounded-[2.5rem] max-w-lg w-full overflow-hidden border-b-[12px] border-blue-600 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── TABS SIMPLE ──────────────────────────────────────────
function SimpleTabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 mb-6">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-xl font-black text-[9px] uppercase py-3 transition-all ${
            active === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── FICHA ESTUDIANTIL ────────────────────────────────────
function FichaEstudiante({ est }: { est: EstudianteReal }) {
  const [tab, setTab] = useState('personal');

  const campos = [
    ['Nombre Completo', `${est.nombres || ''} ${est.apellidos || ''}`.trim()],
    ['Cédula de Identidad', est.cedula ? `V-${est.cedula}` : ''],
    ['Género', est.genero === 'M' ? 'Masculino' : est.genero === 'F' ? 'Femenino' : ''],
    ['Fecha de Nacimiento', est.fecha_nacimiento || est.fechaNacimiento || ''],
  ].filter(([_, v]) => v !== '');

  return (
    <div className="p-8">
      <div className="bg-slate-900 -mx-8 -mt-8 mb-6 px-8 py-6">
        <h2 className="font-black uppercase tracking-tighter italic text-xl text-white">Ficha Estudiantil</h2>
      </div>
      <SimpleTabs
        tabs={[{ id: 'personal', label: 'Personal' }, { id: 'academico', label: 'Académico' }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'personal' && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          {campos.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-4">Datos no disponibles</p>
          ) : (
            campos.map(([k, v]) => (
              <div key={k} className="flex flex-col py-3 border-b border-slate-100 last:border-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{k}</span>
                <span className="font-black text-slate-700 text-[11px] uppercase tracking-tight">{v}</span>
              </div>
            ))
          )}
        </div>
      )}
      {tab === 'academico' && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <div className="flex justify-between py-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Período Activo</span>
            <span className="font-black text-slate-700 text-[10px] uppercase">2024-2025</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────
interface Props {
  cedula: string;
  user?: any;
}

export default function MiMatricula({ cedula }: Props) {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [nomina, setNomina] = useState<EstudianteReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNomina, setLoadingNomina] = useState(false);

  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [sel, setSel] = useState<EstudianteReal | null>(null);

  // Token automático
  const getToken = () => localStorage.getItem('siga_token') || '';
  const authHeaders = getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {};
  // ─── 1. CARGAR ASIGNACIONES ─────────────────────────────
  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const res = await fetch(`${API}/api/docente/asignaciones/${cedula}`, {
          headers: authHeaders,
        });
        const data = await res.json();

        const formateadas: Asignacion[] = data.map((a: any) => ({
          grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado || ''),
          seccion: a.seccion?.trim() || '',
          materia: a.materia?.trim() || '',
        }));

        setAsignaciones(formateadas);
        if (formateadas.length > 0 && formateadas[0].grado) {
          setActiveGrade(formateadas[0].grado);
        }
      } catch (err) {
        console.error('Error asignaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsignaciones();
  }, [cedula]);

  // ─── DERIVADOS ──────────────────────────────────────────
  const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];

  const seccionesDelGrado = asignaciones
    .filter(a => a.grado === activeGrade && a.seccion)
    .reduce((acc, curr) => {
      if (!acc.includes(curr.seccion)) acc.push(curr.seccion);
      return acc;
    }, [] as string[]);

  const materiasEnSeccion = asignaciones
    .filter(a => a.grado === activeGrade && a.seccion === activeSection)
    .map(a => a.materia);

  // ─── 2. CARGAR NÓMINA ───────────────────────────────────
  useEffect(() => {
    if (!activeGrade || !activeSection) {
      setNomina([]);
      return;
    }

    const gradoId = GRADOS_IDS[activeGrade];
    if (!gradoId) return;

    const fetchEstudiantes = async () => {
      setLoadingNomina(true);
      try {
        const res = await fetch(`${API}/api/estudiantes/${gradoId}/${activeSection}`, {
          headers: authHeaders,
        });
        const data = await res.json();
        
        // Ordenar por cédula numérica ascendente
        const cleanData = Array.isArray(data) ? [...data].sort((a, b) => {
          const numA = parseInt(String(a.cedula).replace(/\D/g, ''), 10) || 0;
          const numB = parseInt(String(b.cedula).replace(/\D/g, ''), 10) || 0;
          return numA - numB;
        }) : [];
        
        setNomina(cleanData);
      } catch (err) {
        console.error('Error nómina:', err);
        setNomina([]);
      } finally {
        setLoadingNomina(false);
      }
    };
    fetchEstudiantes();
  }, [activeGrade, activeSection]);

  // ─── FILTRAR ────────────────────────────────────────────
  const filtered = nomina.filter(est => {
    if (search === '') return true;
    return `${est.nombres} ${est.apellidos} ${est.cedula}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleGradoChange = (grado: string) => {
    setActiveGrade(grado);
    setActiveSection(null);
    setSearch('');
  };

  // ─── STATES DE CARGA ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando matrícula asignada...</p>
        </div>
      </div>
    );
  }

  if (asignaciones.length === 0 || !asignaciones.some(a => a.grado)) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">
              No tienes secciones asignadas
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Contacta a Control de Estudios para verificar tu carga docente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-[1400px] mx-auto pb-24">

      {/* HEADER */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] px-6 md:px-10 py-6 md:py-8 mb-8 shadow-sm border-b-[8px] md:border-b-[12px] border-blue-600">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
          Mi Matrícula Asignada
        </h1>
	    {(() => {
            try {
              const raw = localStorage.getItem('siga_token') || '';
              const payload = JSON.parse(atob(raw.split('.')[1]));
              return (
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-[0.2em] mt-3 leading-tight">
                  Nómina oficial — Docente: {payload.nombres} {payload.apellidos}
                </p>
              );
            } catch { return null; }
          })()}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <KpiCard label="Total en Sección" value={activeSection ? filtered.length : '—'} color="border-blue-600" idx={0} />
        <KpiCard label="Grados Asignados" value={gradosUnicos.length} color="border-emerald-500" idx={1} />
        <KpiCard label="Sección Activa" value={activeSection || '—'} color="border-blue-400" idx={2} />
        <KpiCard label={materiasEnSeccion.length === 1 ? 'Materia' : 'Materias'} value={activeSection ? (materiasEnSeccion.join(' / ') || '—') : '—'} color="border-purple-400" idx={3} />
      </div>

      {/* SELECTOR GRADO */}
      {gradosUnicos.length > 1 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2">Seleccionar Grado / Año:</p>
          <div className="flex flex-wrap gap-2">
            {gradosUnicos.map(g => (
              <button
                key={g}
                onClick={() => handleGradoChange(g)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                  activeGrade === g
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SELECTOR SECCIÓN + BUSCADOR */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 text-center md:text-left">
          Pulse una sección para ver el listado:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {TODAS_SECCIONES.map(s => {
            const available = seccionesDelGrado.includes(s);
            return (
              <button
                key={s}
                disabled={!available}
                onClick={() => { setActiveSection(s); setSearch(''); }}
                className={`py-5 rounded-[1.5rem] font-black text-xl md:text-2xl transition-all border-4 flex flex-col items-center justify-center gap-1 ${
                  !available
                    ? 'bg-slate-50 border-slate-50 text-slate-200 cursor-not-allowed opacity-50'
                    : activeSection === s
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105'
                      : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Sección</span>
                {s}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {activeSection && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 mt-6 border-t border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Buscar en ${activeGrade} "${activeSection}"...`}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs text-slate-700 transition"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LISTADO */}
      <AnimatePresence mode="wait">
        {!activeSection ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">Seleccione una sección para cargar la matrícula</h3>
          </motion.div>
        ) : loadingNomina ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-200">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
            <p className="text-[10px] font-bold text-slate-400 uppercase">Cargando estudiantes...</p>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 bg-slate-900 flex justify-between items-center">
              <h3 className="font-black text-white uppercase italic tracking-tighter text-sm">Estudiantes: {activeGrade} "{activeSection}"</h3>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{filtered.length} Registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                  <tr>
                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Estudiante</th>
                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Cédula</th>
                    <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-16 text-center">
                        <p className="font-black text-slate-300 uppercase italic">{search ? 'Sin resultados' : 'Sin estudiantes en esta sección'}</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((est, idx) => (
                      <tr key={est.id || idx} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 md:px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-[10px] flex-shrink-0 group-hover:scale-110 transition-transform">
                              {est.nombres?.[0]}{est.apellidos?.[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 uppercase text-[11px] leading-tight">{est.apellidos}, {est.nombres}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Inscrito • 2024-2025</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-5 font-mono font-black text-slate-700 text-xs tracking-tighter">V-{est.cedula || '——'}</td>
                        <td className="px-6 md:px-8 py-5 text-center">
                          <button
                            onClick={() => { setSel(est); setModalOpen(true); }}
                            className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all mx-auto"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 md:px-8 py-3 bg-slate-50 border-t flex justify-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total en lista: {nomina.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL FICHA */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {sel && <FichaEstudiante est={sel} />}
      </Modal>
    </div>
  );
}
