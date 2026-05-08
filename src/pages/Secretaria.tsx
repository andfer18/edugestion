import { useState } from 'react';
import { Search, Phone, Mail, FileText, Calendar, Bell, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, StatsCard } from '@/components/Stats';
import { estudiantes, inscripciones } from '@/data/index';
import { formatearFecha } from '@/lib/index';
import { ClipboardCheck, UserCheck } from 'lucide-react';

const comunicaciones = [
  { id: 'c1', tipo: 'circular', asunto: 'Reunión de representantes — 1er Lapso', fecha: '2025-04-05', destinatarios: 'Todos los representantes', estado: 'enviada' },
  { id: 'c2', tipo: 'nota', asunto: 'Recordatorio entrega de documentos pendientes', fecha: '2025-04-03', destinatarios: '12 representantes', estado: 'enviada' },
  { id: 'c3', tipo: 'aviso', asunto: 'Cierre de inscripciones: fecha límite 15 de abril', fecha: '2025-04-01', destinatarios: 'Público general', estado: 'enviada' },
  { id: 'c4', tipo: 'circular', asunto: 'Actividades del Día del Niño y la Niña', fecha: '2025-03-28', destinatarios: 'Todos los representantes', estado: 'borrador' },
];

const expedientesPendientes = [
  { estId: 'e1', docs: ['Partida de nacimiento', 'Fotos carnet'] },
  { estId: 'e2', docs: ['Boletín año anterior'] },
  { estId: 'e7', docs: ['Cédula del representante', 'Partida de nacimiento', 'Fotos carnet', 'Constancia de residencia'] },
];

export default function Secretaria() {
  const [searchEst, setSearchEst] = useState('');
  const pendientesCount = inscripciones.filter(i => i.estado === 'pendiente').length;

  const filteredEstudiantes = estudiantes.filter(e =>
    searchEst === '' || `${e.nombre} ${e.apellido}`.toLowerCase().includes(searchEst.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <PageHeader title="Secretaría" subtitle="Control de expedientes, comunicaciones y agenda escolar">
        <Button size="sm"><Bell className="w-4 h-4 mr-1.5" />Nueva Comunicación</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Expedientes Activos" value={estudiantes.filter(e => e.estado === 'activo').length} icon={Archive} color="primary" index={0} />
        <StatsCard title="Docs Pendientes" value={expedientesPendientes.length} icon={FileText} color="warning" index={1} />
        <StatsCard title="Inscripciones Pend." value={pendientesCount} icon={ClipboardCheck} color="destructive" index={2} />
        <StatsCard title="Comunicaciones" value={comunicaciones.length} icon={Bell} color="accent" index={3} />
      </div>

      <Tabs defaultValue="expedientes">
        <TabsList>
          <TabsTrigger value="expedientes">Expedientes</TabsTrigger>
          <TabsTrigger value="comunicaciones">Comunicaciones</TabsTrigger>
          <TabsTrigger value="agenda">Agenda Escolar</TabsTrigger>
        </TabsList>

        <TabsContent value="expedientes" className="mt-4 space-y-4">
          {expedientesPendientes.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-chart-4/10 border border-chart-4/30">
              <FileText className="w-4 h-4 text-chart-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">{expedientesPendientes.length} expedientes con documentos pendientes</p>
                <p className="text-xs text-muted-foreground mt-0.5">Revisar y contactar a los representantes para completar la documentación.</p>
              </div>
            </div>
          )}

          <Card className="border-border shadow-sm">
            <CardContent className="p-3 mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar estudiante..." value={searchEst} onChange={e => setSearchEst(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Estudiante</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Representante</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Contacto</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Docs Pendientes</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstudiantes.slice(0, 8).map(est => {
                      const pendDoc = expedientesPendientes.find(e => e.estId === est.id);
                      return (
                        <tr key={est.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {est.nombre[0]}{est.apellido[0]}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{est.apellido}, {est.nombre}</p>
                                <p className="text-xs text-muted-foreground">{est.grado} "{est.seccion}"</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{est.representante.nombre} {est.representante.apellido}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <p className="text-xs font-mono text-muted-foreground">{est.representante.telefono}</p>
                              {est.representante.email && <p className="text-xs text-muted-foreground truncate max-w-[140px]">{est.representante.email}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {pendDoc ? (
                              <div className="flex flex-wrap gap-1">
                                {pendDoc.docs.map(d => (
                                  <span key={d} className="text-xs px-1.5 py-0.5 rounded bg-chart-4/10 text-chart-4 border border-chart-4/20">{d}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-chart-3 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />Completo
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              est.estado === 'activo' ? 'bg-chart-3/15 text-chart-3 border-chart-3/30' : 'bg-destructive/15 text-destructive border-destructive/30'
                            }`}>{est.estado}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicaciones" className="mt-4 space-y-3">
          {comunicaciones.map(com => {
            const tipoColor: Record<string, string> = {
              circular: 'bg-primary/15 text-primary border-primary/30',
              nota: 'bg-accent/15 text-accent border-accent/30',
              aviso: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
            };
            return (
              <Card key={com.id} className="border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${tipoColor[com.tipo]}`}>{com.tipo}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                            com.estado === 'enviada' ? 'bg-chart-3/15 text-chart-3 border-chart-3/30' : 'bg-muted text-muted-foreground border-border'
                          }`}>{com.estado}</span>
                        </div>
                        <p className="font-semibold text-foreground">{com.asunto}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Para: {com.destinatarios} · {com.fecha}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm"><FileText className="w-3.5 h-3.5 mr-1.5" />Ver</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="agenda" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agenda Institucional — Abril 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { fecha: '05 Abr', evento: 'Reunión de representantes — 2do Lapso', hora: '8:00 AM', tipo: 'reunion' },
                  { fecha: '07 Abr', evento: 'Fecha límite entrega de planificaciones', hora: '5:00 PM', tipo: 'academico' },
                  { fecha: '10 Abr', evento: 'Prueba diagnóstica integrada', hora: '7:30 AM', tipo: 'evaluacion' },
                  { fecha: '14-20 Abr', evento: 'Semana Santa — Sin actividades', hora: '', tipo: 'vacaciones' },
                  { fecha: '22 Abr', evento: 'Regreso de vacaciones', hora: '7:00 AM', tipo: 'inicio' },
                  { fecha: '25 Abr', evento: 'Acto Cultural Día del Idioma', hora: '9:00 AM', tipo: 'especial' },
                  { fecha: '30 Abr', evento: 'Cierre de inscripciones 2025-2026', hora: '3:00 PM', tipo: 'inscripcion' },
                ].map(item => {
                  const colors: Record<string, string> = {
                    reunion: 'bg-primary/10 text-primary border-primary/20',
                    academico: 'bg-accent/10 text-accent border-accent/20',
                    evaluacion: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
                    vacaciones: 'bg-muted text-muted-foreground border-border',
                    inicio: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
                    especial: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
                    inscripcion: 'bg-destructive/10 text-destructive border-destructive/20',
                  };
                  return (
                    <div key={item.fecha} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                      <div className="w-16 text-xs font-mono font-semibold text-primary">{item.fecha}</div>
                      <div className="flex-1 font-medium text-sm text-foreground">{item.evento}</div>
                      {item.hora && <span className="text-xs text-muted-foreground">{item.hora}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${colors[item.tipo] ?? 'bg-muted text-muted-foreground border-border'}`}>
                        {item.tipo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
