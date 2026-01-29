import { useMemo } from 'react';
import { Order, OrderStatus, SECTORS, SectorType } from '@/types/orders';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineRowProps {
  order: Order;
  dateColumns: Date[];
  columnWidth: number;
  getOrderStatus: (order: Order) => OrderStatus;
}

// Parse DD/MM/YYYY format
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

// Get sector data from order
const getSectorData = (order: Order) => {
  return [
    { 
      id: 'tecelagem' as SectorType, 
      name: 'Tecelagem',
      startDate: parseDate(order.dataTec),
      endDate: parseDate(order.dataFelpoCru) || parseDate(order.dataTec),
      quantity: order.dataTec ? order.qtdPedida : 0,
      active: !!order.dataTec && order.felpoCru === 0 && order.emAberto > 0
    },
    { 
      id: 'felpoCru' as SectorType, 
      name: 'Felpo Cru',
      startDate: parseDate(order.dataFelpoCru),
      endDate: parseDate(order.dataTint) || parseDate(order.dataFelpoCru),
      quantity: order.felpoCru,
      active: order.felpoCru > 0
    },
    { 
      id: 'tinturaria' as SectorType, 
      name: 'Tinturaria',
      startDate: parseDate(order.dataTint),
      endDate: parseDate(order.dataConf) || parseDate(order.dataTint),
      quantity: order.tinturaria,
      active: order.tinturaria > 0
    },
    { 
      id: 'confeccao' as SectorType, 
      name: 'Confecção',
      startDate: parseDate(order.dataConf),
      endDate: parseDate(order.dataArmExp) || parseDate(order.dataConf),
      quantity: order.confeccaoRoupoes + order.confeccaoFelpos,
      active: (order.confeccaoRoupoes + order.confeccaoFelpos) > 0
    },
    { 
      id: 'embalagem' as SectorType, 
      name: 'Embalagem',
      startDate: parseDate(order.dataArmExp),
      endDate: parseDate(order.dataEnt) || parseDate(order.dataArmExp),
      quantity: order.embAcab,
      active: order.embAcab > 0
    },
    { 
      id: 'stock' as SectorType, 
      name: 'Stock',
      startDate: parseDate(order.dataEnt),
      endDate: parseDate(order.dataEnt),
      quantity: order.stockCx,
      active: order.stockCx > 0
    },
  ];
};

// Sector colors matching the design system
const sectorColors: Record<SectorType, string> = {
  tecelagem: 'bg-sector-tecelagem',
  felpoCru: 'bg-sector-felpo',
  tinturaria: 'bg-sector-tinturaria',
  confeccao: 'bg-sector-confeccao',
  embalagem: 'bg-sector-embalagem',
  stock: 'bg-sector-stock',
};

export const TimelineRow = ({ order, dateColumns, columnWidth, getOrderStatus }: TimelineRowProps) => {
  const status = getOrderStatus(order);
  const isDelayed = status === 'atrasada';
  const dataPedida = parseDate(order.dataPedida);
  
  // Get sector bars
  const sectorBars = useMemo(() => {
    const sectors = getSectorData(order);
    const bars: { 
      sector: typeof sectors[0]; 
      startIdx: number; 
      endIdx: number;
      width: number;
      left: number;
    }[] = [];

    sectors.forEach(sector => {
      if (!sector.startDate) return;
      
      const startIdx = dateColumns.findIndex(d => 
        d.toDateString() === sector.startDate?.toDateString()
      );
      
      let endIdx = dateColumns.findIndex(d => 
        d.toDateString() === sector.endDate?.toDateString()
      );
      
      if (startIdx === -1) return;
      if (endIdx === -1) endIdx = startIdx;
      if (endIdx < startIdx) endIdx = startIdx;
      
      bars.push({
        sector,
        startIdx,
        endIdx,
        width: (endIdx - startIdx + 1) * columnWidth - 4,
        left: startIdx * columnWidth + 2,
      });
    });

    return bars;
  }, [order, dateColumns, columnWidth]);

  // Find due date position
  const dueDateIdx = useMemo(() => {
    if (!dataPedida) return -1;
    return dateColumns.findIndex(d => d.toDateString() === dataPedida.toDateString());
  }, [dataPedida, dateColumns]);

  // Today position
  const todayIdx = useMemo(() => {
    const today = new Date();
    return dateColumns.findIndex(d => d.toDateString() === today.toDateString());
  }, [dateColumns]);

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  return (
    <div className="h-14 relative flex">
      {/* Background grid */}
      {dateColumns.map((date, idx) => (
        <div 
          key={idx}
          className={cn(
            "h-full border-r",
            isToday(date) && "bg-accent/20",
            isWeekend(date) && !isToday(date) && "bg-muted/30"
          )}
          style={{ width: columnWidth }}
        />
      ))}

      {/* Sector bars */}
      {sectorBars.map((bar, idx) => (
        <Tooltip key={idx}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-2 h-10 rounded-md cursor-pointer transition-all hover:opacity-90 hover:scale-y-110",
                sectorColors[bar.sector.id],
                bar.sector.active && "ring-2 ring-offset-1 ring-foreground/20"
              )}
              style={{
                left: bar.left,
                width: Math.max(bar.width, columnWidth - 4),
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold">{bar.sector.name}</div>
              <div className="text-xs space-y-0.5">
                <div>Início: {bar.sector.startDate?.toLocaleDateString('pt-PT')}</div>
                {bar.sector.endDate && bar.sector.endDate !== bar.sector.startDate && (
                  <div>Fim: {bar.sector.endDate.toLocaleDateString('pt-PT')}</div>
                )}
                {bar.sector.quantity > 0 && (
                  <div>Quantidade: {bar.sector.quantity.toLocaleString('pt-PT')}</div>
                )}
                {bar.sector.active && (
                  <div className="text-primary font-medium">• Sector ativo</div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}

      {/* Due date marker */}
      {dueDateIdx >= 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-0 h-full w-0.5 z-10",
                isDelayed ? "bg-status-danger" : "bg-status-success"
              )}
              style={{ left: dueDateIdx * columnWidth + columnWidth / 2 }}
            >
              <div 
                className={cn(
                  "absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full",
                  isDelayed ? "bg-status-danger" : "bg-status-success"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-semibold">Data Pedida</div>
              <div>{dataPedida?.toLocaleDateString('pt-PT')}</div>
              {isDelayed && <div className="text-status-danger">Atrasada!</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Today marker line */}
      {todayIdx >= 0 && (
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/50 z-5"
          style={{ left: todayIdx * columnWidth + columnWidth / 2 }}
        />
      )}
    </div>
  );
};
