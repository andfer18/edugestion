import { useState, useEffect } from 'react';
import { ChevronLeft, Settings, School, Calendar, Shield, Users, Upload, Save, Lock, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import API_BASE_URL from '../apiConfig';

export default function Configuracion() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('institucion');

  // 🚀 NUEVOS ESTADOS PARA LA IMPORTACIÓN
  const [importGrado, setImportGrado] = useState('');
  const [importSeccion, setImportSeccion] = useState('');

  const [instData, setInstData] = useState({
    nombre: 'COMPLEJO EDUCATIVO LA PAZ',
    codAdministrativo: '006565630',
    codDea: 'S2382D2307',
    cdcee: 'ZULIA',
    municipio: 'JESÚS ENRIQUE LOSSADA',
    nivel: 'Educación Media General',
    direccion: 'LA PAZ, AV.PRINCIPAL SECTOR SAN BENITO, ENTRANDO POR EL ANTIGUO BARATILLO',
    telefono: '(0412) 128-5444',
    email: 'lapazliceo@gmail.com'
  });

  const [momentos, setMomentos] = useState([
    { id: 1, nombre: '1er Momento', inicio: '', fin: '', estado: 'pendiente' },
    { id: 2, nombre: '2do Momento', inicio: '', fin: '', estado: 'pendiente' },
    { id: 3, nombre: '3er Momento', inicio: '', fin: '', estado: 'pendiente' },
  ]);

  const [periodos, setPeriodos] = useState([
    { id: 3, nombre: '2025-2026', activo: true },
    { id: 2, nombre: '2024-2025', activo: false },
    { id: 1, nombre: '2023-2024', activo: false },
  ]);
  const [selectedPeriodo, setSelectedPeriodo] = useState('2025-2026');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('siga_token');
        const res = await fetch(`${API_BASE_URL}/api/config`, { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        if (data.institucion) setInstData({
          nombre: data.institucion.nombre || '', codAdministrativo: data.institucion.cod_administrativo || '',
          codDea: data.institucion.cod_dea || '', cdcee: data.institucion.cdcee || '',
          municipio: data.institucion.municipio || '', nivel: data.institucion.nivel || '',
          direccion: data.institucion.direccion || '', telefono: data.institucion.telefono || '',
          email: data.institucion.email || ''
        });
        if (data.academica) {
          setMomentos([
            { id: 1, nombre: '1er Momento', inicio: data.academica.inicio_1 ? data.academica.inicio_1.split('T')[0] : '', fin: data.academica.fin_1 ? data.academica.fin_1.split('T')[0] : '', estado: data.academica.momento_1 },
            { id: 2, nombre: '2do Momento', inicio: data.academica.inicio_2 ? data.academica.inicio_2.split('T')[0] : '', fin: data.academica.fin_2 ? data.academica.fin_2.split('T')[0] : '', estado: data.academica.momento_2 },
            { id: 3, nombre: '3er Momento', inicio: data.academica.inicio_3 ? data.academica.inicio_3.split('T')[0] : '', fin: data.academica.fin_3 ? data.academica.fin_3.split('T')[0] : '', estado: data.academica.momento_3 },
          ]);
        }
        if (data.periodos) {
          setPeriodos(data.periodos);
          const activo = data.periodos.find((p: any) => p.activo === 1);
          if (activo) setSelectedPeriodo(activo.nombre);
        }
      } catch (err) { console.error(err); }
    };
    fetchConfig();
  }, []);

  const handleSaveInst = async () => {
    try {
      const token = localStorage.getItem('siga_token');
      const formData = new FormData();
      Object.entries(instData).forEach(([key, value]) => formData.append(key, value as string));
      if (logoFile) formData.append('logo', logoFile);
      const res = await fetch(`${API_BASE_URL}/api/config/institucion`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (res.ok) { alert(`✅ ${data.mensaje}`); setLogoFile(null); } 
      else { alert(`❌ Error: ${data.error}`); }
    } catch (err) { alert('❌ Error de conexión'); }
  };

  const handleToggleMomento = (id: number) => {
    setMomentos(prev => prev.map(m => {
      if (m.id === id) {
        const nuevoEstado = m.estado === 'pendiente' ? 'activo' : m.estado === 'activo' ? 'cerrado' : 'pendiente';
        return { ...m, estado: nuevoEstado };
      }
      return m;
    }));
  };

  const handleSaveAcademico = async () => {
    try {
      const token = localStorage.getItem('siga_token');
      const res = await fetch(`${API_BASE_URL}/api/config/academico`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ periodo_nombre: selectedPeriodo, momentos: momentos })
      });
      const data = await res.json();
      if (res.ok) alert(`✅ ${data.mensaje}`);
      else alert(`❌ Error: ${data.error}`);
    } catch (err) { alert('Error de conexión al guardar'); }
  };

  const handleEvaluationSecurity = async () => {
    const bloquear = confirm("¿Bloquear completamente el sistema de evaluación?");
    if (!bloquear) return;
    try {
      const token = localStorage.getItem('siga_token');
      await fetch(`${API_BASE_URL}/api/config/evaluacion`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ bloqueada: 1 }) });
      alert('🔒 Sistema BLOQUEADO.');
    } catch (err) { alert('Error'); }
  };
  
  const handleSincronizarUsuarios = async () => {
    if (!confirm("¿Crear usuarios automáticamente para todo el personal registrado?")) return;
    try {
      const token = localStorage.getItem('siga_token');
      const res = await fetch(`${API_BASE_URL}/api/usuarios/sincronizar`, { headers: { Authorization: `Bearer ${token}` }});
      const data = await res.json();
      alert(`✅ ${data.mensaje}`);
    } catch (err) { alert('Error al sincronizar'); }
  };

  const tabs = [
    { id: 'institucion', label: 'Institución', icon: School },
    { id: 'academico', label: 'Académico', icon: Calendar },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'sistema', label: 'Sistema', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-mono">
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(ROUTE_PATHS.DASHBOARD)} className="hover:text-blue-400 transition"><ChevronLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="font-black uppercase text-2xl tracking-tighter italic">Configuración del Sistema</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel de control institucional y académico</p>
          </div>
        </div>
        <Settings className="w-8 h-8 text-slate-500" />
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-[2rem] shadow-sm border-2 border-slate-100">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* PESTAÑA: INSTITUCIÓN */}
        {activeTab === 'institucion' && (
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border-2 border-slate-100 space-y-8">
            <div className="flex items-center justify-between border-b-2 border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><School className="w-6 h-6 text-blue-600" /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900">Datos Institucionales</h2>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap justify-end">
                <input type="file" id="logo-upload" accept="image/png, image/jpeg" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                <button onClick={() => document.getElementById('logo-upload')?.click()} className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2">
                  <Upload className="w-4 h-4" /> {logoFile ? '✅ Logo Listo' : 'Subir Logo'}
                </button>

                <input type="file" id="alumnos-upload" accept=".xls, .xlsx" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try {
                    const token = localStorage.getItem('siga_token'); if (!API_BASE_URL) { alert('❌ ERROR: API_BASE_URL no importada'); return; }
                    const formData = new FormData(); formData.append('archivo', file);
                    const res = await fetch(`${API_BASE_URL}/api/importar/alumnos`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
                    const data = await res.json();
                    if (res.ok) { alert(`✅ ${data.mensaje}\nNuevos: ${data.procesados}\nActualizados: ${data.actualizados}\nIgnorados: ${data.ignorados}`); } else { alert(`❌ Error: ${data.error}`); }
                  } catch (err) { alert('Error de conexión'); }
                }} />
                <button onClick={() => document.getElementById('alumnos-upload')?.click()} className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-teal-200 hover:bg-teal-100 transition flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Importar Alumnos
                </button>

                {/* 🚀 NUEVOS SELECTS PARA BOLETÍN */}
                <select value={importGrado} onChange={e => setImportGrado(e.target.value)} className="bg-amber-50 text-amber-800 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-amber-200 outline-none">
                  <option value="">Grado...</option>
                  <option value="16">1er Año</option>
                  <option value="17">2do Año</option>
                  <option value="18">3er Año</option>
                  <option value="19">4to Año</option>
                  <option value="20">5to Año</option>
                </select>

                <select value={importSeccion} onChange={e => setImportSeccion(e.target.value)} className="bg-amber-50 text-amber-800 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-amber-200 outline-none">
                  <option value="">Secc...</option>
                  {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <input type="file" id="boletin-upload" accept=".xls, .xlsx" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  
                  // Validación crucial
                  if (!importGrado || !importSeccion) {
                    alert('⚠️ Debe seleccionar el Grado y la Sección antes de importar el boletín.');
                    e.target.value = ''; // Limpiar el input
                    return;
                  }

                  try {
                    const token = localStorage.getItem('siga_token'); if (!API_BASE_URL) { alert('❌ ERROR: API_BASE_URL no importada'); return; }
                    const formData = new FormData(); formData.append('archivo', file);
                    
                    // 🚀 LLAMADA MODIFICADA CON QUERY PARAMS
                    const res = await fetch(`${API_BASE_URL}/api/importar/boletin?grado_id=${importGrado}&seccion=${importSeccion}`, { 
                      method: 'POST', 
                      headers: { Authorization: `Bearer ${token}` }, 
                      body: formData 
                    });
                    const data = await res.json();
                    if (res.ok) { 
                      alert(`✅ ${data.mensaje}\nProcesados: ${data.procesados}\nNo encontrados (faltan en BD): ${data.noEncontrados}\nIgnorados: ${data.ignorados}`); 
                    } else { 
                      alert(`❌ Error backend: ${data.error}`); 
                    }
                  } catch (err) { console.error("❌ ERROR DE RED:", err); alert('Error de conexión.'); }
                }} />
                <button onClick={() => document.getElementById('boletin-upload')?.click()} className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-amber-200 hover:bg-amber-100 transition flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Importar Boletín
                </button>
              </div>
            </div>            
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Nombre de la Institución', key: 'nombre' }, { label: 'Código Administrativo', key: 'codAdministrativo' },
                { label: 'Código DEA', key: 'codDea' }, { label: 'CDCEE (Zona Educativa)', key: 'cdcee' },
                { label: 'Municipio', key: 'municipio' }, { label: 'Nivel Educativo', key: 'nivel' }, { label: 'Teléfono', key: 'telefono' }
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">{field.label}</label>
                  <input type="text" value={instData[field.key as keyof typeof instData]} onChange={e => setInstData({...instData, [field.key]: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Dirección</label>
              <input type="text" value={instData.direccion} onChange={e => setInstData({...instData, direccion: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition" />
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleSaveInst} className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-lg gap-2 flex items-center">
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: ACADÉMICO */}
        {activeTab === 'academico' && (
          <div className="space-y-8">
            <div className="bg-blue-50 border-2 border-blue-100 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><Calendar className="w-6 h-6 text-white" /></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic text-blue-900">Periodo Escolar Activo</h2>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Cambia el contexto del sistema</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Actualmente trabajando en:</p>
                  <p className="text-5xl font-black uppercase tracking-tighter italic text-blue-900 leading-none">{selectedPeriodo.replace('-', ' — ')}</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                  <select value={selectedPeriodo} onChange={(e) => setSelectedPeriodo(e.target.value)} className="w-full md:w-[180px] rounded-xl border-2 border-blue-200 bg-white px-3 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition">
                    {periodos.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input type="text" placeholder="Ej: 2026-2027" className="w-full md:w-[140px] rounded-xl border-2 border-slate-200 px-3 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition" />
                    <button onClick={async () => { const input = document.querySelector('input[placeholder="Ej: 2026-2027"]') as HTMLInputElement; const nuevoPeriodo = input?.value; if (!nuevoPeriodo || nuevoPeriodo.length < 9) return alert('Formato inválido'); try { const token = localStorage.getItem('siga_token'); const res = await fetch(`${API_BASE_URL}/api/config/periodos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ nombre: nuevoPeriodo }) }); const data = await res.json(); alert(`✅ ${data.mensaje}`); } catch (err) { alert('Error'); } }} className="bg-emerald-600 text-white rounded-2xl px-4 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg gap-2 flex items-center whitespace-nowrap">
                      <Plus className="w-4 h-4" /> Crear
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 flex items-start gap-3 mt-6">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-bold text-amber-700 leading-relaxed"><span className="font-black uppercase">Atención:</span> Al cambiar el periodo, el sistema procesará notas y planillas exclusivamente del año seleccionado.</p>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 shadow-sm border-2 border-slate-100 space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-slate-50 pb-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center"><Calendar className="w-6 h-6 text-emerald-600" /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900">Control de Momentos</h2>
              </div>
              <div className="space-y-4">
                {momentos.map(m => {
                  const today = new Date(); today.setHours(0,0,0,0);
                  const finDate = m.fin ? new Date(m.fin + 'T00:00:00') : null;
                  const isOverdue = m.estado === 'activo' && finDate && today > finDate;
                  return (
                    <div key={m.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-[1.5rem] border-2 border-slate-50 hover:bg-slate-50/50 transition-all gap-4">
                      <div className="flex items-start gap-4 w-full md:w-auto">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${m.estado === 'activo' ? 'bg-emerald-500 animate-pulse' : m.estado === 'cerrado' ? 'bg-slate-300' : 'bg-amber-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-black text-slate-900 uppercase text-xs tracking-tight italic">{m.nombre}</p>
                            {isOverdue && ( <span className="text-[8px] font-black uppercase bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-200 animate-pulse">⚠️ Fecha Vencida</span> )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input type="date" value={m.inicio || ''} onChange={(e) => { const n = momentos.map(mo => mo.id === m.id ? { ...mo, inicio: e.target.value } : mo); setMomentos(n); }} className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-blue-500" />
                            <span className="text-slate-400 font-black">→</span>
                            <input type="date" value={m.fin || ''} onChange={(e) => { const n = momentos.map(mo => mo.id === m.id ? { ...mo, fin: e.target.value } : mo); setMomentos(n); }} className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 ${m.estado === 'activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : m.estado === 'cerrado' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{m.estado}</span>
                        {m.estado !== 'cerrado' && (
                          <button onClick={() => handleToggleMomento(m.id)} className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 transition ${m.estado === 'activo' ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'}`}>
                            {m.estado === 'activo' ? 'Cerrar Momento' : 'Abrir Momento'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-8 shadow-sm border-2 border-slate-100 space-y-6">
              <div className="flex items-center gap-4 border-b-2 border-slate-50 pb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center"><Shield className="w-6 h-6 text-rose-600" /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900">Sistema de Evaluación</h2>
              </div>
              <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Lock className="w-6 h-6 text-rose-600" /></div>
                  <div>
                    <p className="font-black text-rose-900 uppercase text-xs tracking-tight">Seguridad de Calificaciones</p>
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Bloqueo global del sistema</p>
                  </div>
                </div>
                <button onClick={handleEvaluationSecurity} className="bg-rose-600 text-white rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition shadow-lg">
                  <Lock className="w-4 h-4 inline mr-2" /> Bloquear Todo
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button onClick={handleSaveAcademico} className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-lg gap-2 flex items-center">
                <Save className="w-4 h-4" /> Guardar Ajustes Académicos
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border-2 border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div>
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900">Gestión de Usuarios</h2>
              </div>
              <button onClick={handleSincronizarUsuarios} className="bg-purple-600 text-white rounded-2xl px-4 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition gap-2 flex items-center">
                <Plus className="w-3.5 h-3.5" /> Sincronizar Personal
              </button>
            </div>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="font-black uppercase text-sm text-slate-500 tracking-tight italic">Presione "Sincronizar Personal"</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Esto creará usuarios automáticamente basados en la tabla de personal de la BD.</p>
            </div>
          </div>
        )}

        {/* PESTAÑA: SISTEMA */}
        {activeTab === 'sistema' && (
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border-2 border-slate-100 space-y-6">
            <div className="flex items-center gap-4 border-b-2 border-slate-50 pb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center"><Settings className="w-6 h-6 text-slate-600" /></div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900">Parámetros Adicionales</h2>
            </div>
            {[
              { label: 'Notificaciones por Correo', desc: 'Enviar alertas al director', activo: true },
              { label: 'Portal de Representantes', desc: 'Acceso restringido para consulta', activo: false },
              { label: 'Generación de Boletines', desc: 'Habilitar descarga masiva', activo: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-5 rounded-3xl border-2 border-slate-50 hover:bg-slate-50/50 transition-all">
                <div>
                  <p className="text-xs font-black uppercase text-slate-900 tracking-tight italic">{item.label}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.activo} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <button onClick={() => alert('✅ Ajustes del sistema actualizados')} className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-lg">
                Guardar Parámetros
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
