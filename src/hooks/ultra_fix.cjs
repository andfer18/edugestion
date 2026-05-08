const fs = require('fs');

function fixFile(fp, type) {
    let lines = fs.readFileSync(fp, 'utf8').split('\n');
    
    // 1. BORRAR todos los bloques de botones UI viejos (10 líneas cada uno)
    let clean = false;
    while(!clean) {
        let i = lines.findIndex(l => l.includes('{gradosUnicos.length > 1') || l.includes('{gradosUnicos && gradosUnicos.length > 1'));
        if(i!==-1) lines.splice(i, 10); else clean = true;
    }
    
    // 2. BORRAR todas las variables gradosUnicos viejas (2 líneas cada una)
    clean = false;
    while(!clean) {
        let i = lines.findIndex(l => l.includes('const gradosUnicos = ['));
        if(i!==-1) lines.splice(i, 2); else clean = true;
    }
    
    // 3. BORRAR todas las inicializaciones viejas
    if (type === 'asistencia') {
        clean = false;
        while(!clean) {
            let i = lines.findIndex(l => l.includes('if (formateadas.length > 0 && formateadas[0].grado) setActiveGrade'));
            if(i!==-1) lines.splice(i, 1); else clean = true;
        }
    } else {
        clean = false;
        while(!clean) {
            let i = lines.findIndex(l => l.includes('if (formateadas.length > 0 && formateadas[0].grado) setGrado'));
            if(i!==-1) lines.splice(i, 1); else clean = true;
        }
    }

    // --- INYECCIÓN LIMPIA Y ÚNICA ---
    let idxMat = lines.findIndex(l => l.includes('const materiasEnSeccion'));
    if(idxMat!==-1) {
        if (type === 'asistencia') {
            lines.splice(idxMat, 0,
                "  const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];",
                "  const handleGradoChange = (g: string) => { setActiveGrade(g); setActiveSection(null); setSearch(''); };"
            );
        } else {
            lines.splice(idxMat, 0,
                "  const gradosUnicos = [...new Set(asignaciones.filter(a => a.grado).map(a => a.grado))];",
                "  const handleGradoChange = (g: string) => { setGrado(g); setSeccion(null); };"
            );
        }
    }

    let idxSet = lines.findIndex(l => l.includes('setAsignaciones(formateadas);'));
    if(idxSet!==-1) {
        if (type === 'asistencia') {
            lines.splice(idxSet + 1, 0, "        if (formateadas.length > 0 && formateadas[0].grado) setActiveGrade(formateadas[0].grado);");
        } else {
            lines.splice(idxSet + 1, 0, "        if (formateadas.length > 0 && formateadas[0].grado) setGrado(formateadas[0].grado);");
        }
    }

    let searchText = type === 'asistencia' ? 'Grado / Materia' : 'Grado / Asignatura';
    let varCheck = type === 'asistencia' ? 'activeGrade === g' : 'grado === g';
    
    let idxUI = lines.findIndex(l => l.includes(searchText));
    if(idxUI!==-1) {
        lines.splice(idxUI, 0,
            "      {gradosUnicos && gradosUnicos.length > 1 && (",
            "        <div className=\"mb-6\">",
            "          <p className=\"text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 ml-2\">Seleccionar Grado / Año:</p>",
            "          <div className=\"flex flex-wrap gap-2\">",
            "            {gradosUnicos.map(g => (",
            "              <button key={g} onClick={() => handleGradoChange(g)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 $" + "{" + varCheck + " ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}" + ">{g}</button>",
            "            ))}",
            "          </div>",
            "        </div>",
            "      )}"
        );
    }

    fs.writeFileSync(fp, lines.join('\n'), 'utf8');
    console.log(`EXITO: ${type} limpiada y parcheada correctamente.`);
}

fixFile('/home/andres/Descargas/edugestionV1/src/pages/Asistencia.tsx', 'asistencia');
fixFile('/home/andres/Descargas/edugestionV1/src/pages/CargaNotas.tsx', 'notas');
