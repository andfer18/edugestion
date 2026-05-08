import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, ShieldCheck, Briefcase, UserRound, GraduationCap, Hammer, Building2 } from 'lucide-react';
import { docentes, personalGeneral } from '@/data/index';

export default function NominaPersonal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');

  const allStaff = [
    ...docentes.map(d => ({ ...d, tipo: 'docente' as const, nombre_completo: `${d.apellido}, ${d.nombre}` })),
    ...personalGeneral.map(p => ({ ...p, nombre_completo: `${p.apellido}, ${p.nombre}` }))
  ];

  const filteredStaff = allStaff.filter(s => {
    const matchesSearch = s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || s.cedula.includes(searchTerm);
    const matchesFilter = filterType === 'todos' || s.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: allStaff.length,
    docentes: allStaff.filter(s => s.tipo === 'docente').length,
    admin: allStaff.filter(s => s.tipo === 'administrativo').length,
    obrero: allStaff.filter(s => s.tipo === 'obrero').length,
  };

  return (
    <div className="space-y-8 p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="siga-title text-4xl">Nómina Institucional</h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
            Gestión de Personal Docente, Administrativo y Obrero
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="BUSCAR POR NOMBRE O CÉDULA..."
              className="pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl w-full md:w-64 outline-none focus:border-primary font-black text-[10px] uppercase transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Personal', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Docentes', value: stats.docentes, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Administrativos', value: stats.admin, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Obreros', value: stats.obrero, icon: Hammer, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b-2 border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex gap-2">
            {['todos', 'docente', 'administrativo', 'obrero'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                  filterType === t 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase">
            Mostrando {filteredStaff.length} resultados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                <th className="px-6 py-4 font-black text-[10px] uppercase text-slate-500 tracking-widest">Cédula</th>
                <th className="px-6 py-4 font-black text-[10px] uppercase text-slate-500 tracking-widest">Apellidos y Nombres</th>
                <th className="px-6 py-4 font-black text-[10px] uppercase text-slate-500 tracking-widest">Cargo / Función</th>
                <th className="px-6 py-4 font-black text-[10px] uppercase text-slate-500 tracking-widest">Tipo</th>
                <th className="px-6 py-4 font-black text-[10px] uppercase text-slate-500 tracking-widest text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredStaff.map((person, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                      V-{person.cedula}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{person.nombre_completo}</span>
                      {person.tipo === 'docente' && (
                        <span className="text-[9px] font-bold text-blue-500 uppercase">
                          {(person as any).especialidad || 'DOCENTE'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 text-[10px] uppercase">
                        {(person as any).cargo || 'PERSONAL'}
                      </span>
                      {(person as any).area && (
                        <span className="text-[9px] font-black text-slate-400 uppercase italic">
                          Área: {(person as any).area}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`siga-badge-${
                      person.tipo === 'docente' ? 'blue' : (person.tipo === 'administrativo' ? 'orange' : 'slate')
                    }`}>
                      {person.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="siga-badge-green">ACTIVO</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
