import { SECTORS } from '@/types/orders';
import { cn } from '@/lib/utils';

const sectorColorClasses: Record<string, string> = {
  tecelagem: 'bg-sector-tecelagem',
  felpoCru: 'bg-sector-felpo',
  tinturaria: 'bg-sector-tinturaria',
  confeccao: 'bg-sector-confeccao',
  embalagem: 'bg-sector-embalagem',
  stock: 'bg-sector-stock',
};

export const TimelineLegend = () => {
  return (
    <div className="flex flex-wrap gap-3">
      {SECTORS.map(sector => (
        <div key={sector.id} className="flex items-center gap-1.5">
          <div className={cn("w-3 h-3 rounded", sectorColorClasses[sector.id])} />
          <span className="text-xs text-muted-foreground">{sector.shortName}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 border-l pl-3">
        <div className="w-3 h-3 rounded-full bg-status-success" />
        <span className="text-xs text-muted-foreground">No prazo</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-status-danger" />
        <span className="text-xs text-muted-foreground">Atrasada</span>
      </div>
    </div>
  );
};
