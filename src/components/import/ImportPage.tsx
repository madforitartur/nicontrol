import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export const ImportPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Mock import history
  const importHistory = [
    { id: 1, filename: 'listagem_20260127.xls', date: '27/01/2026 09:15', records: 3245, status: 'success' },
    { id: 2, filename: 'listagem_20260126.xls', date: '26/01/2026 08:45', records: 3198, status: 'success' },
    { id: 3, filename: 'listagem_20260125.xls', date: '25/01/2026 09:00', records: 3156, status: 'success' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Importar Dados</h2>
        <p className="text-muted-foreground">
          Carregue ficheiros Excel exportados do sistema externo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Carregar Ficheiro
            </CardTitle>
            <CardDescription>
              Arraste um ficheiro Excel (.xls ou .xlsx) ou clique para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                dragActive 
                  ? "border-accent bg-accent/5" 
                  : "border-muted-foreground/25 hover:border-accent/50",
                uploadedFile && "border-status-success bg-status-success-light"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="h-12 w-12 mx-auto text-status-success" />
                  <div>
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setUploadedFile(null)}>
                      Cancelar
                    </Button>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Importar Dados
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Arraste o ficheiro aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para seleccionar</p>
                  </div>
                  <label>
                    <input
                      type="file"
                      accept=".xls,.xlsx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Seleccionar Ficheiro</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-4 p-4 bg-status-info-light rounded-lg">
              <h4 className="font-medium text-status-info mb-2">Formato do Ficheiro</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formato: Excel (.xls ou .xlsx)</li>
                <li>• Codificação: ISO-8859-1</li>
                <li>• Separador: Tab</li>
                <li>• A primeira linha deve conter os cabeçalhos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Importações
            </CardTitle>
            <CardDescription>
              Últimas importações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importHistory.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.status === 'success' ? 'bg-status-success' : 'bg-status-danger'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{item.filename}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{item.records.toLocaleString('pt-PT')}</p>
                    <p className="text-xs text-muted-foreground">registos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
