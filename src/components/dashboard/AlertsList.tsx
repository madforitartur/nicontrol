import { AlertTriangle, Clock, Package } from 'lucide-react';
import { Order } from '@/types/orders';
import { cn } from '@/lib/utils';

interface AlertsListProps {
  delayedOrders: Order[];
  limit?: number;
}

export const AlertsList = ({ delayedOrders, limit = 5 }: AlertsListProps) => {
  const alerts = delayedOrders.slice(0, limit);

  if (alerts.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-5 shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Alertas</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm">Sem alertas activos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Alertas</h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-status-danger-light text-status-danger">
          {delayedOrders.length} atrasadas
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((order) => (
          <div 
            key={order.id} 
            className="flex items-start gap-3 p-3 rounded-lg bg-status-danger-light/50 border border-status-danger/20"
          >
            <AlertTriangle className="h-5 w-5 text-status-danger flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{order.nrDocumento}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{order.cliente}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-status-danger">
                <Clock className="h-3 w-3" />
                <span>Prazo: {order.dataPedida}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-foreground">
                {order.emAberto.toLocaleString('pt-PT')}
              </span>
              <p className="text-xs text-muted-foreground">em aberto</p>
            </div>
          </div>
        ))}
      </div>
      {delayedOrders.length > limit && (
        <p className="mt-3 text-sm text-center text-muted-foreground">
          +{delayedOrders.length - limit} outras encomendas atrasadas
        </p>
      )}
    </div>
  );
};
