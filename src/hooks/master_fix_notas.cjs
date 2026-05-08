const fs = require('fs');
const fp = '/home/andres/Descargas/edugestionV1/src/pages/CargaNotas.tsx';

// 1. Restaurar archivo original limpio
fs.copyFileSync('/home/andres/Descargas/carganotas.txt', fp);
let lines = fs.readFileSync(fp, 'utf8').split('\n');

// 2. Agregar NOMBRES_GRADOS
let idxG = lines.findIndex(l => l.includes("const GRADOS_IDS: Record<string, number> = {"));
let idxEnd = lines.findIndex(l => l.trim() === '};', idxG);
if (idxEnd !== -1) {
    lines.splice(idxEnd + 1, 0,
        "", "const NOMBRES_GRADOS: Record<string, string> = {",
        "  '16': '1er Año', '17': '2do Año', '18': '3er Año', '19': '4to Año', '20': '5to Año',",
        "};"
    );
}

// 3. Traducir "19" a "4to Año"
let idxMap = lines.findIndex(l => l.includes("grado: a.grado?.trim() || ''"));
if (idxMap !== -1) {
    lines[idxMap] = "          grado: NOMBRES_GRADOS[String(a.grado)] || String(a.grado || ''),";
}

// 4. Agregar lógica de grados múltiples (OJO: CargaNotas usa setGrado, no setActiveGrade)
let idxMat = lines.findIndex(l => l.includes('const materiasEnSeccion'));
if (idxMat !== -1) {
    lines.splice(idxMat, 0,
        "  const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];",
        "  const handleGradoChange = (g: string) => { setGrado(g); setSeccion(null); };"
    );
}

// 5. Inicializar primer grado
let idxSet = lines.findIndex(l => l.includes('setAsignaciones(formateadas);'));
if (idxSet !== -1) {
    lines.splice(idxSet + 1, 0, "        if (formateadas.length > 0 && formateadas[0].grado) setGrado(formateadas[0].grado);");
}

// 6. Inyectar botones (OJO: usa la variable 'grado' en vez de 'activeGrade')
let idxUI = lines.findIndex(l => l.includes('Grado / Asignatura'));
if (idxUI !== -1) {
    lines.splice(idxUI, 0,
        "      {gradosUnicos && gradosUnicos.length > 1 && (",
        "        <div className=\"mb-6\">",
        "          <p className=\"text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2\">Seleccionar Grado / Año:</p>",
        "          <div className=\"flex flex-wrap gap-2\">",
        "            {gradosUnicos.map(g => (",
        "              <button key={g} onClick={() => handleGradoChange(g)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${grado === g ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>{g}</button>",
        "            ))}",
        "          </div>",
        "        </div>",
        "      )}"
    );
}

fs.writeFileSync(fp, lines.join('\n'), 'utf8');
console.log('EXITO: CargaNotas.tsx restaurada y parcheada limpiamente.');
