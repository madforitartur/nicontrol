import { 
  Package, 
  AlertTriangle, 
  CalendarClock, 
  CalendarDays, 
  TrendingUp,
  Boxes,
  Receipt,
  PackageOpen 
} from 'lucide-react';
import { KPICard } from './KPICard';
import { SectorChart } from './SectorChart';
import { ClientsChart } from './ClientsChart';
import { AlertsList } from './AlertsList';
import { KPIData, SectorStats, ClientStats, Order, OrderStatus } from '@/types/orders';
import { EmptyState } from '@/components/empty/EmptyState';

interface DashboardProps {
  kpiData: KPIData;
  sectorStats: SectorStats[];
  clientStats: ClientStats[];
  orders: Order[];
  getOrderStatus: (order: Order) => OrderStatus;
}

export const Dashboard = ({ 
  kpiData, 
  sectorStats, 
  clientStats, 
  orders,
  getOrderStatus 
}: DashboardProps) => {
  const delayedOrders = orders.filter(o => getOrderStatus(o) === 'atrasada');

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Sem dados carregados"
          description="Importe o seu ficheiro Excel para começar a acompanhar as encomendas em tempo real."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Acompanhamento de produção em tempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Encomendas Ativas"
          value={kpiData.totalEncomendas}
          icon={Package}
          variant="default"
        />
        <KPICard
          title="Atrasadas"
          value={kpiData.encomendasAtrasadas}
          icon={AlertTriangle}
          variant={kpiData.encomendasAtrasadas > 0 ? 'danger' : 'success'}
        />
        <KPICard
          title="Entregas esta Semana"
          value={kpiData.entregasEstaSemana}
          icon={CalendarClock}
          variant="warning"
        />
        <KPICard
          title="Entregas este Mês"
          value={kpiData.entregasEsteMes}
          icon={CalendarDays}
          variant="info"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Taxa de Cumprimento"
          value={`${kpiData.taxaCumprimento}%`}
          icon={TrendingUp}
          variant={kpiData.taxaCumprimento >= 80 ? 'success' : 'warning'}
        />
        <KPICard
          title="Qtd. em Produção"
          value={kpiData.quantidadeProducao.toLocaleString('pt-PT')}
          icon={Boxes}
          variant="default"
        />
        <KPICard
          title="Qtd. Facturada"
          value={kpiData.quantidadeFacturada.toLocaleString('pt-PT')}
          icon={Receipt}
          variant="success"
        />
        <KPICard
          title="Qtd. em Aberto"
          value={kpiData.quantidadeEmAberto.toLocaleString('pt-PT')}
          icon={PackageOpen}
          variant="info"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectorChart data={sectorStats} />
        </div>
        <div>
          <AlertsList delayedOrders={delayedOrders} />
        </div>
      </div>

      {/* Clients Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientsChart data={clientStats} />
        <div className="bg-card rounded-xl border p-5 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resumo Rápido</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total de Clientes</span>
              <span className="font-semibold text-foreground">{clientStats.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Total de Linhas</span>
              <span className="font-semibold text-foreground">{orders.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Documentos Únicos</span>
              <span className="font-semibold text-foreground">
                {new Set(orders.map(o => o.nrDocumento)).size}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Famílias de Produto</span>
              <span className="font-semibold text-foreground">
                {new Set(orders.map(o => o.familia)).size}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
