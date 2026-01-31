import { FileText, Download, Calendar, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrdersContext } from '@/contexts/OrdersContext';
import { EmptyState } from '@/components/empty/EmptyState';

export const ReportsPage = () => {
  const { orders } = useOrdersContext();
  const reports = [
    {
      id: 'cliente',
      title: 'Encomendas por Cliente',
      description: 'Lista de todas as encomendas agrupadas por cliente, incluindo estado atual e previsão de entrega.',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'sector',
      title: 'Produção por Sector',
      description: 'Quantidade em cada sector, tempo médio de processamento e encomendas aguardando entrada.',
      icon: Package,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      id: 'atrasadas',
      title: 'Encomendas Atrasadas',
      description: 'Lista completa de encomendas com atraso, incluindo impacto por cliente.',
      icon: Calendar,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      id: 'performance',
      title: 'Relatório de Performance',
      description: 'Taxa de cumprimento de prazos, tempo médio de produção e comparação período a período.',
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ];

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Sem dados para relatórios"
          description="Importe o seu ficheiro Excel para gerar relatórios."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
        <p className="text-muted-foreground">
          Gere e exporte relatórios de produção e encomendas
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-soft transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2">
                    <FileText className="h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Personalizado</CardTitle>
          <CardDescription>
            Crie relatórios com campos e filtros personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Configure campos, filtros e agrupamentos para criar um relatório à sua medida
            </p>
            <Button variant="outline">
              Criar Relatório Personalizado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
