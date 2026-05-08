import { useState } from 'react';
import { BookMarked, CheckCircle, Clock, XCircle, Plus, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, StatsCard } from '@/components/Stats';
import { planificaciones, docentes, materias } from '@/data/index';
import { GRADOS_SECUNDARIA } from '@/lib/index';
import type { Planificacion } from '@/lib/index';

const estadoConfig: Record<Planificacion['estado'], { label: string; color: string; icon: React.ElementType }> = {
  aprobado: { label: 'Aprobado', color: 'bg-chart-3/15 text-chart-3 border-chart-3/30', icon: CheckCircle },
  revisado: { label: 'En revisión', color: 'bg-primary/15 text-primary border-primary/30', icon: Clock },
  pendiente: { label: 'Pendiente', color: 'bg-chart-4/15 text-chart-4 border-chart-4/30', icon: Clock },
};

export default function Coordinacion() {
  const [selected, setSelected] = useState<Planificacion | null>(null);
  const [filtroDocente, setFiltroDocente] = useState('todos');

  const filtradas = planificaciones.filter(p =>
    filtroDocente === 'todos' || p.docenteId === filtroDocente
  );

  const aprobadas = planificaciones.filter(p => p.estado === 'aprobado').length;
  const enRevision = planificaciones.filter(p => p.estado === 'revisado').length;
  const pendientes = planificaciones.filter(p => p.estado === 'pendiente').length;

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <PageHeader title="Coordinación Pedagógica" subtitle="Gestión de planificaciones, proyectos y supervisión docente">
        <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Nueva Planificación</Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Aprobadas" value={aprobadas} icon={CheckCircle} color="success" index={0} />
        <StatsCard title="En Revisión" value={enRevision} icon={Clock} color="primary" index={1} />
        <StatsCard title="Pendientes" value={pendientes} icon={XCircle} color="warning" index={2} />
      </div>

      <Tabs defaultValue="planificaciones">
        <TabsList>
          <TabsTrigger value="planificaciones">Planificaciones Semanales</TabsTrigger>
          <TabsTrigger value="calendario">Calendario Académico</TabsTrigger>
          <TabsTrigger value="evaluaciones">Plan de Evaluación</TabsTrigger>
        </TabsList>

        <TabsContent value="planificaciones" className="mt-4 space-y-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-3">
              <Select value={filtroDocente} onValueChange={setFiltroDocente}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Filtrar por docente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los docentes</SelectItem>
                  {docentes.filter(d => d.estado === 'activo').map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.apellido}, {d.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filtradas.map(plan => {
              const doc = docentes.find(d => d.id === plan.docenteId);
              const mat = materias.find(m => m.id === plan.materiaId);
              const cfg = estadoConfig[plan.estado];
              const StatusIcon = cfg.icon;
              return (
                <Card key={plan.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookMarked className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{mat?.nombre ?? 'Materia'}</span>
                            <span className="text-xs text-muted-foreground">— {plan.gradoId}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" />{cfg.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Docente:</span> {doc?.apellido}, {doc?.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Semana:</span> {plan.semana}
                          </p>
                          <p className="text-sm text-foreground mt-1 line-clamp-1">
                            <span className="font-medium">Contenido:</span> {plan.contenido}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelected(plan)}>
                              <Eye className="w-3.5 h-3.5" />Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Planificación Semanal</DialogTitle></DialogHeader>
                            {selected && <DetallePlanificacion plan={selected} />}
                          </DialogContent>
                        </Dialog>
                        {plan.estado === 'pendiente' && (
                          <Button size="sm" className="gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />Aprobar
                          </Button>
                        )}
                        {plan.estado === 'revisado' && (
                          <Button size="sm" className="gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />Aprobar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Calendario Académico 2024-2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { evento: 'Inicio año escolar', fecha: '16 Sep 2024', tipo: 'inicio', nota: 'Inicio del 1er Lapso' },
                  { evento: 'Evaluaciones 1er Lapso', fecha: '18-29 Nov 2024', tipo: 'evaluacion', nota: 'Exámenes finales' },
                  { evento: 'Cierre 1er Lapso', fecha: '29 Nov 2024', tipo: 'cierre', nota: 'Entrega de boletines' },
                  { evento: 'Inicio 2do Lapso', fecha: '9 Dic 2024', tipo: 'inicio', nota: '' },
                  { evento: 'Vacaciones Navidad', fecha: '20 Dic 2024 - 10 Ene 2025', tipo: 'vacaciones', nota: '' },
                  { evento: 'Evaluaciones 2do Lapso', fecha: '17-28 Feb 2025', tipo: 'evaluacion', nota: 'Exámenes finales' },
                  { evento: 'Cierre 2do Lapso', fecha: '28 Feb 2025', tipo: 'cierre', nota: '' },
                  { evento: 'Inicio 3er Lapso', fecha: '10 Mar 2025', tipo: 'inicio', nota: '' },
                  { evento: 'Semana Santa', fecha: '14-20 Abr 2025', tipo: 'vacaciones', nota: '' },
                  { evento: 'Evaluaciones 3er Lapso', fecha: '19-30 May 2025', tipo: 'evaluacion', nota: 'Exámenes finales' },
                  { evento: 'Actos de Grado 5to Año', fecha: '20 Jun 2025', tipo: 'especial', nota: '' },
                  { evento: 'Cierre año escolar', fecha: '15 Jul 2025', tipo: 'cierre', nota: '' },
                ].map(item => {
                  const colors: Record<string, string> = {
                    inicio: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
                    cierre: 'bg-primary/15 text-primary border-primary/30',
                    evaluacion: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
                    vacaciones: 'bg-accent/15 text-accent border-accent/30',
                    especial: 'bg-destructive/15 text-destructive border-destructive/30',
                  };
                  return (
                    <div key={item.evento} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${colors[item.tipo]}`}>
                        {item.tipo}
                      </span>
                      <span className="font-medium text-sm text-foreground flex-1">{item.evento}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{item.fecha}</span>
                      {item.nota && <span className="text-xs text-muted-foreground hidden md:block">{item.nota}</span>}
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                <Download className="w-4 h-4" />Descargar Calendario
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluaciones" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Planes de Evaluación por Materia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Materia</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Docente</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Porcentaje Nota 1</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Porcentaje Nota 2</th>
                      <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Porcentaje Nota 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.map(m => {
                      const doc = docentes.find(d => d.id === m.docenteId);
                      return (
                        <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="px-3 py-2.5 font-medium text-foreground">{m.nombre}</td>
                          <td className="px-3 py-2.5 text-foreground">{doc?.apellido ?? '—'}, {doc?.nombre ?? '—'}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">33.33%</td>
                          <td className="px-3 py-2.5 text-muted-foreground">33.33%</td>
                          <td className="px-3 py-2.5 text-muted-foreground">33.34%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetallePlanificacion({ plan }: { plan: Planificacion }) {
  const doc = docentes.find(d => d.id === plan.docenteId);
  const mat = materias.find(m => m.id === plan.materiaId);
  return (
    <div className="space-y-3 py-2">
      {[
        ['Materia', mat?.nombre ?? '—'],
        ['Docente', doc ? `${doc.nombre} ${doc.apellido}` : '—'],
        ['Grado', plan.gradoId],
        ['Semana', plan.semana],
        ['Estado', plan.estado],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between py-1.5 border-b border-border">
          <span className="text-sm text-muted-foreground">{k}</span>
          <span className="text-sm font-medium text-foreground">{v}</span>
        </div>
      ))}
      {[
        ['Contenido programático', plan.contenido],
        ['Estrategias metodológicas', plan.estrategias],
        ['Recursos didácticos', plan.recursos],
        ['Estrategia de evaluación', plan.evaluacion],
      ].map(([k, v]) => (
        <div key={k} className="pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{k}</p>
          <p className="text-sm text-foreground bg-muted/50 px-3 py-2 rounded-lg">{v}</p>
        </div>
      ))}
    </div>
  );
}
