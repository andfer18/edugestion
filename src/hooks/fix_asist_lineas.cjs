const fs = require('fs');
const fp = '/home/andres/Descargas/edugestionV1/src/pages/Asistencia.tsx';
let lines = fs.readFileSync(fp, 'utf8').split('\n');

// 1. Insertar gradosUnicos ANTES de "const materiasEnSeccion" (línea 48)
let idxMateria = lines.findIndex(l => l.includes('const materiasEnSeccion'));
if (idxMateria !== -1) {
    lines.splice(idxMateria, 0,
        "  const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];",
        "  const handleGradoChange = (g: string) => { setActiveGrade(g); setActiveSection(null); setSearch(''); };"
    );
}

// 2. Agregar inicialización DESPUÉS de "setAsignaciones(formateadas);" (línea 64)
let idxSet = lines.findIndex(l => l.includes('setAsignaciones(formateadas);'));
if (idxSet !== -1) {
    lines.splice(idxSet + 1, 0, "        if (formateadas.length > 0 && formateadas[0].grado) setActiveGrade(formateadas[0].grado);");
}

// 3. Insertar botones ANTES de "Grado / Materia" (línea 246)
let idxUI = lines.findIndex(l => l.includes('Grado / Materia'));
if (idxUI !== -1) {
    lines.splice(idxUI, 0,
        "      {gradosUnicos.length > 1 && (",
        "        <div className=\"mb-6\">",
        "          <p className=\"text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2\">Seleccionar Grado / Año:</p>",
        "          <div className=\"flex flex-wrap gap-2\">",
        "            {gradosUnicos.map(g => (",
        "              <button key={g} onClick={() => handleGradoChange(g)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${activeGrade === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>{g}</button>",
        "            ))}",
        "          </div>",
        "        </div>",
        "      )}"
    );
}

fs.writeFileSync(fp, lines.join('\n'), 'utf8');
console.log('EXITO: Asistencia.tsx modificada por líneas.');
