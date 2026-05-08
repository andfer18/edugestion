const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, 'useAuth.ts');
let content = fs.readFileSync(authPath, 'utf8');

const oldRolElegido = `const rolElegido = {
                codigo: rol.codigo || data.rol?.codigo || (rol.nombre || '').toLowerCase(),
                nombre: rol.nombre || data.rol?.nombre || '',
                etiqueta: rol.etiqueta || data.rol?.etiqueta || '',
                icono: rol.icono || data.rol?.icono || '',
                color: rol.color || data.rol?.color || '',
                ruta: data.rol?.ruta || '/'
            };`;

const newRolElegido = `const rolElegido = {
                codigo: rol.codigo || data.rol?.codigo || (rol.nombre || '').toLowerCase(),
                nombre: rol.nombre || data.rol?.nombre || '',
                etiqueta: rol.etiqueta || data.rol?.etiqueta || '',
                icono: rol.icono || data.rol?.icono || '',
                color: rol.color || data.rol?.color || '',
                ruta: data.rol?.ruta || '/',
                grado_elegido: rol.grado_elegido || data.rol?.grado_elegido || null,
                materia_elegida: rol.materia_elegida || data.rol?.materia_elegida || null
            };`;

if (content.includes(oldRolElegido)) {
    content = content.replace(oldRolElegido, newRolElegido);
    fs.writeFileSync(authPath, content, 'utf8');
    console.log('EXITO: Frontend actualizado correctamente.');
} else {
    console.error('ERROR: No se encontró el bloque original en useAuth.ts.');
    process.exit(1);
}
