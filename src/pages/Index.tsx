import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { OrdersPage } from '@/components/orders/OrdersPage';
import { TimelinePage } from '@/components/timeline/TimelinePage';
import { ImportPage } from '@/components/import/ImportPage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { useOrdersContext } from '@/contexts/OrdersContext';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const {
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
  } = useOrdersContext();

  const delayedCount = orders.filter(o => getOrderStatus(o) === 'atrasada').length;

  const validPages = useMemo(
    () => new Set(['dashboard', 'encomendas', 'timeline', 'reports', 'import']),
    []
  );

  const normalizePage = (page: string) => {
    if (page === 'orders') return 'encomendas';
    if (page === 'gantt') return 'timeline';
    return validPages.has(page) ? page : 'dashboard';
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hashValue = window.location.hash.replace('#', '');
      setCurrentPage(normalizePage(hashValue));
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [validPages]);

  const handlePageChange = (page: string) => {
    const normalized = normalizePage(page);
    setCurrentPage(normalized);
    const nextHash = `#${normalized}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = normalized;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            kpiData={kpiData}
            sectorStats={sectorStats}
            clientStats={clientStats}
            orders={orders}
            getOrderStatus={getOrderStatus}
          />
        );
      case 'encomendas':
        return (
          <OrdersPage
            orders={filteredOrders}
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clients={clients}
            families={families}
            getOrderStatus={getOrderStatus}
          />
        );
      case 'timeline':
        return <TimelinePage />;
      case 'import':
        return <ImportPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return (
          <Dashboard
            kpiData={kpiData}
            sectorStats={sectorStats}
            clientStats={clientStats}
            orders={orders}
            getOrderStatus={getOrderStatus}
          />
        );
    }
  };

  return (
    <AppLayout 
      currentPage={currentPage} 
      onPageChange={handlePageChange}
      alertCount={delayedCount}
    >
      {renderPage()}
    </AppLayout>
  );
};

export default Index;
