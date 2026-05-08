import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, ArrowRightLeft, FileCheck, Info } from 'lucide-react';
import { planesEstudio } from '@/data/planes';

export default function PlanesEstudio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(planesEstudio[0]);

  const filteredPlanes = planesEstudio.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigo.includes(searchTerm)
  );

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="siga-title text-4xl">Planes de Estudio</h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
            Gestión de mallas curriculares y reglas de conversión ministerial
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="BUSCAR PLAN O CÓDIGO..."
              className="pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl w-full md:w-64 outline-none focus:border-primary font-black text-[10px] uppercase transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Planes */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Planes Registrados
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredPlanes.map(plan => (
              <button
                key={plan.codigo}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full text-left p-5 rounded-3xl border-2 transition-all group ${
                  selectedPlan.codigo === plan.codigo 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="siga-badge-blue text-[9px]">{plan.codigo}</span>
                  <BookOpen className={`w-4 h-4 ${selectedPlan.codigo === plan.codigo ? 'text-primary' : 'text-slate-300'}`} />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-[11px] leading-tight mb-1">{plan.nombre}</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase">{plan.mencion}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del Plan y Conversión */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div 
            key={selectedPlan.codigo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 uppercase text-xl leading-none">{selectedPlan.nombre}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="siga-badge-blue">CÓDIGO: {selectedPlan.codigo}</span>
                    <span className="siga-badge-green">ACTIVO</span>
                  </div>
                </div>
              </div>
              <button className="siga-btn-primary flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" /> REGLAS DE CONVERSIÓN
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 uppercase text-xs flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-500" /> Malla Curricular
                </h3>
                <div className="border-2 border-slate-50 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b-2 border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-500">Año</th>
                        <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-500">Asignatura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-50">
                      {selectedPlan.asignaturas.map((asig, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-black text-[10px] text-slate-400">{asig.año}º</td>
                          <td className="px-4 py-3 font-black text-[10px] text-slate-700 uppercase">{asig.nombre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-100">
                  <h3 className="font-black text-blue-900 uppercase text-xs flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4" /> Información del Título
                  </h3>
                  <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">
                    Credencial a otorgar:
                  </p>
                  <p className="font-black text-blue-900 uppercase text-sm mt-1">
                    {selectedPlan.credential}
                  </p>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white">
                  <h3 className="font-black uppercase text-xs flex items-center gap-2 mb-4">
                    <ArrowRightLeft className="w-4 h-4 text-primary" /> Conversión Sugerida
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="font-black text-[9px] uppercase">Plan {selectedPlan.codigo}</span>
                      <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                      <span className="font-black text-[9px] uppercase">Plan 31059 (Actual)</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed italic">
                      * El sistema aplicará automáticamente las equivalencias según el Memorando del MPPE (17-11-2017).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
