import { Order, SECTORS } from '@/types/orders';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SectorProgress, getSectorState } from './SectorProgress';
import { Package, User, Calendar, Hash, Barcode, Palette, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export const OrderDetailModal = ({ order, open, onClose }: OrderDetailModalProps) => {
  if (!order) return null;

  const sectorColors: Record<string, string> = {
    tecelagem: 'bg-purple-500',
    felpoCru: 'bg-cyan-500',
    tinturaria: 'bg-emerald-500',
    confeccao: 'bg-amber-500',
    embalagem: 'bg-rose-500',
    stock: 'bg-slate-600',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            Encomenda {order.nrDocumento}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client and Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informação do Cliente
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.cliente}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">PO: {order.po}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Datas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Emissão:</span>
                  <span className="font-medium">{order.dataEmissao}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Pedida:</span>
                  <span className="font-medium text-accent">{order.dataPedida}</span>
                </div>
                {order.dataEnt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data Entrega:</span>
                    <span className="font-medium">{order.dataEnt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Produto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{order.referencia}</p>
                    <p className="text-sm text-muted-foreground">Cód: {order.codArtigo}</p>
                  </div>
                </div>
                <Badge variant="secondary">{order.familia}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.descricaoCor} ({order.cor})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.descricaoTam} ({order.tam})</span>
                </div>
                {order.ean && (
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{order.ean}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-status-info-light rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Qtd. Pedida</p>
              <p className="text-2xl font-bold text-status-info">
                {order.qtdPedida.toLocaleString('pt-PT')}
              </p>
            </div>
            <div className="bg-status-success-light rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Facturada</p>
              <p className="text-2xl font-bold text-status-success">
                {order.facturada.toLocaleString('pt-PT')}
              </p>
            </div>
            <div className="bg-status-warning-light rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Em Aberto</p>
              <p className="text-2xl font-bold text-status-warning">
                {order.emAberto.toLocaleString('pt-PT')}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Item</p>
              <p className="text-2xl font-bold text-foreground">{order.item}</p>
            </div>
          </div>

          <Separator />

          {/* Sector Progress */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Progresso por Sector
            </h4>
            <div className="flex justify-center py-2">
              <SectorProgress order={order} />
            </div>

            {/* Sector Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SECTORS.map((sector) => {
                let qty = 0;
                let date = '';
                
                switch (sector.id) {
                  case 'tecelagem':
                    date = order.dataTec;
                    break;
                  case 'felpoCru':
                    qty = order.felpoCru;
                    date = order.dataFelpoCru;
                    break;
                  case 'tinturaria':
                    qty = order.tinturaria;
                    date = order.dataTint;
                    break;
                  case 'confeccao':
                    qty = order.confeccaoRoupoes + order.confeccaoFelpos;
                    date = order.dataConf;
                    break;
                  case 'embalagem':
                    qty = order.embAcab;
                    date = order.dataArmExp;
                    break;
                  case 'stock':
                    qty = order.stockCx;
                    date = order.dataEnt;
                    break;
                }

                const state = getSectorState(order, sector.id);

                return (
                  <div 
                    key={sector.id} 
                    className={cn(
                      "rounded-lg p-3 border",
                      state === 'completed' && "bg-status-success-light border-status-success/30",
                      state === 'in_progress' && "bg-status-warning-light border-status-warning/30",
                      state === 'pending' && "bg-muted border-border",
                      state === 'not_applicable' && "bg-muted/50 border-border opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-2 h-2 rounded-full", sectorColors[sector.id])} />
                      <span className="text-sm font-medium">{sector.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {sector.id !== 'tecelagem' && (
                        <p>Qtd: {qty.toLocaleString('pt-PT')}</p>
                      )}
                      {date && <p>Data: {date}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
