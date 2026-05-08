import { History, BookOpen, BarChart3, Download, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, StatsCard } from '@/components/Stats';
import { añosEscolares, estadisticasDashboard } from '@/data/index';

export default function HistorialEscolar() {
  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader title="Historial Escolar" subtitle="Reserva y consulta de datos históricos por año escolar">
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1.5" />Exportar Historial</Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Años Archivados" value={añosEscolares.filter(a => !a.activo).length} icon={Archive} color="primary" index={0} />
        <StatsCard title="Año Activo" value="2024-2025" icon={BookOpen} color="success" index={1} />
        <StatsCard title="Total Registros" value="1,450+" icon={History} color="accent" index={2} />
      </div>

      <div className="space-y-4">
        {añosEscolares.map((año) => (
          <Card key={año.id} className={`border-border shadow-sm ${año.activo ? 'border-primary/30' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${año.activo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">Año Escolar {año.nombre}</h3>
                      {año.activo && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-chart-3/15 text-chart-3 border border-chart-3/30 font-medium">
                          ● Activo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {año.fechaInicio} → {año.fechaFin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {año.activo && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ['Matriculados', '487'],
                        ['Prom. General', '14.8'],
                        ['% Aprobación', '84.4%'],
                      ].map(([k, v]) => (
                        <div key={k} className="text-center px-3">
                          <p className="text-xl font-bold text-primary">{v}</p>
                          <p className="text-xs text-muted-foreground">{k}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!año.activo && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ['Matriculados', año.id === 'ae-2024' ? '471' : '455'],
                        ['Prom. General', año.id === 'ae-2024' ? '14.3' : '13.9'],
                        ['% Aprobación', año.id === 'ae-2024' ? '82.1%' : '80.5%'],
                      ].map(([k, v]) => (
                        <div key={k} className="text-center px-3">
                          <p className="text-lg font-bold text-foreground">{v}</p>
                          <p className="text-xs text-muted-foreground">{k}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <History className="w-3.5 h-3.5" />Consultar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Download className="w-3.5 h-3.5" />Exportar
                    </Button>
                  </div>
                </div>
              </div>

              {año.activo && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Distribución por Grado</p>
                  <div className="grid grid-cols-5 gap-2">
                    {estadisticasDashboard.gradosPorEstudiantes.map(g => (
                      <div key={g.grado} className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-sm font-bold text-foreground">{g.cantidad}</p>
                        <p className="text-xs text-muted-foreground truncate">{g.grado}</p>
                        <p className="text-xs text-chart-3">{Math.round((g.aprobados / g.cantidad) * 100)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Egresados por Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Año Escolar</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">5to Año Matriculados</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Graduados</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Diferidos</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">% Graduación</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { año: '2024-2025', matriculados: 95, graduados: '-', diferidos: '-', pct: 'En curso' },
                  { año: '2023-2024', matriculados: 88, graduados: 79, diferidos: 9, pct: '89.8%' },
                  { año: '2022-2023', matriculados: 82, graduados: 71, diferidos: 11, pct: '86.6%' },
                ].map(r => (
                  <tr key={r.año} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.año}</td>
                    <td className="px-4 py-2.5 text-right text-foreground">{r.matriculados}</td>
                    <td className="px-4 py-2.5 text-right text-chart-3 font-medium">{r.graduados}</td>
                    <td className="px-4 py-2.5 text-right text-chart-4 font-medium">{r.diferidos}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-primary">{r.pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
