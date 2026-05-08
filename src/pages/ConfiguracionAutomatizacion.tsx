import { useState } from 'react';
import { Settings, Play, CheckCircle, AlertTriangle, Terminal, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PageHeader, StatsCard } from '@/components/Stats';

const automationFlows = [
  { id: 'f1', nombre: 'Captura de Pre-Inscripciones', trigger: 'Telegram Bot', estado: 'activo', lastRun: 'Hoy 10:15 AM' },
  { id: 'f2', nombre: 'Recordatorios a Docentes', trigger: 'Programado (Diario)', estado: 'activo', lastRun: 'Ayer 8:00 PM' },
  { id: 'f3', nombre: 'Alertas de Riesgo Académico', trigger: 'Programado (Semanal)', estado: 'activo', lastRun: 'Lunes 9:00 AM' },
  { id: 'f4', nombre: 'Cálculo de Notas Definitivas', trigger: 'Evento Sistema', estado: 'pausado', lastRun: '15 Mar' },
  { id: 'f5', nombre: 'Generación de Boletines PDF', trigger: 'Evento Sistema', estado: 'activo', lastRun: '—' },
  { id: 'f6', nombre: 'Envío de Boletines por Telegram', trigger: 'Post-generación', estado: 'activo', lastRun: '—' },
  { id: 'f7', nombre: 'Generación de Carnet (Lote)', trigger: 'Post-inscripción', estado: 'activo', lastRun: 'Hoy 11:30 AM' },
  { id: 'f8', nombre: 'Respaldos Automáticos', trigger: 'Programado (Diario)', estado: 'activo', lastRun: 'Hoy 3:00 AM' },
];

export default function ConfiguracionAutomatizacion() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader title="Configuración de Automatizaciones (n8n)" subtitle="Gestión de flujos de trabajo automáticos y disparadores" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Flujos Activos" value={7} icon={Play} color="success" index={0} />
        <StatsCard title="Ejecuciones (24h)" value={156} icon={Terminal} color="primary" index={1} />
        <StatsCard title="Alertas Sistema" value={2} icon={Bell} color="warning" index={2} />
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Flujos de Trabajo n8n</CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings className="w-4 h-4" /> Abrir n8n Local
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Proceso</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Trigger / Disparador</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Última Ejecución</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {automationFlows.map((flow) => (
                  <tr key={flow.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{flow.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{flow.trigger}</td>
                    <td className="px-4 py-3 text-xs font-mono">{flow.lastRun}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs border ${
                        flow.estado === 'activo' ? 'bg-chart-3/15 text-chart-3 border-chart-3/30' : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {flow.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Switch checked={flow.estado === 'activo'} />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Logs de Ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '11:30:05', msg: 'Generación de carnet: Lote #45 completado', status: 'ok' },
                { time: '10:15:22', msg: 'Pre-inscripción: Nuevo registro desde Telegram (ID: 789)', status: 'ok' },
                { time: '08:00:01', msg: 'Recordatorio docentes: 15 correos enviados', status: 'ok' },
                { time: '03:00:15', msg: 'Backup diario: Error al conectar con nube (Reintentando)', status: 'error' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-xs border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground font-mono">{log.time}</span>
                  <span className={`flex-1 ${log.status === 'error' ? 'text-destructive font-medium' : 'text-foreground'}`}>
                    {log.msg}
                  </span>
                  {log.status === 'ok' ? <CheckCircle className="w-3 h-3 text-chart-3" /> : <AlertTriangle className="w-3 h-3 text-destructive" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Configuración n8n Local</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-semibold mb-2">Estado del Servidor</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-3 animate-pulse" />
                <span className="text-sm text-chart-3 font-medium">Servidor n8n Conectado</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Instancia local: http://localhost:5678</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Tokens de API</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-1.5 rounded border border-input bg-background font-mono text-xs truncate">
                  n8n_api_key_789456123000...
                </div>
                <Button variant="outline" size="sm">Copiar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
