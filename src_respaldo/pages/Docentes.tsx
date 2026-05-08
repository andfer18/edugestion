import { useState } from 'react';
import { Search, Plus, Edit, Phone, Mail, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, StatsCard } from '@/components/Stats';
import { docentes as docentesData, materias } from '@/data/index';
import { GraduationCap, BookOpen, UserCheck, UserX } from 'lucide-react';
import type { Docente } from '@/lib/index';

const CONTRATO_COLORS: Record<string, string> = {
  fijo: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  contratado: 'bg-primary/15 text-primary border-primary/30',
  suplente: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
};

export default function Docentes() {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selected, setSelected] = useState<Docente | null>(null);

  const filtered = docentesData.filter(d => {
    const matchSearch = search === '' ||
      `${d.nombre} ${d.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
      d.especialidad.toLowerCase().includes(search.toLowerCase()) ||
      d.cedula.includes(search);
    const matchEstado = filtroEstado === 'todos' || d.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const activos = docentesData.filter(d => d.estado === 'activo').length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader title="Gestión de Docentes" subtitle="Personal docente activo y registro de asignaciones">
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" />Nómina</Button>
        <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Nuevo Docente</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Docentes" value={docentesData.length} icon={GraduationCap} color="primary" index={0} />
        <StatsCard title="Activos" value={activos} icon={UserCheck} color="success" index={1} />
        <StatsCard title="Retirados/Jubilados" value={docentesData.length - activos} icon={UserX} color="destructive" index={2} />
        <StatsCard title="Materias Asignadas" value={materias.length} icon={BookOpen} color="accent" index={3} />
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por nombre, especialidad o cédula..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="retirado">Retirado</SelectItem>
                <SelectItem value="jubilado">Jubilado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{filtered.length} docente(s) encontrado(s)</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <Card key={doc.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {doc.nombre[0]}{doc.apellido[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{doc.apellido}, {doc.nombre}</p>
                  <p className="text-xs text-muted-foreground font-mono">V-{doc.cedula}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  doc.estado === 'activo' ? 'bg-chart-3/15 text-chart-3 border-chart-3/30' : 'bg-destructive/15 text-destructive border-destructive/30'
                }`}>{doc.estado}</span>
              </div>
              <div className="space-y-1.5 mb-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Especialidad:</span> {doc.especialidad}
                </p>
                <div className="flex flex-wrap gap-1">
                  {doc.materias.map(m => (
                    <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>
                  ))}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CONTRATO_COLORS[doc.tipoContrato]}`}>
                  {doc.tipoContrato.charAt(0).toUpperCase() + doc.tipoContrato.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-border">
                <Button variant="ghost" size="icon" className="h-7 w-7" title={doc.telefono}>
                  <Phone className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title={doc.email}>
                  <Mail className="w-3.5 h-3.5" />
                </Button>
                <div className="flex-1" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelected(doc)}>
                      Ver detalle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Ficha Docente</DialogTitle></DialogHeader>
                    {selected && <FichaDocente doc={selected} />}
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FichaDocente({ doc }: { doc: Docente }) {
  const docenteMaterias = materias.filter(m => m.docenteId === doc.id);
  return (
    <Tabs defaultValue="datos">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="datos">Datos Personales</TabsTrigger>
        <TabsTrigger value="asignacion">Asignación</TabsTrigger>
      </TabsList>
      <TabsContent value="datos" className="space-y-2 mt-4">
        {[
          ['Nombre completo', `${doc.nombre} ${doc.apellido}`],
          ['Cédula', `V-${doc.cedula}`],
          ['Especialidad', doc.especialidad],
          ['Tipo de contrato', doc.tipoContrato],
          ['Teléfono', doc.telefono],
          ['Correo', doc.email],
          ['Estado', doc.estado],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">{k}</span>
            <span className="text-sm font-medium text-foreground">{v}</span>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="asignacion" className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Materias asignadas</p>
          {docenteMaterias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin materias asignadas actualmente</p>
          ) : (
            <div className="space-y-2">
              {docenteMaterias.map(m => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.nombre}</p>
                    <p className="text-xs text-muted-foreground font-mono">{m.codigo} — {m.gradoId}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.horasSemanales}h/sem</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">Grados a cargo</p>
          <div className="flex flex-wrap gap-1.5">
            {doc.grados.map(g => (
              <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{g}</span>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
