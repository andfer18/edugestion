const fs = require('fs');
const fp = '/home/andres/Descargas/edugestionV1/src/pages/CargaNotas.tsx';
let c = fs.readFileSync(fp, 'utf8');
let ok = 0;

// 1. Agregar variables de grado múltiple antes de "const materiasEnSeccion"
if (!c.includes('gradosUnicos')) {
    c = c.replace(
        'const materiasEnSeccion = asignaciones.filter',
        `const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];
  const handleGradoChange = (g: string) => { setGrado(g); setSeccion(null); };
  const materiasEnSeccion = asignaciones.filter`
    );
    ok++;
}

// 2. Inyectar botones antes de "Grado / Asignatura"
if (!c.includes('Seleccionar Grado / Año:')) {
    const botones = `      {gradosUnicos.length > 1 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2">Seleccionar Grado / Año:</p>
          <div className="flex flex-wrap gap-2">
            {gradosUnicos.map(g => (
              <button key={g} onClick={() => handleGradoChange(g)} className={\`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 \${grado === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}\`}>{g}</button>
            ))}
          </div>
        </div>
      )}
`;
    c = c.replace(
        '      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Grado / Asignatura</p>',
        botones + '      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Grado / Asignatura</p>'
    );
    ok++;
}

fs.writeFileSync(fp, c, 'utf8');
console.log(ok === 2 ? 'EXITO: CargaNotas.tsx (2/2 cambios)' : `PARCIAL: CargaNotas.tsx (${ok}/2 cambios)`);
