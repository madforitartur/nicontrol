import { useState } from 'react';
import { Order, OrderFilter, OrderStatus } from '@/types/orders';
import { OrderFilters } from './OrderFilters';
import { OrdersTable } from './OrdersTable';
import { OrderDetailModal } from './OrderDetailModal';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty/EmptyState';

interface OrdersPageProps {
  orders: Order[];
  filters: OrderFilter;
  setFilters: (filters: OrderFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clients: string[];
  families: string[];
  getOrderStatus: (order: Order) => OrderStatus;
}

export const OrdersPage = ({
  orders,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  clients,
  families,
  getOrderStatus,
}: OrdersPageProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Nenhuma encomenda carregada"
          description="Importe o seu ficheiro Excel para ver as encomendas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Encomendas</h2>
          <p className="text-muted-foreground">
            {orders.length} registos encontrados
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <OrderFilters
        filters={filters}
        setFilters={setFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clients={clients}
        families={families}
      />

      {/* Table */}
      <OrdersTable 
        orders={orders}
        getOrderStatus={getOrderStatus}
        onViewOrder={handleViewOrder}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};
