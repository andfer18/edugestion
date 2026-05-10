import React, { useState, useEffect } from 'react'; // <-- Añadido useEffect
import { useNavigate } from 'react-router-dom';
import { generateExcel31059 } from '../utils/generateExcel31059';
import API_BASE_URL from '../apiConfig';

const GRADOS_MAP: { [key: string]: string } = {
  '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año'
};

const GRADO_FILE_MAP: { [key: string]: string } = {
  '16': '1ro', '17': '2do', '18': '3ro', '19': '4to', '20': '5to'
};

export default function ResumenFinal31059() {
  const navigate = useNavigate();

  const [tipoEvaluacion, setTipoEvaluacion] = useState('FINAL');
  const [gradoId, setGradoId] = useState('');
  const [seccion, setSeccion] = useState('');
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [definitivas, setDefinitivas] = useState<{ [id: string]: any }>({});
  const [materias, setMaterias] = useState<string[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [configInst, setConfigInst] = useState<any>(null);
  const [periodoActivo, setPeriodoActivo] = useState<string>(''); // <-- NUEVO: Para saber el periodo
  
  const [directorNombre, setDirectorNombre] = useState('');
  const [directorCI, setDirectorCI] = useState('');
  const [mppeNombre, setMppeNombre] = useState('');
  const [mppeCI, setMppeCI] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const obtenerTokenValido = (): string | null => {
    const token = localStorage.getItem('siga_token');
    if (!token) {
      alert('Tu sesión ha expirado o no has iniciado sesión. Serás redirigido al login.');
      navigate('/login');
      return null;
    }
    return token;
  };

  // 🚀 NUEVO: Cargar configuración institucional y periodo al montar el componente
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = obtenerTokenValido();
        if (!token) return;
        
        const res = await fetch(`${API_BASE_URL}/api/config`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.institucion) setConfigInst(data.institucion); // Llenamos el encabezado
          if (data.periodos) {
            const activo = data.periodos.find((p: any) => p.activo === 1);
            if (activo) setPeriodoActivo(activo.nombre); // Guardamos el periodo activo
          }
        }
      } catch (err) { 
        console.error('Error al cargar config:', err); 
      }
    };
    fetchConfig();
  }, []);

  const buscar = async () => {
    if (!gradoId || !seccion) return alert('Seleccione Grado y Sección');
    if (!periodoActivo) return alert('No se ha podido determinar el periodo activo. Ve a Configuración y guarda los ajustes académicos.');
    const token = obtenerTokenValido();
    if (!token) return; 

    setLoading(true);
    try {
       // 🚀 CAMBIO CLAVE: Le pasamos el periodo_activo al backend
       const res = await fetch(`${API_BASE_URL}/api/ctrl-estudios/planilla-31059?grado_id=${gradoId}&seccion=${seccion}&periodo=${periodoActivo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('siga_token');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Error del servidor:', errorData);
        alert(errorData.error || 'Error al consultar la API.');
        return;
      }

      const data = await res.json();
      setEstudiantes(data.estudiantes || []);
      setDefinitivas(data.definitivas || {});
      setMaterias(data.materias || []);
      setDocentes(data.docentes || []);
      
      if (data.estudiantes.length === 0) alert('No se encontraron estudiantes para este periodo y sección.');
    } catch (err) {
      console.error(err);
      alert('Error al consultar la API. Revisa la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const exportarTipo = async (tipo: 'CI' | 'CE') => {
    if (estudiantes.length === 0) return alert('No hay datos para exportar');
    const token = obtenerTokenValido();
    if (!token) return;

    const datosPlanilla = {
      estudiantes, 
      definitivas, 
      docentes, 
      seccion,
      gradoId, 
      directorNombre, 
      directorCI, 
      mppeNombre, 
      mppeCI, 
      observaciones,
      tipoEvaluacion,
      configInstitucion: configInst || {}, // Ahora esto sí tendrá datos reales!
      periodo: periodoActivo // Se lo pasamos al Excel también por si lo necesita
    };
    
    try {
      await generateExcel31059(datosPlanilla, tipo);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar el archivo Excel.');
    }
  };

  return (
    <div className="bg-slate-100 p-4 md:p-10 antialiased min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
          
          {/* ENCABEZADO INSTITUCIONAL */}
          <div className="bg-slate-900 p-8 md:p-10 text-white relative border-b-8 border-blue-600">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-tight">
              Planilla 31059
            </h1>
            <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
              Resumen Final — Control de Estudios — Periodo: {periodoActivo || 'Cargando...'}
            </p>
          </div>

          <div className="p-8 md:p-10 space-y-10">

            {/* SECCIÓN 01: SELECCIÓN */}
            <section>
              <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2 mb-6">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg">01</span>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Selección de Sección</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Grado Académico</label>
                  <select 
                    value={gradoId} 
                    onChange={e => setGradoId(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-blue-50 transition"
                  >
                    <option value="">Seleccionar...</option>
                    {Object.entries(GRADOS_MAP).map(([id, nombre]) => (
                      <option key={id} value={id}>{nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Sección</label>
                  <select 
                    value={seccion} 
                    onChange={e => setSeccion(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-blue-50 transition"
                  >
                    <option value="">Seleccionar...</option>
                    {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>Sección {s}</option>)}
                  </select>
                </div>

                <button 
                  onClick={buscar} 
                  disabled={loading} 
                  className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  ) : '🔍 Buscar'}
                </button>
              </div>
            </section>

            {/* SECCIONES CONDICIONALES (Solo si hay datos) */}
            {estudiantes.length > 0 && (
              <>
                
                {/* SECCIÓN 02: AUTORIDADES */}
                <section>
                  <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2 mb-6">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg">02</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Autoridades y Firmas</h3>
                    <span className="ml-auto bg-blue-100 text-blue-800 text-[10px] font-black px-3 py-1 rounded-full">{estudiantes.length} Estudiantes</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tarjeta Director */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Director(a)</span>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Apellidos y Nombres</label>
                        <input type="text" value={directorNombre} onChange={e => setDirectorNombre(e.target.value)} className="w-full border-b-2 border-slate-200 pb-1 bg-transparent text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Cédula de Identidad</label>
                        <input type="text" value={directorCI} onChange={e => setDirectorCI(e.target.value)} className="w-full border-b-2 border-slate-200 pb-1 bg-transparent text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition" />
                      </div>
                    </div>

                    {/* Tarjeta MPPE (Destacada) */}
                    <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-200 space-y-4 shadow-sm">
                      <span className="text-[9px] font-black text-orange-700 uppercase tracking-widest">Funcionario MPPE</span>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-orange-400 tracking-widest mb-1">Apellidos y Nombres</label>
                        <input type="text" value={mppeNombre} onChange={e => setMppeNombre(e.target.value)} className="w-full border-b-2 border-orange-200 pb-1 bg-transparent text-orange-900 font-bold focus:outline-none focus:border-orange-600 transition" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black uppercase text-orange-400 tracking-widest mb-1">Cédula de Identidad</label>
                        <input type="text" value={mppeCI} onChange={e => setMppeCI(e.target.value)} className="w-full border-b-2 border-orange-200 pb-1 bg-transparent text-orange-900 font-bold focus:outline-none focus:border-orange-600 transition" />
                      </div>
                    </div>

                    {/* Observaciones (Ancha) */}
                    <div className="lg:col-span-2">
                      <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Observaciones Generales</label>
                      <textarea 
                        value={observaciones} 
                        onChange={e => setObservaciones(e.target.value)} 
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:bg-blue-50 transition resize-none" 
                        rows={2}
                      ></textarea>
                    </div>
                  </div>
                </section>

                {/* SECCIÓN 03: EXPORTACIÓN */}
                <section>
                  <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2 mb-6">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg">03</span>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Exportación de Archivos</h3>
                  </div>

          <div className="lg:col-span-2 mb-6">
              <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Tipo de Evaluación</label>
              <select 
                value={tipoEvaluacion} 
                onChange={e => setTipoEvaluacion(e.target.value)} 
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-blue-50 transition"
              >
                <option value="FINAL">Final</option>
                <option value="REVISIÓN">Revisión</option>
                <option value="MATERIA PENDIENTE">Materia Pendiente</option>
              </select>
          </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={() => exportarTipo('CI')} 
                      className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition shadow-xl flex items-center justify-center gap-3 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition">📥</span> Exportar CI (Cédula)
                    </button>
                    <button 
                      onClick={() => exportarTipo('CE')} 
                      className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition shadow-xl flex items-center justify-center gap-3 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition">📥</span> Exportar CE (Escolar)
                    </button>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
