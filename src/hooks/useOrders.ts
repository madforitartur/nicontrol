import { useState, useMemo } from 'react';
import { Order, OrderFilter, KPIData, SectorStats, ClientStats, OrderStatus, SECTORS } from '@/types/orders';
import { mockOrders, getUniqueClients, getUniqueFamilies } from '@/data/mockOrders';

// Parse DD/MM/YYYY format
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

const isOrderDelayed = (order: Order): boolean => {
  const dataPedida = parseDate(order.dataPedida);
  if (!dataPedida) return false;
  return dataPedida < new Date() && order.emAberto > 0;
};

const isOrderCompleted = (order: Order): boolean => order.emAberto === 0;

const isOrderInvoiced = (order: Order): boolean => order.facturada > 0;

const getOrderStatus = (order: Order): OrderStatus => {
  if (isOrderCompleted(order)) return 'concluida';
  if (isOrderDelayed(order)) return 'atrasada';
  if (isOrderInvoiced(order)) return 'facturada';
  return 'em_producao';
};

export const useOrders = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [filters, setFilters] = useState<OrderFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  const clients = useMemo(() => getUniqueClients(orders), [orders]);
  const families = useMemo(() => getUniqueFamilies(orders), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const searchMatch =
          order.nrDocumento.toLowerCase().includes(term) ||
          order.terceiro.toLowerCase().includes(term) ||
          order.po.toLowerCase().includes(term) ||
          order.referencia.toLowerCase().includes(term);
        if (!searchMatch) return false;
      }

      // Client filter
      if (filters.cliente && order.terceiro !== filters.cliente) return false;

      // Document number filter
      if (filters.nrDocumento && !order.nrDocumento.includes(filters.nrDocumento)) return false;

      // PO filter
      if (filters.po && !order.po.toLowerCase().includes(filters.po.toLowerCase())) return false;

      // Family filter
      if (filters.familia && order.familia !== filters.familia) return false;

      // Status filter
      if (filters.status) {
        const status = getOrderStatus(order);
        if (filters.status !== status) return false;
      }

      // Date filters
      if (filters.dataEmissaoInicio) {
        const orderDate = parseDate(order.dataEmissao);
        const filterDate = new Date(filters.dataEmissaoInicio);
        if (orderDate && orderDate < filterDate) return false;
      }

      if (filters.dataEmissaoFim) {
        const orderDate = parseDate(order.dataEmissao);
        const filterDate = new Date(filters.dataEmissaoFim);
        if (orderDate && orderDate > filterDate) return false;
      }

      if (filters.dataPedidaInicio) {
        const orderDate = parseDate(order.dataPedida);
        const filterDate = new Date(filters.dataPedidaInicio);
        if (orderDate && orderDate < filterDate) return false;
      }

      if (filters.dataPedidaFim) {
        const orderDate = parseDate(order.dataPedida);
        const filterDate = new Date(filters.dataPedidaFim);
        if (orderDate && orderDate > filterDate) return false;
      }

      return true;
    });
  }, [orders, filters, searchTerm]);

  const kpiData = useMemo((): KPIData => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const activeOrders = orders.filter(o => o.emAberto > 0);
    const delayedOrders = orders.filter(isOrderDelayed);
    
    const deliveriesThisWeek = orders.filter(o => {
      const dataPedida = parseDate(o.dataPedida);
      return dataPedida && dataPedida >= now && dataPedida <= weekFromNow && o.emAberto > 0;
    });

    const deliveriesThisMonth = orders.filter(o => {
      const dataPedida = parseDate(o.dataPedida);
      return dataPedida && dataPedida >= now && dataPedida <= monthFromNow && o.emAberto > 0;
    });

    const totalQtd = orders.reduce((sum, o) => sum + o.qtdPedida, 0);
    const completedOnTime = orders.filter(o => {
      const dataPedida = parseDate(o.dataPedida);
      const dataEnt = parseDate(o.dataEnt);
      return o.emAberto === 0 && dataPedida && dataEnt && dataEnt <= dataPedida;
    }).length;

    const completedOrders = orders.filter(o => o.emAberto === 0).length;
    const taxaCumprimento = completedOrders > 0 ? (completedOnTime / completedOrders) * 100 : 100;

    return {
      totalEncomendas: activeOrders.length,
      encomendasAtrasadas: delayedOrders.length,
      entregasEstaSemana: deliveriesThisWeek.length,
      entregasEsteMes: deliveriesThisMonth.length,
      taxaCumprimento: Math.round(taxaCumprimento),
      quantidadeProducao: orders.reduce((sum, o) => sum + o.emAberto, 0),
      quantidadeFacturada: orders.reduce((sum, o) => sum + o.facturada, 0),
      quantidadeEmAberto: orders.reduce((sum, o) => sum + o.emAberto, 0),
    };
  }, [orders]);

  const sectorStats = useMemo((): SectorStats[] => {
    return SECTORS.map(sector => {
      let quantidade = 0;
      let numeroEncomendas = 0;

      orders.forEach(order => {
        let sectorQty = 0;
        switch (sector.id) {
          case 'tecelagem':
            // Tecelagem is the first sector, we count orders that have dataTec but nothing further
            if (order.dataTec && order.felpoCru === 0 && order.emAberto > 0) {
              sectorQty = order.emAberto;
            }
            break;
          case 'felpoCru':
            sectorQty = order.felpoCru;
            break;
          case 'tinturaria':
            sectorQty = order.tinturaria;
            break;
          case 'confeccao':
            sectorQty = order.confeccaoRoupoes + order.confeccaoFelpos;
            break;
          case 'embalagem':
            sectorQty = order.embAcab;
            break;
          case 'stock':
            sectorQty = order.stockCx;
            break;
        }
        if (sectorQty > 0) {
          quantidade += sectorQty;
          numeroEncomendas++;
        }
      });

      return {
        sectorId: sector.id,
        sectorName: sector.name,
        quantidade,
        numeroEncomendas,
      };
    });
  }, [orders]);

  const clientStats = useMemo((): ClientStats[] => {
    const statsMap = new Map<string, ClientStats>();

    orders.forEach(order => {
      const existing = statsMap.get(order.terceiro);
      if (existing) {
        existing.totalEncomendas++;
        existing.quantidadeTotal += order.qtdPedida;
        existing.emAberto += order.emAberto;
      } else {
        statsMap.set(order.terceiro, {
          cliente: order.terceiro,
          totalEncomendas: 1,
          quantidadeTotal: order.qtdPedida,
          emAberto: order.emAberto,
        });
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalEncomendas - a.totalEncomendas);
  }, [orders]);

  return {
    orders,
    filteredOrders,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clients,
    families,
    kpiData,
    sectorStats,
    clientStats,
    getOrderStatus,
  };
};
