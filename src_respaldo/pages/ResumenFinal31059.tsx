import { motion } from 'framer-motion';
import { Printer, ChevronLeft, Download, FileSpreadsheet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import { estudiantes, materias, notas } from '@/data/index';
import { generateExcel31059 } from '@/lib/excelGenerator';

export default function ResumenFinal31059() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  const añoSeleccionado = params.get('año') || '1er Año';
  const tipoSeleccionado = params.get('tipo') || 'CI';
  
  // Filtrar estudiantes según selección
  const materiasAño = materias.filter(m => m.gradoId === añoSeleccionado);
  const estudiantesFiltrados = estudiantes.filter(e => 
    e.grado === añoSeleccionado && 
    e.seccion === 'A' && 
    (tipoSeleccionado === 'CE' ? e.cedula.length > 9 : e.cedula.length <= 9)
  );

  // Función para descargar Excel REAL usando la plantilla original
  const descargarExcelOriginal = async () => {
    await generateExcel31059({ año: añoSeleccionado, tipo: tipoSeleccionado });
  };

  return (
    <div className="min-h-screen bg-slate-500 p-0 md:p-10 font-mono antialiased print:bg-white print:p-0">
      
      {/* ── BARRA DE ACCIONES ── */}
      <div className="max-w-[1400px] mx-auto mb-6 flex justify-between items-center bg-slate-900 p-4 rounded-2xl shadow-2xl print:hidden">
        <button 
          onClick={() => navigate(ROUTE_PATHS.REPORTES_MINISTERIO)}
          className="flex items-center gap-2 text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest transition"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <div className="flex gap-3">
          <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center mr-4">
            Formato 31059 — {añoSeleccionado} ({tipoSeleccionado})
          </p>
          <button 
            onClick={descargarExcelOriginal}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Descargar Excel Original
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition shadow-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* ── CONTENEDOR PLANILLA (Hoja Oficio) ── */}
      <div className="bg-white mx-auto shadow-2xl overflow-hidden print:shadow-none" 
           style={{ width: '355mm', minHeight: '215mm', padding: '15mm' }}>
        
        {/* ENCABEZADO OFICIAL */}
        <div className="text-center mb-6">
          <h1 className="text-sm font-black uppercase leading-tight">República Bolivariana de Venezuela</h1>
          <h2 className="text-xs font-black uppercase leading-tight">Ministerio del Poder Popular para la Educación</h2>
          <h3 className="text-base font-black uppercase mt-2 tracking-tighter italic">Resumen Final de Rendimiento Estudiantil</h3>
          <p className="text-[10px] font-bold uppercase mt-1 italic">Educación Media General — Código de Formato: 31059</p>
        </div>

        {/* DATOS DEL PLANTEL */}
        <div className="grid grid-cols-3 border-2 border-black text-[9px] font-black uppercase mb-4">
          <div className="border-r-2 border-black p-2">Plantel: COMPLEJO EDUCATIVO LA PAZ</div>
          <div className="border-r-2 border-black p-2">Código: 000000</div>
          <div className="p-2">Año Escolar: 2024 — 2025</div>
          <div className="border-t-2 border-r-2 border-black p-2">Grado/Año: {añoSeleccionado.toUpperCase()}</div>
          <div className="border-t-2 border-r-2 border-black p-2">Sección: "A"</div>
          <div className="border-t-2 border-black p-2">Municipio: Jesús Enrique Lossada</div>
        </div>

        {/* TABLA TÉCNICA */}
        <div className="border-2 border-black overflow-hidden">
          <table className="w-full border-collapse text-[8px] font-black uppercase">
            <thead>
              <tr className="bg-slate-50">
                <th className="border-r-2 border-b-2 border-black w-8 p-1">Nº</th>
                <th className="border-r-2 border-b-2 border-black w-32 p-1">{tipoSeleccionado === 'CI' ? 'Cédula de Identidad' : 'Cédula Escolar'}</th>
                <th className="border-r-2 border-b-2 border-black p-1 text-left px-4">Apellidos y Nombres</th>
                {/* Columnas de Materias */}
                {materiasAño.map(m => (
                  <th key={m.id} className="border-r-2 border-b-2 border-black w-10 p-0 text-[7px] leading-none vertical-text h-24">
                    <div className="rotate-180" style={{ writingMode: 'vertical-rl' }}>{m.nombre}</div>
                  </th>
                ))}
                {Array.from({ length: 14 - materiasAño.length }).map((_, i) => (
                  <th key={i} className="border-r-2 border-b-2 border-black w-10"></th>
                ))}
                <th className="border-b-2 border-black w-12 p-1">Prom.</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-10 text-center text-slate-400 italic">No hay estudiantes con {tipoSeleccionado} en este grado</td>
                </tr>
              ) : estudiantesFiltrados.map((est, idx) => {
                const notasEst = notas.filter(n => n.estudianteId === est.id);
                const promedio = notasEst.length ? (notasEst.reduce((s,n) => s + n.definitiva, 0) / notasEst.length).toFixed(2) : '-';
                return (
                  <tr key={est.id} className="h-7">
                    <td className="border-r-2 border-b border-black text-center">{idx + 1}</td>
                    <td className="border-r-2 border-b border-black text-center font-mono text-[9px]">{est.cedula}</td>
                    <td className="border-r-2 border-b border-black text-left px-4 text-[8px]">{est.apellido}, {est.nombre}</td>
                    {materiasAño.map(m => {
                      const nota = notasEst.find(n => n.materiaId === m.id)?.definitiva;
                      return (
                        <td key={m.id} className={`border-r-2 border-b border-black text-center text-[9px] font-mono ${nota && nota < 10 ? 'text-red-600 bg-red-50' : ''}`}>
                          {nota || ''}
                        </td>
                      );
                    })}
                    {Array.from({ length: 14 - materiasAño.length }).map((_, i) => (
                      <td key={i} className="border-r-2 border-b border-black"></td>
                    ))}
                    <td className="border-b border-black text-center font-bold bg-slate-50">{promedio}</td>
                  </tr>
                );
              })}
              {/* Rellenar filas vacías */}
              {Array.from({ length: 20 - estudiantesFiltrados.length }).map((_, i) => (
                <tr key={i} className="h-7">
                  <td className="border-r-2 border-b border-black text-center text-slate-200">{estudiantesFiltrados.length + i + 1}</td>
                  <td className="border-r-2 border-b border-black"></td>
                  <td className="border-r-2 border-b border-black"></td>
                  {Array.from({ length: 15 }).map((_, j) => (
                    <td key={j} className="border-r-2 border-b border-black last:border-r-0"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PIE DE PÁGINA */}
        <div className="mt-10 grid grid-cols-3 gap-10">
          <div className="text-center space-y-1">
            <div className="border-b-2 border-black h-10"></div>
            <p className="text-[8px] font-black uppercase tracking-widest">Director(a)</p>
          </div>
          <div className="text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl py-2">
            <p className="text-[7px] font-black uppercase text-slate-300 tracking-widest">Sello del Plantel</p>
          </div>
          <div className="text-center space-y-1">
            <div className="border-b-2 border-black h-10"></div>
            <p className="text-[8px] font-black uppercase tracking-widest">Control de Estudios</p>
          </div>
        </div>

      </div>
    </div>
  );
}
