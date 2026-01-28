import { Order, OrderStatus, SECTORS } from '@/types/orders';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertTriangle, MinusCircle } from 'lucide-react';

interface SectorProgressProps {
  order: Order;
  compact?: boolean;
}

type SectorState = 'completed' | 'in_progress' | 'pending' | 'not_applicable';

const getSectorState = (order: Order, sectorId: string): SectorState => {
  switch (sectorId) {
    case 'tecelagem':
      if (order.dataTec) {
        if (order.felpoCru > 0 || order.dataFelpoCru) return 'completed';
        return 'in_progress';
      }
      return 'pending';

    case 'felpoCru':
      if (!order.dataFelpoCru && order.felpoCru === 0) {
        // Check if this sector applies
        if (order.familia === 'Cama' || order.familia === 'A Metro') return 'not_applicable';
        return 'pending';
      }
      if (order.felpoCru > 0) return 'in_progress';
      if (order.dataFelpoCru && order.tinturaria > 0 || order.dataTint) return 'completed';
      return order.dataFelpoCru ? 'in_progress' : 'pending';

    case 'tinturaria':
      if (order.tinturaria > 0) return 'in_progress';
      if (order.dataTint) {
        if (order.confeccaoFelpos > 0 || order.confeccaoRoupoes > 0 || order.dataConf) return 'completed';
        return 'in_progress';
      }
      return 'pending';

    case 'confeccao':
      const confeccaoQty = order.confeccaoRoupoes + order.confeccaoFelpos;
      if (confeccaoQty > 0) return 'in_progress';
      if (order.dataConf) {
        if (order.embAcab > 0 || order.dataArmExp) return 'completed';
        return 'in_progress';
      }
      return 'pending';

    case 'embalagem':
      if (order.embAcab > 0) return 'in_progress';
      if (order.dataArmExp) {
        if (order.stockCx > 0 || order.dataEnt) return 'completed';
        return 'in_progress';
      }
      return 'pending';

    case 'stock':
      if (order.stockCx > 0) return 'in_progress';
      if (order.emAberto === 0) return 'completed';
      return 'pending';

    default:
      return 'pending';
  }
};

const stateStyles = {
  completed: {
    bg: 'bg-status-success',
    border: 'border-status-success',
    text: 'text-status-success',
    icon: Check,
  },
  in_progress: {
    bg: 'bg-status-warning',
    border: 'border-status-warning',
    text: 'text-status-warning',
    icon: Clock,
  },
  pending: {
    bg: 'bg-status-neutral-light',
    border: 'border-muted',
    text: 'text-muted-foreground',
    icon: null,
  },
  not_applicable: {
    bg: 'bg-muted',
    border: 'border-muted',
    text: 'text-muted-foreground/50',
    icon: MinusCircle,
  },
};

export const SectorProgress = ({ order, compact = false }: SectorProgressProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {SECTORS.map((sector) => {
          const state = getSectorState(order, sector.id);
          const styles = stateStyles[state];
          return (
            <div
              key={sector.id}
              className={cn(
                "w-2 h-2 rounded-full",
                styles.bg
              )}
              title={`${sector.name}: ${state}`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {SECTORS.map((sector, index) => {
        const state = getSectorState(order, sector.id);
        const styles = stateStyles[state];
        const Icon = styles.icon;

        return (
          <div key={sector.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  state === 'completed' && "bg-status-success border-status-success",
                  state === 'in_progress' && "bg-status-warning border-status-warning",
                  state === 'pending' && "bg-background border-muted",
                  state === 'not_applicable' && "bg-muted border-muted"
                )}
              >
                {Icon && <Icon className={cn("h-4 w-4", state === 'completed' || state === 'in_progress' ? 'text-white' : styles.text)} />}
              </div>
              <span className={cn("text-xs mt-1", styles.text)}>
                {sector.shortName}
              </span>
            </div>
            {index < SECTORS.length - 1 && (
              <div className={cn(
                "w-6 h-0.5 mx-1",
                getSectorState(order, SECTORS[index + 1].id) !== 'pending' ? 'bg-status-success' : 'bg-muted'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export { getSectorState, type SectorState };
