import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, History, GraduationCap, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import API_BASE_URL from '../apiConfig'; // Asegúrate de que la ruta a tu apiConfig sea correcta

export default function HistoricoEstudiantes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [historialData, setHistorialData] = useState<any>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Función para buscar estudiantes en la BD
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 3) { 
      setSearchResults([]); 
      return; 
    }
    
    try {
      const token = localStorage.getItem('siga_token');
      const res = await fetch(`${API_BASE_URL}/api/estudiantes/search?q=${term}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Función al seleccionar un estudiante para ver su historial
  const selectStudent = async (student: any) => {
    setSelectedStudent(student);
    setHistorialData(null);
    setLoadingHistorial(true);
    try {
      const token = localStorage.getItem('siga_token');
      const res = await fetch(`${API_BASE_URL}/api/estudiantes/${student.id}/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistorialData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Agrupar el historial por Año Escolar y Grado para pintarlo en tarjetas
  const historialAgrupado = historialData?.historial?.reduce((acc: any, item: any) => {
    const key = `${item.periodo_id}-${item.grado_id}`;
    if (!acc[key]) {
      acc[key] = {
        periodo_id: item.periodo_id,
        grado_nombre: item.grado_nombre,
        materias: []
      };
    }
    acc[key].materias.push(item);
    return acc;
  }, {}) || {};

  const historialKeys = Object.keys(historialAgrupado);

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-mono">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(ROUTE_PATHS.DASHBOARD)} className="hover:text-blue-400 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-black uppercase text-2xl tracking-tighter italic">Histórico de Estudiantes</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consulta de expedientes y notas certificadas</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="BUSCAR CI / APELLIDO, NOMBRE..."
            className="pl-11 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl w-64 outline-none focus:border-blue-500 font-black text-[10px] uppercase transition-all"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Estudiantes (Buscador) */}
        <div className="lg:col-span-4 space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {searchResults.map(s => (
            <button
              key={s.id}
              onClick={() => selectStudent(s)}
              className={`w-full text-left p-5 rounded-3xl border-2 transition-all ${
                selectedStudent?.id === s.id ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-white bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest">CI: {s.cedula}</span>
                <GraduationCap className={`w-4 h-4 ${selectedStudent?.id === s.id ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>
              <h3 className="font-black text-slate-900 uppercase text-[11px] leading-tight">{s.apellidos}, {s.nombres}</h3>
            </button>
          ))}
          
          {searchTerm.length < 3 && (
            <div className="text-center py-10 text-slate-400 font-black uppercase text-[9px] tracking-widest">
              Escriba al menos 3 letras para buscar
            </div>
          )}
        </div>

        {/* Detalle Histórico */}
        <div className="lg:col-span-8">
          {selectedStudent ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm min-h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-black text-slate-900 uppercase text-2xl tracking-tighter italic">Expediente Académico</h2>
                  <p className="text-blue-600 font-black uppercase text-xs mt-1">{selectedStudent.apellidos}, {selectedStudent.nombres}</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Generar Certificada
                </button>
              </div>

              {/* ALERTA DE MATERIAS PENDIENTES */}
              {historialData?.materias_pendientes?.length > 0 && (
                <div className="bg-orange-50 p-5 rounded-[2rem] border-2 border-orange-100 mb-8 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-black uppercase text-sm text-orange-700 tracking-tight">Materias Pendientes Activas</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {historialData.materias_pendientes.map((mp: any, i: number) => (
                        <span key={i} className="bg-white px-3 py-1 rounded-xl text-[10px] font-black text-orange-700 border border-orange-200 shadow-sm">
                          {mp.materia_codigo} ({mp.grado_origen_nombre})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {loadingHistorial ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <History className="w-16 h-16 mb-4 animate-pulse" />
                  <p className="font-black uppercase text-sm tracking-tighter italic">Consultando base de datos...</p>
                </div>
              ) : historialKeys.length > 0 ? (
                <div className="space-y-10">
                  {historialKeys.map((key) => {
                    const group = historialAgrupado[key];
                    return (
                      <div key={key} className="border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="bg-slate-50 p-4 border-b-2 border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                              <History className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 uppercase text-sm leading-none">{group.grado_nombre}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Periodo: {group.periodo_id === 2 ? '2025-2026' : 'Anterior'}</p>
                            </div>
                          </div>
                        </div>
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-white border-b-2 border-slate-50">
                              <th className="px-6 py-3 font-black text-[9px] uppercase text-slate-400">Asignatura</th>
                              <th className="px-6 py-3 font-black text-[9px] uppercase text-slate-400 text-center bg-slate-50/50">Definitiva</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-slate-50">
                            {group.materias.map((mat: any, nIdx: number) => {
                              // LÓGICA DE COLORES (F, R, MP)
                              let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200'; 
                              let badgeText = '';
                              if (mat.tipo_aprobacion === 'F') {
                                badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                badgeText = 'F';
                              } else if (mat.tipo_aprobacion === 'R') {
                                badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                                badgeText = 'R';
                              } else if (mat.tipo_aprobacion === 'MP') {
                                badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
                                badgeText = 'MP';
                              } else if (parseFloat(mat.definitiva) < 9.5) {
                                badgeColor = 'bg-red-50 text-red-700 border-red-200';
                                badgeText = 'REP';
                              }

                              return (
                                <tr key={nIdx} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-3 font-black text-slate-700 text-[10px] uppercase">{mat.materia_codigo}</td>
                                  <td className="px-6 py-3 text-center bg-slate-50/30">
                                    <div className="flex items-center justify-center gap-2">
                                      <span className={`font-mono font-black text-[12px] ${parseFloat(mat.definitiva) < 9.5 ? 'text-red-600' : 'text-slate-900'}`}>
                                        {mat.definitiva || '---'}
                                      </span>
                                      {badgeText && (
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${badgeColor}`}>
                                          {badgeText}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <History className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-black uppercase text-sm tracking-tighter italic">No se encontraron antecedentes para este estudiante</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <History className="w-20 h-16 mb-6 text-slate-200" />
              <h2 className="font-black text-slate-300 uppercase text-xl tracking-tighter italic">Seleccione un estudiante de la nómina</h2>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 max-w-xs">Use el buscador lateral para filtrar por nombre o número de cédula</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
