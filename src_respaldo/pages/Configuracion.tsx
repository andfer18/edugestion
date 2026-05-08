import { Settings, School, Calendar, Shield, Users, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/Stats';

export default function Configuracion() {
  return (
    <div className="p-6 space-y-5 max-w-[900px]">
      <PageHeader title="Configuración del Sistema" subtitle="Ajustes institucionales y parámetros del año escolar" />

      <Tabs defaultValue="institucion">
        <TabsList>
          <TabsTrigger value="institucion">Institución</TabsTrigger>
          <TabsTrigger value="academico">Académico</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios y Roles</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="institucion" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><School className="w-5 h-5 text-primary" /><CardTitle className="text-base">Datos Institucionales</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ['Nombre de la institución', 'U.E. Ejemplo'],
                  ['RIF', 'J-00000000-0'],
                  ['Código MECD', '000000'],
                  ['Zona Educativa', 'Distrito Capital'],
                  ['Municipio Escolar', 'Libertador'],
                  ['Nivel educativo', 'Educación Media General'],
                ].map(([label, val]) => (
                  <div key={label} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input defaultValue={val} />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input defaultValue="Av. Bolívar, Municipio Libertador, Caracas, Venezuela" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input defaultValue="(0212) 555-0000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Correo institucional</Label>
                  <Input type="email" defaultValue="info@ueejemplo.edu.ve" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academico" className="mt-4 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /><CardTitle className="text-base">Año Escolar Activo</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Año Escolar</Label>
                  <Select defaultValue="2024-2025">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025 (Activo)</SelectItem>
                      <SelectItem value="2025-2026">2025-2026 (Próximo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha inicio</Label>
                  <Input type="date" defaultValue="2024-09-16" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fecha fin</Label>
                  <Input type="date" defaultValue="2025-07-15" />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-sm font-semibold text-foreground">Control de Lapsos</p>
                {[
                  { lapso: '1er Lapso', inicio: '2024-09-16', fin: '2024-11-29', estado: 'cerrado' },
                  { lapso: '2do Lapso', inicio: '2024-12-09', fin: '2025-02-28', estado: 'activo' },
                  { lapso: '3er Lapso', inicio: '2025-03-10', fin: '2025-05-30', estado: 'pendiente' },
                ].map(l => (
                  <div key={l.lapso} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-foreground">{l.lapso}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        l.estado === 'activo' ? 'bg-chart-3/15 text-chart-3 border-chart-3/30' :
                        l.estado === 'cerrado' ? 'bg-muted text-muted-foreground border-border' :
                        'bg-chart-4/15 text-chart-4 border-chart-4/30'
                      }`}>{l.estado}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{l.inicio} → {l.fin}</span>
                    <div className="flex gap-2">
                      {l.estado === 'activo' && <Button variant="outline" size="sm" className="text-xs h-7">Cerrar lapso</Button>}
                      {l.estado === 'pendiente' && <Button size="sm" className="text-xs h-7">Abrir lapso</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sistema de Evaluación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['Nota mínima aprobatoria', '10', 'Escala 1-20'],
                ['Decimales en definitiva', '2', 'Ej: 14.67'],
                ['Fórmula de definitiva', '(N1+N2+N3)/3', 'Promedio de 3 notas'],
              ].map(([label, val, desc]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Input className="w-40 text-right" defaultValue={val} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /><CardTitle className="text-base">Gestión de Usuarios del Sistema</CardTitle></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { nombre: 'María González', rol: 'director', email: 'directora@ueejemplo.edu.ve', activo: true },
                  { nombre: 'Carlos Rodríguez', rol: 'coordinador', email: 'coordinador@ueejemplo.edu.ve', activo: true },
                  { nombre: 'Sofía Ramírez', rol: 'secretaria', email: 'secretaria@ueejemplo.edu.ve', activo: true },
                  { nombre: 'Ana Martínez', rol: 'docente', email: 'amartinez@ueejemplo.edu.ve', activo: true },
                  { nombre: 'Luis Pérez', rol: 'docente', email: 'lperez@ueejemplo.edu.ve', activo: false },
                ].map(u => (
                  <div key={u.email} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {u.nombre[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.nombre}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{u.rol}</span>
                      <Switch checked={u.activo} />
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-4"><Users className="w-4 h-4 mr-1.5" />Agregar Usuario</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2"><Database className="w-5 h-5 text-primary" /><CardTitle className="text-base">Parámetros del Sistema</CardTitle></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Copia de seguridad automática', desc: 'Backup diario de la base de datos', activo: true },
                { label: 'Notificaciones por correo', desc: 'Enviar alertas al director/coordinador', activo: true },
                { label: 'Modo mantenimiento', desc: 'Deshabilitar acceso al sistema temporalmente', activo: false },
                { label: 'Acceso de padres/representantes', desc: 'Portal para representantes (próximamente)', activo: false },
                { label: 'Generación automática de boletines', desc: 'Al cerrar cada lapso', activo: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.activo} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
