import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { estudiantes, materias, notas, docentes } from '@/data/index';

interface GenerateParams {
  año: string;
  tipo: string;
}

export async function generateExcel31059({ año, tipo }: GenerateParams) {
  // 1. Determinar el archivo de plantilla correcto
  const añoNum = año.charAt(0); // '1', '2', '3', '4', '5'
  const fileName = `Plantilla_Resumen_Final_Rendimiento_Estudiantil_EMG_Código_31059_${añoNum}_${tipo}.xlsx`;
  const templateUrl = `/templates/${fileName}`;

  try {
    const response = await fetch(templateUrl);
    if (!response.ok) throw new Error(`No se pudo cargar la plantilla: ${fileName}`);
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) throw new Error("No se encontró la hoja en el archivo Excel");

    // 2. Datos de la institución (ESTRICTAMENTE SEGÚN CÓDIGO PHP)
    const periodo = "2024-2025";
    const hoy = new Date();
    
    worksheet.getCell('AO4').value = periodo;
    worksheet.getCell('AO5').value = 'FINAL';
    worksheet.getCell('BA5').value = `${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;
    
    worksheet.getCell('B7').value = 'S2382D2307';
    worksheet.getCell('AK7').value = 'Complejo Educativo "La Paz"';
    worksheet.getCell('B8').value = 'AV. Principal Sector San Benito La Paz';
    worksheet.getCell('BA8').value = '0412-1285444';
    worksheet.getCell('B9').value = 'Jesús Enrique Lossada';
    worksheet.getCell('AK9').value = 'Zulia';
    worksheet.getCell('BA9').value = ''; 
    worksheet.getCell('B10').value = 'YENNY GONALEZ';
    worksheet.getCell('BA10').value = 'V16298584';

    // 3. Filtrar estudiantes
    const estudiantesFiltrados = estudiantes.filter(e => 
      e.grado === año && 
      e.seccion === 'A' && 
      (tipo === 'CE' ? e.cedula.length > 9 : e.cedula.length <= 9)
    );

    const materiasAño = materias.filter(m => m.gradoId === año);

    // 4. Escribir estudiantes (Fila 18 en adelante - ESTRICTO)
    let filaEstudiante = 18;
    estudiantesFiltrados.forEach((est, index) => {
      const fila = filaEstudiante + index;
      if (fila > 52) return; 

      worksheet.getCell(`A${fila}`).value = (index + 1).toString().padStart(2, '0');
      worksheet.getCell(`B${fila}`).value = tipo === 'CI' ? `V-${est.cedula}` : est.cedula;
      worksheet.getCell(`N${fila}`).value = est.apellido;
      worksheet.getCell(`U${fila}`).value = est.nombre;
      worksheet.getCell(`AE${fila}`).value = 'CARACAS'; 
      worksheet.getCell(`AM${fila}`).value = '24'; 
      worksheet.getCell(`AN${fila}`).value = est.genero === 'M' ? 'MASCULINO' : 'FEMENINO';
      
      const fecha = new Date(est.fechaNacimiento);
      worksheet.getCell(`BD${fila}`).value = fecha.getDate().toString().padStart(2, '0');
      worksheet.getCell(`BF${fila}`).value = (fecha.getMonth() + 1).toString().padStart(2, '0');
      worksheet.getCell(`BH${fila}`).value = fecha.getFullYear().toString();

      // Notas (BN, BP, BR, BT, BV, BX, BZ, CB, CD)
      const notasEst = notas.filter(n => n.estudianteId === est.id);
      const celdasNotas = ['BN', 'BP', 'BR', 'BT', 'BV', 'BX', 'BZ', 'CB', 'CD'];
      
      materiasAño.forEach((m, mIdx) => {
        if (mIdx < celdasNotas.length) {
          const nota = notasEst.find(n => n.materiaId === m.id)?.definitiva;
          worksheet.getCell(`${celdasNotas[mIdx]}${fila}`).value = nota || '';
        }
      });

      worksheet.getCell(`CF${fila}`).value = 'A'; 
    });

    // 5. Totales
    worksheet.getCell('X58').value = estudiantesFiltrados.length;
    worksheet.getCell('X59').value = 0; 
    worksheet.getCell('X60').value = estudiantesFiltrados.filter(e => {
        const n = notas.filter(nt => nt.estudianteId === e.id);
        return n.every(nt => nt.definitiva >= 10);
    }).length;
    worksheet.getCell('X61').value = estudiantesFiltrados.length - (Number(worksheet.getCell('X60').value));
    worksheet.getCell('X62').value = 0;

    // 6. Profesores (Fila 64)
    const docentesActivos = docentes.slice(0, 9);
    docentesActivos.forEach((doc, idx) => {
      const fila = 64 + idx;
      worksheet.getCell(`A${fila}`).value = (idx + 1).toString();
      worksheet.getCell(`B${fila}`).value = `MAT-0${idx+1}`; 
      worksheet.getCell(`T${fila}`).value = `${doc.apellido}, ${doc.nombre}`;
      worksheet.getCell(`AN${fila}`).value = `V-${doc.cedula}`;
    });

    // 7. Datos del curso
    worksheet.getCell('BA70').value = año.toUpperCase();
    worksheet.getCell('BA71').value = 'A';
    worksheet.getCell('BA72').value = estudiantesFiltrados.length;

    // 8. Fecha de remisión
    worksheet.getCell('B76').value = hoy.toLocaleDateString('es-VE');

    // 9. Exportar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Resumen_Final_31059_${año.replace(' ','_')}_${tipo}_Oficial.xlsx`);

  } catch (error) {
    console.error("Error al generar Excel:", error);
    alert("Error: Asegúrese de que todas las plantillas originales estén en /public/templates/");
  }
}
