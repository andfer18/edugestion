import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, History, GraduationCap, Calendar, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { estudiantes } from '@/data/index';
import historicalGrades from '@/data/historical_grades_full.json';

export default function HistoricoEstudiantes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filteredStudents = estudiantes.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.apellido.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cedula.includes(searchTerm)
  );

  const studentHistory = selectedStudent 
    ? historicalGrades.filter((h: any) => h.cedula === selectedStudent.cedula)
    : [];

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
            placeholder="BUSCAR CI / NOMBRE..."
            className="pl-11 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-2xl w-64 outline-none focus:border-blue-500 font-black text-[10px] uppercase transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Estudiantes */}
        <div className="lg:col-span-4 space-y-4 h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {filteredStudents.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className={`w-full text-left p-5 rounded-3xl border-2 transition-all ${
                selectedStudent?.id === s.id ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-white bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest">CI: {s.cedula}</span>
                <GraduationCap className={`w-4 h-4 ${selectedStudent?.id === s.id ? 'text-blue-600' : 'text-slate-300'}`} />
              </div>
              <h3 className="font-black text-slate-900 uppercase text-[11px] leading-tight">{s.apellido}, {s.nombre}</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{s.grado} - {s.seccion}</p>
            </button>
          ))}
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
                  <p className="text-blue-600 font-black uppercase text-xs mt-1">{selectedStudent.nombre} {selectedStudent.apellido}</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition shadow-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Generar Certificada
                </button>
              </div>

              {studentHistory.length > 0 ? (
                <div className="space-y-10">
                  {studentHistory.reverse().map((year: any, idx: number) => (
                    <div key={idx} className="border-2 border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                      <div className="bg-slate-50 p-4 border-b-2 border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <History className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase text-sm leading-none">{year.grado}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Periodo: {year.periodo}</p>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Promovido</span>
                      </div>
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white border-b-2 border-slate-50">
                            <th className="px-6 py-3 font-black text-[9px] uppercase text-slate-400">Asignatura</th>
                            <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400 text-center">L1</th>
                            <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400 text-center">L2</th>
                            <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400 text-center">L3</th>
                            <th className="px-6 py-3 font-black text-[9px] uppercase text-slate-400 text-center bg-slate-50/50">Definitiva</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                          {year.notas.map((n: any, nIdx: number) => (
                            <tr key={nIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-3 font-black text-slate-700 text-[10px] uppercase">{n.materia}</td>
                              <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500">{n.l1}</td>
                              <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500">{n.l2}</td>
                              <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500">{n.l3}</td>
                              <td className={`px-6 py-3 text-center font-mono font-black text-[12px] bg-slate-50/30 ${parseInt(n.def) < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                                {n.def}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
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
