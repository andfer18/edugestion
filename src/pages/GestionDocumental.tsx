import { useState } from 'react';
import { FileText, Download, Plus, CheckCircle, Printer, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, StatsCard } from '@/components/Stats';
import { estudiantes } from '@/data/index';
import type { Estudiante } from '@/lib/index';
import { FileCheck, Archive, ClipboardCheck } from 'lucide-react';

const tiposDocumento = [
  { id: 'constancia_estudio', label: 'Constancia de Estudios', desc: 'Certifica que el estudiante está inscrito en la institución', icon: '📄' },
  { id: 'certificado', label: 'Certificado de Culminación', desc: 'Para estudiantes que egresaron del 5to Año', icon: '🎓' },
  { id: 'acta_calificaciones', label: 'Acta de Calificaciones', desc: 'Historial completo de notas del estudiante', icon: '📊' },
  { id: 'inscripcion', label: 'Comprobante de Inscripción', desc: 'Confirma la inscripción en el año escolar actual', icon: '✅' },
  { id: 'solvencia', label: 'Solvencia Escolar', desc: 'Certifica que no tiene deudas ni sanciones pendientes', icon: '🏷️' },
  { id: 'traslado', label: 'Carta de Traslado', desc: 'Para cambio de institución educativa', icon: '📨' },
];

const documentosEmitidos = [
  { id: 'doc1', tipo: 'constancia_estudio', estudiante: 'e1', fecha: '2025-03-28', emitido: 'Sofía Ramírez' },
  { id: 'doc2', tipo: 'inscripcion', estudiante: 'e2', fecha: '2025-03-25', emitido: 'Sofía Ramírez' },
  { id: 'doc3', tipo: 'acta_calificaciones', estudiante: 'e3', fecha: '2025-03-20', emitido: 'Sofía Ramírez' },
  { id: 'doc4', tipo: 'constancia_estudio', estudiante: 'e4', fecha: '2025-03-15', emitido: 'Sofía Ramírez' },
  { id: 'doc5', tipo: 'solvencia', estudiante: 'e5', fecha: '2025-03-10', emitido: 'Sofía Ramírez' },
];

export default function GestionDocumental() {
  const [showEmitir, setShowEmitir] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedEst, setSelectedEst] = useState('');
  const [search, setSearch] = useState('');
  const [emitiendo, setEmitiendo] = useState(false);
  const [emitido, setEmitido] = useState(false);

  const filteredDocs = documentosEmitidos.filter(d => {
    const est = estudiantes.find(e => e.id === d.estudiante);
    return search === '' || `${est?.nombre} ${est?.apellido}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleEmitir = () => {
    setEmitiendo(true);
    setTimeout(() => {
      setEmitiendo(false);
      setEmitido(true);
      setTimeout(() => { setEmitido(false); setShowEmitir(false); }, 2000);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <PageHeader title="Gestión Documental" subtitle="Emisión de constancias, certificados y documentos oficiales">
        <Button size="sm" onClick={() => setShowEmitir(true)}>
          <Plus className="w-4 h-4 mr-1.5" />Emitir Documento
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
        <StatsCard title="Documentos Emitidos" value={documentosEmitidos.length} icon={FileCheck} color="primary" index={0} />
        <StatsCard title="Este Mes" value={3} icon={FileText} color="accent" index={1} />
        <StatsCard title="Tipos Disponibles" value={tiposDocumento.length} icon={Archive} color="success" index={2} />
      </div>

      <Tabs defaultValue="emitir">
        <TabsList>
          <TabsTrigger value="emitir">Tipos de Documentos</TabsTrigger>
          <TabsTrigger value="historial">Historial de Emisión</TabsTrigger>
        </TabsList>

        <TabsContent value="emitir" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposDocumento.map((tipo) => (
              <Card key={tipo.id} className="border-border shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => { setSelectedTipo(tipo.id); setShowEmitir(true); }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tipo.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{tipo.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tipo.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5">
                    <Plus className="w-3.5 h-3.5" />Emitir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Buscar estudiante..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Estudiante</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tipo de documento</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Fecha emisión</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Emitido por</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map(doc => {
                      const est = estudiantes.find(e => e.id === doc.estudiante);
                      const tipo = tiposDocumento.find(t => t.id === doc.tipo);
                      return (
                        <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {est?.nombre[0]}{est?.apellido[0]}
                              </div>
                              <span className="font-medium text-foreground">{est?.apellido}, {est?.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground">{tipo?.label ?? doc.tipo}</td>
                          <td className="px-4 py-3 text-foreground">{doc.fecha}</td>
                          <td className="px-4 py-3 text-muted-foreground">{doc.emitido}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><Printer className="w-3.5 h-3.5" /></Button>
                            </div>
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
      </Tabs>

      {/* Dialog emitir documento */}
      <Dialog open={showEmitir} onOpenChange={setShowEmitir}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir Documento</DialogTitle>
          </DialogHeader>
          {emitido ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-chart-3/15 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-chart-3" />
              </div>
              <p className="font-semibold text-foreground">Documento emitido exitosamente</p>
              <p className="text-sm text-muted-foreground text-center">El documento está listo para imprimir o descargar</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Tipo de documento</Label>
                <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estudiante</Label>
                <Select value={selectedEst} onValueChange={setSelectedEst}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar estudiante" /></SelectTrigger>
                  <SelectContent>
                    {estudiantes.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.apellido}, {e.nombre} — V-{e.cedula}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Año Escolar</Label>
                <Select defaultValue="2024-2025">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025 (Actual)</SelectItem>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2022-2023">2022-2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEmitir(false)}>Cancelar</Button>
                <Button onClick={handleEmitir} disabled={!selectedTipo || !selectedEst || emitiendo}>
                  {emitiendo ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" />Emitir Documento</span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
