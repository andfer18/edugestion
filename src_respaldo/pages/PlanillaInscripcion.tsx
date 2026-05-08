import { motion } from 'framer-motion';
import { Download, Printer, UserX, CheckCircle, FileText, Camera, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '@/components/Stats';

export default function PlanillaInscripcion() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-10 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* ── BOTONES DE ACCIÓN (Fuera de la planilla) ── */}
        <div className="flex justify-between items-center no-print">
          <PageHeader title="Previsualización de Planilla" subtitle="Formato oficial de Inscripción y Actuación Académica" />
          <div className="flex gap-3">
            <button className="siga-btn-dark flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
            <button className="siga-btn-primary flex items-center gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
        </div>

        {/* ── CONTENEDOR PLANILLA ── */}
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">
          
          {/* ENCABEZADO INSTITUCIONAL */}
          <div className="bg-slate-900 p-10 text-white relative overflow-hidden border-b-8 border-blue-600">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-3xl p-2 flex items-center justify-center shadow-2xl">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">República Bolivariana de Venezuela</h1>
                  <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.3em]">Ministerio del Poder Popular para la Educación</p>
                  <p className="text-white font-black uppercase text-sm mt-1 tracking-tight">Complejo Educativo La Paz — Parroquia José Ramón Yépez</p>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Año Escolar</p>
                <p className="text-3xl font-black italic tracking-tighter text-blue-500 leading-none">2024 — 2025</p>
              </div>
            </div>
            {/* Decoración blur */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="p-10 space-y-10">
            
            {/* TÍTULO Y FOTOS */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight">
                  Inscripción y Actuación Académica
                </h2>
                <p className="siga-label mt-2">Nivel: Educación Media General</p>
                <div className="mt-6 flex gap-4">
                  <div className="px-4 py-2 bg-slate-100 rounded-2xl border-2 border-slate-200">
                    <p className="siga-label">Nº Expediente</p>
                    <p className="font-black text-slate-900 text-lg">EP-2025-0487</p>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 rounded-2xl border-2 border-blue-100">
                    <p className="siga-label text-blue-600">ID SIGE</p>
                    <p className="font-black text-blue-900 text-lg">1029384756</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                {/* Espacio Foto Estudiante */}
                <div className="w-32 h-40 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 relative group overflow-hidden">
                  <Camera className="w-8 h-8 mb-2 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-center px-4">Foto Estudiante</span>
                  {/* Preview Placeholder */}
                  <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                {/* Espacio Foto Representante */}
                <div className="w-32 h-40 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 relative group overflow-hidden">
                  <Camera className="w-8 h-8 mb-2 group-hover:text-orange-500 transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-center px-4">Foto Representante</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: DATOS DEL ESTUDIANTE */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <span className="font-black text-xs">01</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Datos del Estudiante</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DataField label="Apellidos" value="CASTRO GUZMÁN" />
                <DataField label="Nombres" value="VALENTINA ISABEL" />
                <DataField label="Cédula / Código" value="V-32.567.890" isMono />
                <DataField label="Sexo" value="FEMENINO" />
                
                <DataField label="Fecha de Nacimiento" value="22 / 07 / 2009" />
                <DataField label="Lugar de Nacimiento" value="CARACAS" />
                <DataField label="Entidad Federal" value="DISTRITO CAPITAL" />
                <DataField label="Plantel de Procedencia" value="U.E. COLEGIO MADRE MATILDE" />
              </div>
              <div className="w-full">
                <DataField label="Dirección de Habitación" value="URB. EL PARAÍSO, CALLE LOS MANGOS, QTA. MI REFUGIO, Nº 14-B" />
              </div>
            </section>

            {/* SECCIÓN 2: DATOS DEL ENTORNO FAMILIAR */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <span className="font-black text-xs">02</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic">Padres y Representante</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Padre */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                  <p className="siga-label text-blue-700">Padre</p>
                  <DataField label="Nombre y Apellido" value="CARLOS CASTRO" />
                  <DataField label="C.I." value="V-11.223.344" isMono />
                  <DataField label="Ocupación" value="INGENIERO CIVIL" />
                  <DataField label="Lugar de Trabajo" value="CONSTRUCTORA CARACAS C.A." />
                  <DataField label="Teléfono" value="0412-1112233" isMono />
                </div>
                {/* Madre */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-4">
                  <p className="siga-label text-pink-600">Madre</p>
                  <DataField label="Nombre y Apellido" value="ELENA GUZMÁN" />
                  <DataField label="C.I." value="V-12.556.677" isMono />
                  <DataField label="Ocupación" value="DOCENTE" />
                  <DataField label="Lugar de Trabajo" value="U.E. NACIONAL CARACAS" />
                  <DataField label="Teléfono" value="0416-7788990" isMono />
                </div>
                {/* Representante Legal */}
                <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-200 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <ShieldCheck className="w-20 h-20 text-orange-600" />
                  </div>
                  <p className="siga-label text-orange-700 font-black">Representante Legal</p>
                  <DataField label="Nombre y Apellido" value="ELENA GUZMÁN" />
                  <DataField label="Parentesco" value="MADRE" />
                  <DataField label="C.I." value="V-12.556.677" isMono />
                  <DataField label="WhatsApp" value="0416-7788990" isMono />
                  <DataField label="Ocupación" value="DOCENTE" />
                </div>
              </div>
            </section>

            {/* SECCIÓN 3: CONTROL DE INSCRIPCIÓN Y DOCUMENTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2">
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <span className="font-black text-xs">03</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">Documentación</h3>
                </div>
                
                <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { l: 'Partida de Nacimiento', ok: true },
                    { l: 'Carta de Buena Conducta', ok: true },
                    { l: 'Certificado Cardiovascular', ok: false },
                    { l: 'Recibo Sociedad de Padres', ok: true },
                    { l: 'Fotos (4) Carnet', ok: true },
                    { l: 'Certificado de Notas', ok: true },
                    { l: 'Planilla de Zonificación', ok: true },
                    { l: 'Copia Cédula Estudiante', ok: true },
                    { l: 'Copia Cédula Representante', ok: true },
                    { l: 'Constancia SIGE', ok: true },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${doc.ok ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-100 border-slate-200 group-hover:border-red-400'}`}>
                        {doc.ok && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-tight ${doc.ok ? 'text-slate-900' : 'text-slate-400'}`}>
                        {doc.l}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b-4 border-slate-900 pb-2">
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <span className="font-black text-xs">04</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">Actuación Académica</h3>
                </div>
                <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        {['Grado','Año Escolar','Rep.','Mat. Pend.'].map(h => (
                          <th key={h} className="px-4 py-3 text-[8px] font-black uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { g: '1er Año', a: '2022-2023', r: 'NO', m: 'NO' },
                        { g: '2do Año', a: '2023-2024', r: 'NO', m: 'NO' },
                        { g: '3er Año', a: '2024-2025', r: 'NO', m: 'NO' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3 font-black text-slate-900 text-xs">{row.g}</td>
                          <td className="px-4 py-3 font-black text-slate-600 text-xs">{row.a}</td>
                          <td className="px-4 py-3 font-black text-slate-400 text-xs">{row.r}</td>
                          <td className="px-4 py-3 font-black text-slate-400 text-xs">{row.m}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* 🆕 SECCIÓN DE RETIRO (NUEVA) 🆕 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b-4 border-red-700 pb-2">
                <div className="w-8 h-8 bg-red-700 rounded-xl flex items-center justify-center text-white">
                  <UserX className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-700">Control de Retiro de Estudiante</h3>
              </div>
              
              <div className="bg-red-50/50 rounded-[2.5rem] p-8 border-2 border-red-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <DataField label="Fecha de Retiro" value="____ / ____ / 20____" />
                  <DataField label="Motivo del Retiro" value="CAMBIO DE RESIDENCIA / TRASLADO" />
                </div>
                <div className="space-y-4">
                  <DataField label="Docente / Directivo Autoriza" value="________________________________" />
                  <DataField label="Nº de Oficio de Traslado" value="________________________________" />
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-red-200 rounded-3xl p-4">
                  <div className="w-full h-24 border-b border-red-300 mt-4"></div>
                  <p className="siga-label text-red-400 mt-2">Firma del Representante</p>
                </div>
              </div>
            </section>

            {/* OBSERVACIONES Y FIRMAS FINALES */}
            <div className="space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <p className="siga-label mb-2">Observaciones Generales</p>
                <p className="text-sm text-slate-600 italic">
                  Estudiante regular con excelente conducta. Se consignan todos los documentos a excepción del certificado cardiovascular por motivos de cita médica pendiente para la próxima semana.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
                <div className="text-center space-y-2">
                  <div className="w-64 h-px bg-slate-300 mx-auto"></div>
                  <p className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Firma del Representante</p>
                  <p className="siga-label">C.I. V-12.556.677</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-64 h-px bg-slate-300 mx-auto"></div>
                  <p className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Docente Responsable</p>
                  <p className="siga-label">Firma y Sello</p>
                </div>
              </div>
            </div>

          </div>

          {/* FOOTER SIGA */}
          <div className="bg-slate-50 px-10 py-6 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">SIGA — Formato Digital v2.5</p>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Página 1 de 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataField({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="space-y-1 group">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600 transition-colors">
        {label}
      </p>
      <p className={`font-black text-slate-900 uppercase border-b-2 border-slate-100 py-1 ${isMono ? 'font-mono text-sm' : 'text-xs'}`}>
        {value || '________________________________'}
      </p>
    </div>
  );
}
