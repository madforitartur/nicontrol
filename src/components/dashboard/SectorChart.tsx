import { SectorStats } from '@/types/orders';
import { cn } from '@/lib/utils';

interface SectorChartProps {
  data: SectorStats[];
}

const sectorColors: Record<string, string> = {
  tecelagem: 'bg-purple-500',
  felpoCru: 'bg-cyan-500',
  tinturaria: 'bg-emerald-500',
  confeccao: 'bg-amber-500',
  embalagem: 'bg-rose-500',
  stock: 'bg-slate-600',
};

export const SectorChart = ({ data }: SectorChartProps) => {
  const maxQuantidade = Math.max(...data.map(d => d.quantidade), 1);

  return (
    <div className="bg-card rounded-xl border p-5 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ocupação por Sector</h3>
      <div className="space-y-4">
        {data.map((sector) => {
          const percentage = (sector.quantidade / maxQuantidade) * 100;
          return (
            <div key={sector.sectorId} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{sector.sectorName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{sector.numeroEncomendas} enc.</span>
                  <span className="font-semibold text-foreground w-20 text-right">
                    {sector.quantidade.toLocaleString('pt-PT')} un.
                  </span>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", sectorColors[sector.sectorId])}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
