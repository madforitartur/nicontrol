import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrdersContext } from '@/contexts/OrdersContext';
import { TimelineRow } from './TimelineRow';
import { TimelineLegend } from './TimelineLegend';
import { EmptyState } from '@/components/empty/EmptyState';

// Parse DD/MM/YYYY format
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

// Format date to DD/MM
const formatDateShort = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

type ZoomLevel = 'day' | 'week' | 'month';

export const TimelinePage = () => {
  const { orders, clients, getOrderStatus } = useOrdersContext();
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(o => o.emAberto > 0); // Only active orders
    
    if (selectedClient !== 'all') {
      filtered = filtered.filter(o => o.cliente === selectedClient);
    }
    
    return filtered.slice(0, 50); // Limit for performance
  }, [orders, selectedClient]);

  // Calculate date range based on zoom level
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (zoomLevel) {
      case 'day':
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() + 14);
        break;
      case 'week':
        start.setDate(start.getDate() - 14);
        end.setDate(end.getDate() + 42);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() + 3);
        break;
    }
    
    return { start, end };
  }, [currentDate, zoomLevel]);

  // Generate date columns
  const dateColumns = useMemo(() => {
    const columns: Date[] = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      columns.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return columns;
  }, [dateRange]);

  // Column width based on zoom
  const columnWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'day': return 60;
      case 'week': return 30;
      case 'month': return 15;
    }
  }, [zoomLevel]);

  // Navigation handlers
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (zoomLevel) {
      case 'day': newDate.setDate(newDate.getDate() - 7); break;
      case 'week': newDate.setDate(newDate.getDate() - 14); break;
      case 'month': newDate.setMonth(newDate.getMonth() - 1); break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (zoomLevel) {
      case 'day': newDate.setDate(newDate.getDate() + 7); break;
      case 'week': newDate.setDate(newDate.getDate() + 14); break;
      case 'month': newDate.setMonth(newDate.getMonth() + 1); break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    // Scroll to today
    if (scrollContainerRef.current) {
      const todayIndex = dateColumns.findIndex(d => 
        d.toDateString() === new Date().toDateString()
      );
      if (todayIndex > 0) {
        scrollContainerRef.current.scrollLeft = (todayIndex - 5) * columnWidth;
      }
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel === 'month') setZoomLevel('week');
    else if (zoomLevel === 'week') setZoomLevel('day');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'day') setZoomLevel('week');
    else if (zoomLevel === 'week') setZoomLevel('month');
  };

  // Check if a date is today
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  
  // Check if date is weekend
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  // Group dates by week/month for header
  const groupedDates = useMemo(() => {
    const groups: { label: string; startIdx: number; count: number }[] = [];
    let currentGroup = '';
    let currentStartIdx = 0;
    let currentCount = 0;

    dateColumns.forEach((date, idx) => {
      const groupLabel = zoomLevel === 'month' 
        ? `${date.toLocaleString('pt-PT', { month: 'short' })} ${date.getFullYear()}`
        : `Sem ${Math.ceil(date.getDate() / 7)} - ${date.toLocaleString('pt-PT', { month: 'short' })}`;
      
      if (groupLabel !== currentGroup) {
        if (currentGroup) {
          groups.push({ label: currentGroup, startIdx: currentStartIdx, count: currentCount });
        }
        currentGroup = groupLabel;
        currentStartIdx = idx;
        currentCount = 1;
      } else {
        currentCount++;
      }
    });
    
    if (currentGroup) {
      groups.push({ label: currentGroup, startIdx: currentStartIdx, count: currentCount });
    }
    
    return groups;
  }, [dateColumns, zoomLevel]);

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Sem dados para mostrar"
          description="Importe o seu ficheiro Excel para ver a timeline de entregas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Timeline</h2>
          <p className="text-muted-foreground">
            Visualização temporal do fluxo de encomendas por sector
          </p>
        </div>
        <TimelineLegend />
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday} className="gap-2">
                <Calendar className="h-4 w-4" />
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2 border-l pl-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomOut}
                disabled={zoomLevel === 'month'}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {zoomLevel === 'day' ? 'Dia' : zoomLevel === 'week' ? 'Semana' : 'Mês'}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleZoomIn}
                disabled={zoomLevel === 'day'}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Client Filter */}
            <div className="flex items-center gap-2 border-l pl-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedClient('all');
                setZoomLevel('week');
                goToToday();
              }}
              className="ml-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            {/* Fixed Left Column - Order Info */}
            <div className="flex-shrink-0 w-64 border-r bg-muted/30">
              {/* Header space */}
              <div className="h-16 border-b bg-muted/50 flex items-center px-4">
                <span className="font-semibold text-sm">Encomenda</span>
              </div>
              
              {/* Order rows */}
              <div className="divide-y">
                {filteredOrders.map((order) => {
                  const status = getOrderStatus(order);
                  return (
                    <div 
                      key={order.id} 
                      className="h-14 px-4 flex flex-col justify-center hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{order.nrDocumento}</span>
                        {status === 'atrasada' && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            Atraso
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {order.cliente} • {order.referencia}
                      </span>
                    </div>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                    Sem encomendas para mostrar
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Timeline Area */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto"
            >
              <div style={{ minWidth: dateColumns.length * columnWidth }}>
                {/* Date Headers */}
                <div className="h-16 border-b bg-muted/50 flex flex-col">
                  {/* Month/Week row */}
                  <div className="h-8 flex border-b">
                    {groupedDates.map((group, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-center text-xs font-medium text-muted-foreground border-r"
                        style={{ width: group.count * columnWidth }}
                      >
                        {group.label}
                      </div>
                    ))}
                  </div>
                  
                  {/* Day row */}
                  <div className="h-8 flex">
                    {dateColumns.map((date, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-center justify-center text-xs border-r",
                          isToday(date) && "bg-accent text-accent-foreground font-bold",
                          isWeekend(date) && !isToday(date) && "bg-muted/70 text-muted-foreground"
                        )}
                        style={{ width: columnWidth }}
                      >
                        {zoomLevel !== 'month' ? formatDateShort(date) : date.getDate()}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Rows */}
                <div className="divide-y">
                  {filteredOrders.map((order) => (
                    <TimelineRow 
                      key={order.id}
                      order={order}
                      dateColumns={dateColumns}
                      columnWidth={columnWidth}
                      getOrderStatus={getOrderStatus}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <div className="text-sm text-muted-foreground">Encomendas visíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-status-danger">
              {filteredOrders.filter(o => getOrderStatus(o) === 'atrasada').length}
            </div>
            <div className="text-sm text-muted-foreground">Atrasadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-status-warning">
              {filteredOrders.filter(o => {
                const dataPedida = parseDate(o.dataPedida);
                if (!dataPedida) return false;
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return dataPedida <= weekFromNow && dataPedida >= new Date();
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Entrega esta semana</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(filteredOrders.map(o => o.cliente)).size}
            </div>
            <div className="text-sm text-muted-foreground">Clientes</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
