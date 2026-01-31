import { FileSpreadsheet, CheckCircle, AlertCircle, Loader2, AlertTriangle, XCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { parseExcelFile, validateFile, ParseResult, ValidationError } from '@/services/excelParser';
import { useOrdersContext } from '@/contexts/OrdersContext';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ImportState = 'idle' | 'validating' | 'parsing' | 'success' | 'error';

export const ImportPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { importOrders, importHistory, orders } = useOrdersContext();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const resetImport = () => {
    setUploadedFile(null);
    setImportState('idle');
    setParseResult(null);
    setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validation = validateFile(file);
      if (validation.valid) {
        setUploadedFile(file);
        setImportState('idle');
        setParseResult(null);
      } else {
        toast({
          title: "Ficheiro inválido",
          description: validation.error,
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFile(file);
      if (validation.valid) {
        setUploadedFile(file);
        setImportState('idle');
        setParseResult(null);
      } else {
        toast({
          title: "Ficheiro inválido",
          description: validation.error,
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!uploadedFile) return;

    setImportState('validating');
    setProgress(10);

    // Simulate validation phase
    await new Promise(resolve => setTimeout(resolve, 300));
    setProgress(30);
    setImportState('parsing');

    // Parse the file
    const result = await parseExcelFile(uploadedFile);
    setProgress(80);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setParseResult(result);
    setProgress(100);

    if (result.orders.length > 0) {
      setImportState('success');
      importOrders(result.orders, uploadedFile.name, result.errors.length);
      
      toast({
        title: "Importação concluída",
        description: `${result.validRows} registos importados com sucesso${result.errors.length > 0 ? `, ${result.errors.length} erros` : ''}`,
        variant: result.errors.length > 0 ? "default" : "default",
      });
    } else {
      setImportState('error');
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar nenhum registo válido",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-status-success" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-status-danger" />;
      default:
        return <CheckCircle className="h-4 w-4 text-status-success" />;
    }
  };

  const renderErrorsList = (errors: ValidationError[]) => {
    const groupedErrors = errors.reduce((acc, error) => {
      if (!acc[error.row]) acc[error.row] = [];
      acc[error.row].push(error);
      return acc;
    }, {} as Record<number, ValidationError[]>);

    return (
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(groupedErrors).slice(0, 10).map(([row, rowErrors]) => (
          <AccordionItem key={row} value={`row-${row}`}>
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-status-danger" />
                Linha {row} - {rowErrors.length} erro(s)
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 pl-6">
                {rowErrors.map((error, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <span className="font-medium">{error.field}:</span> {error.message}
                    {error.value && <span className="text-status-danger ml-1">({error.value})</span>}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
        {Object.keys(groupedErrors).length > 10 && (
          <p className="text-sm text-muted-foreground mt-2">
            ... e mais {Object.keys(groupedErrors).length - 10} linhas com erros
          </p>
        )}
      </Accordion>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Importar Dados</h2>
        <p className="text-muted-foreground">
          Carregue o seu ficheiro Excel com a base de dados de encomendas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Carregar Ficheiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-muted/10",
                dragActive
                  ? "border-blue-400 bg-blue-50/40"
                  : "border-blue-300/70",
                uploadedFile && importState === 'idle' && "border-blue-500/80",
                importState === 'success' && "border-status-success bg-status-success/10",
                importState === 'error' && "border-status-danger bg-status-danger/10"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {importState === 'validating' || importState === 'parsing' ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
                  <div>
                    <p className="font-medium text-foreground">
                      {importState === 'validating' ? 'A validar ficheiro...' : 'A processar dados...'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {uploadedFile?.name}
                    </p>
                  </div>
                  <Progress value={progress} className="w-full max-w-xs mx-auto" />
                </div>
              ) : importState === 'success' ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 mx-auto text-status-success" />
                  <div>
                    <p className="font-medium text-foreground">Importação concluída!</p>
                    <p className="text-sm text-muted-foreground">
                      {parseResult?.validRows.toLocaleString('pt-PT')} registos importados
                      {parseResult?.errors && parseResult.errors.length > 0 && (
                        <span className="text-status-warning">
                          {' '}({parseResult.errors.length} com erros)
                        </span>
                      )}
                    </p>
                  </div>
                  <Button variant="outline" onClick={resetImport}>
                    Importar Novo Ficheiro
                  </Button>
                </div>
              ) : importState === 'error' ? (
                <div className="space-y-4">
                  <XCircle className="h-12 w-12 mx-auto text-status-danger" />
                  <div>
                    <p className="font-medium text-foreground">Erro na importação</p>
                    <p className="text-sm text-muted-foreground">
                      Não foi possível processar o ficheiro
                    </p>
                  </div>
                  <Button variant="outline" onClick={resetImport}>
                    Tentar Novamente
                  </Button>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-blue-600" />
                  <div>
                    <p className="font-medium text-foreground">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={resetImport}>
                      Cancelar
                    </Button>
                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={handleImport}
                    >
                      Importar Dados
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Arraste o ficheiro Excel aqui</p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar (.xlsx, .xls)
                    </p>
                  </div>
                  <label>
                    <input
                      type="file"
                      accept=".xls,.xlsx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button variant="secondary" className="cursor-pointer" asChild>
                      <span>Selecionar Ficheiro</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {parseResult?.errors && parseResult.errors.length > 0 && importState === 'success' && (
              <div className="p-4 bg-status-warning/10 rounded-lg border border-status-warning/30">
                <h4 className="font-medium text-status-warning mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Linhas com erros ({parseResult.errors.length})
                </h4>
                {renderErrorsList(parseResult.errors)}
              </div>
            )}

            <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Estrutura esperada:</p>
              <p><strong>Coluna A:</strong> Notas de instruções</p>
              <p><strong>Coluna B:</strong> Nome do cliente</p>
              <p><strong>Coluna D:</strong> Data de entrega</p>
              <p><strong>Coluna H:</strong> Referência do artigo</p>
              <p><strong>Coluna J:</strong> Cor do artigo</p>
              <p><strong>Coluna M:</strong> Descrição do artigo</p>
              <p><strong>Coluna O:</strong> Quantidades pedidas</p>
              <p><strong>Colunas Q-AA:</strong> Posição nos setores</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card h-fit">
          <CardHeader className="flex flex-row items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <CardTitle>Estado dos Dados</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            {orders.length === 0 ? (
              <p>Nenhum dado carregado. Importe um ficheiro Excel para começar.</p>
            ) : (
              <>
                <p className="text-foreground font-medium">
                  Dados carregados com sucesso.
                </p>
                <p>
                  {importHistory[0]
                    ? `Última importação: ${importHistory[0].filename} (${importHistory[0].date})`
                    : 'Dados disponíveis.'}
                </p>
                <div className="flex items-center gap-2">
                  {importHistory[0] && getStatusIcon(importHistory[0].status)}
                  <span>{orders.length.toLocaleString('pt-PT')} registos carregados</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
