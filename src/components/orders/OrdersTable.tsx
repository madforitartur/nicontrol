import { Order, OrderStatus, SECTORS } from '@/types/orders';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { SectorProgress } from './SectorProgress';
import { useState, useMemo } from 'react';

interface OrdersTableProps {
  orders: Order[];
  getOrderStatus: (order: Order) => OrderStatus;
  onViewOrder: (order: Order) => void;
}

type SortField = 'nrDocumento' | 'terceiro' | 'dataPedida' | 'qtdPedida' | 'emAberto';
type SortDirection = 'asc' | 'desc';

const statusBadgeStyles: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  em_producao: { bg: 'bg-status-info-light', text: 'text-status-info', label: 'Em Produção' },
  concluida: { bg: 'bg-status-success-light', text: 'text-status-success', label: 'Concluída' },
  atrasada: { bg: 'bg-status-danger-light', text: 'text-status-danger', label: 'Atrasada' },
  facturada: { bg: 'bg-status-success-light', text: 'text-status-success', label: 'Facturada' },
  em_aberto: { bg: 'bg-status-warning-light', text: 'text-status-warning', label: 'Em Aberto' },
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

export const OrdersTable = ({ orders, getOrderStatus, onViewOrder }: OrdersTableProps) => {
  const [sortField, setSortField] = useState<SortField>('dataPedida');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'nrDocumento':
          comparison = a.nrDocumento.localeCompare(b.nrDocumento);
          break;
        case 'terceiro':
          comparison = a.terceiro.localeCompare(b.terceiro);
          break;
        case 'dataPedida':
          const dateA = parseDate(a.dataPedida);
          const dateB = parseDate(b.dataPedida);
          if (!dateA && !dateB) comparison = 0;
          else if (!dateA) comparison = 1;
          else if (!dateB) comparison = -1;
          else comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'qtdPedida':
          comparison = a.qtdPedida - b.qtdPedida;
          break;
        case 'emAberto':
          comparison = a.emAberto - b.emAberto;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [orders, sortField, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(orders.length / pageSize);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center">
        <p className="text-muted-foreground">Nenhuma encomenda encontrada com os filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[120px]">
                <button 
                  onClick={() => handleSort('nrDocumento')}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Documento
                  <SortIcon field="nrDocumento" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  onClick={() => handleSort('terceiro')}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Cliente
                  <SortIcon field="terceiro" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Referência</TableHead>
              <TableHead className="hidden lg:table-cell">Família</TableHead>
              <TableHead>
                <button 
                  onClick={() => handleSort('dataPedida')}
                  className="flex items-center gap-1 font-semibold hover:text-foreground"
                >
                  Data Pedida
                  <SortIcon field="dataPedida" />
                </button>
              </TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                <button 
                  onClick={() => handleSort('qtdPedida')}
                  className="flex items-center gap-1 font-semibold hover:text-foreground ml-auto"
                >
                  Qtd.
                  <SortIcon field="qtdPedida" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button 
                  onClick={() => handleSort('emAberto')}
                  className="flex items-center gap-1 font-semibold hover:text-foreground ml-auto"
                >
                  Em Aberto
                  <SortIcon field="emAberto" />
                </button>
              </TableHead>
              <TableHead className="hidden xl:table-cell">Progresso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => {
              const status = getOrderStatus(order);
              const statusStyle = statusBadgeStyles[status];
              return (
                <TableRow 
                  key={order.id} 
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => onViewOrder(order)}
                >
                  <TableCell className="font-medium">{order.nrDocumento}</TableCell>
                  <TableCell className="font-medium">{order.terceiro}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px] truncate">
                    {order.referencia}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="secondary" className="font-normal">
                      {order.familia}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.dataPedida}</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {order.qtdPedida.toLocaleString('pt-PT')}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {order.emAberto.toLocaleString('pt-PT')}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <SectorProgress order={order} compact />
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(statusStyle.bg, statusStyle.text, 'font-medium')}>
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
        <p className="text-sm text-muted-foreground">
          A mostrar {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, orders.length)} de {orders.length} registos
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Seguinte
          </Button>
        </div>
      </div>
    </div>
  );
};
