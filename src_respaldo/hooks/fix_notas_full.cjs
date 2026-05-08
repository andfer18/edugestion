const fs = require('fs');
const filePath = '/home/andres/Descargas/edugestionV1/src/pages/CargaNotas.tsx';
let c = fs.readFileSync(filePath, 'utf8');
let cambios = 0;

// 1. Agregar lógica de grados múltiples (usando variables de CargaNotas: grado y setGrado)
if (!c.includes('gradosUnicos')) {
    c = c.replace(
        "const materiasEnSeccion = asignaciones.filter(a => a.grado === grado && a.seccion === seccion).map(a => a.materia);",
        `const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];
  const handleGradoChange = (g: string) => { setGrado(g); setSeccion(null); };
  const materiasEnSeccion = asignaciones.filter(a => a.grado === grado && a.seccion === seccion).map(a => a.materia);`
    );
    cambios++;
}

// 2. Inicializar primer grado automáticamente
if (!c.includes("if (formateadas.length > 0 && formateadas[0].grado) setGrado")) {
    c = c.replace(
        "setAsignaciones(formateadas);",
        "setAsignaciones(formateadas); if (formateadas.length > 0 && formateadas[0].grado) setGrado(formateadas[0].grado);"
    );
    cambios++;
}

// 3. Inyectar botones de grado (estilo Tailwind puro)
if (!c.includes("Seleccionar Grado / Año:")) {
    const botones = `
      {gradosUnicos.length > 1 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2">Seleccionar Grado / Año:</p>
          <div className="flex flex-wrap gap-2">
            {gradosUnicos.map(g => (
              <button key={g} onClick={() => handleGradoChange(g)} className={\`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 \${grado === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}\`}>{g}</button>
            ))}
          </div>
        </div>
      )}`;
    
    c = c.replace(
        "<p className=\"text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3\">Grado / Asignatura</p>",
        botones + "\n      <p className=\"text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3\">Grado / Asignatura</p>"
    );
    cambios++;
}

fs.writeFileSync(filePath, c, 'utf8');
console.log(cambios > 0 ? `EXITO: CargaNotas.tsx parcheada (${cambios} cambios).` : 'AVISO: Ya estaba parcheada.');
