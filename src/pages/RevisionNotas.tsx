import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Save, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/lib/index';
import API_BASE_URL from '../apiConfig';

export default function RevisionNotas() {
  const navigate = useNavigate();
  const [gradoId, setGradoId] = useState('');
  const [seccion, setSeccion] = useState('');
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const buscarReprobados = async () => {
    if (!gradoId || !seccion) return alert('Seleccione Grado y Sección');
    setLoading(true);
    try {
      const token = localStorage.getItem('siga_token');
      const res = await fetch(`${API_BASE_URL}/api/ctrl-estudios/alumnos-revision?grado_id=${gradoId}&seccion=${seccion}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Añadimos un campo temporal para la nota de revisión en el estado local
      setAlumnos(data.map((a: any) => ({ ...a, nota_revision: '' })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotaChange = (index: number, value: string) => {
    const newAlumnos = [...alumnos];
    newAlumnos[index].nota_revision = value;
    setAlumnos(newAlumnos);
  };

  const guardarRevision = async () => {
    // Filtrar solo los que tienen nota de revisión ingresada
    const notasParaGuardar = alumnos
      .filter(a => a.nota_revision !== '')
      .map(a => ({
        estudiante_id: a.estudiante_id,
        materia_codigo: a.materia_codigo,
        nota_revision: parseFloat(a.nota_revision)
      }));

    if (notasParaGuardar.length === 0) return alert('No hay notas de revisión para guardar');

    setSaving(true);
    try {
      const token = localStorage.getItem('siga_token');
      const res = await fetch(`${API_BASE_URL}/api/ctrl-estudios/guardar-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notas: notasParaGuardar })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.mensaje}`);
        buscarReprobados(); // Refrescamos la tabla
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-mono">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(ROUTE_PATHS.DASHBOARD)} className="hover:text-blue-400 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-black uppercase text-2xl tracking-tighter italic">Proceso de Revisión (Julio)</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingreso de calificaciones especiales</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto bg-white rounded-[3rem] p-8 shadow-sm border-2 border-slate-100">
        <div className="flex gap-4 mb-8 items-end">
          <div className="flex-1">
            <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Grado</label>
            <select value={gradoId} onChange={e => setGradoId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition">
              <option value="">Seleccionar...</option>
              <option value="16">1er Año</option><option value="17">2do Año</option><option value="18">3er Año</option>
              <option value="19">4to Año</option><option value="20">5to Año</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Sección</label>
            <select value={seccion} onChange={e => setSeccion(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-blue-600 transition">
              <option value="">Seleccionar...</option>
              {['A', 'B', 'C', 'D', 'E', 'U'].map(s => <option key={s} value={s}>Sección {s}</option>)}
            </select>
          </div>
          <button onClick={buscarReprobados} disabled={loading} className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition shadow-xl disabled:opacity-50 flex items-center gap-2">
            <Search className="w-4 h-4" /> {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {alumnos.length > 0 && (
          <>
            <div className="bg-orange-50 p-5 rounded-[2rem] border-2 border-orange-100 mb-8 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-black uppercase text-sm text-orange-700 tracking-tight">Atención</h4>
		<p className="text-[11px] font-bold text-orange-600 mt-1">Solo ingrese notas para los alumnos que presentaron el examen de revisión. Si aprueban (&gt;= 9.50), su nota cambiará al sello (R).</p>
              </div>
            </div>

            <table className="w-full text-left mb-8">
              <thead>
                <tr className="border-b-4 border-slate-900">
                  <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400">Cédula</th>
                  <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400">Estudiante</th>
                  <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400">Materia</th>
                  <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400 text-center">Nota Original</th>
                  <th className="px-4 py-3 font-black text-[9px] uppercase text-slate-400 text-center">Nota Revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {alumnos.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{a.cedula}</td>
                    <td className="px-4 py-3 font-black text-slate-900 text-[11px] uppercase">{a.apellidos}, {a.nombres}</td>
                    <td className="px-4 py-3 font-bold text-blue-900 text-[11px]">{a.materia_codigo}</td>
                    <td className="px-4 py-3 text-center font-mono font-black text-red-600 text-[11px]">{a.nota_original}</td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0" 
                        max="20"
                        value={a.nota_revision}
                        onChange={(e) => handleNotaChange(i, e.target.value)}
                        className="w-20 text-center border-2 border-slate-200 rounded-xl px-2 py-1 font-mono font-black text-[11px] focus:outline-none focus:border-blue-600 transition"
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={guardarRevision} disabled={saving} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Notas de Revisión'}
            </button>
          </>
        )}

        {alumnos.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-300">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-black uppercase text-sm tracking-tighter italic">No hay alumnos en revisión para esta sección, o no se ha buscado ninguno.</p>
          </div>
        )}
      </div>
    </div>
  );
}
