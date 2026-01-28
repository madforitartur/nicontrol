import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OrderFilter, OrderStatus } from '@/types/orders';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface OrderFiltersProps {
  filters: OrderFilter;
  setFilters: (filters: OrderFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clients: string[];
  families: string[];
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'em_producao', label: 'Em Produção' },
  { value: 'concluida', label: 'Concluídas' },
  { value: 'atrasada', label: 'Atrasadas' },
  { value: 'facturada', label: 'Facturadas' },
  { value: 'em_aberto', label: 'Em Aberto' },
];

export const OrderFilters = ({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  clients,
  families,
}: OrderFiltersProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return (
    <div className="bg-card rounded-xl border p-4 shadow-card space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar documento, cliente, PO, referência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Client Filter */}
        <Select
          value={filters.cliente || 'all'}
          onValueChange={(value) => setFilters({ ...filters, cliente: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client} value={client}>
                {client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as OrderStatus })}
        >
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">Todos os estados</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters Toggle */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>

          {(hasActiveFilters || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>

        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PO Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">PO / Referência Cliente</label>
              <Input
                placeholder="Pesquisar PO..."
                value={filters.po || ''}
                onChange={(e) => setFilters({ ...filters, po: e.target.value || undefined })}
                className="bg-background"
              />
            </div>

            {/* Family Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Família</label>
              <Select
                value={filters.familia || 'all'}
                onValueChange={(value) => setFilters({ ...filters, familia: value === 'all' ? undefined : value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Todas as famílias" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">Todas as famílias</SelectItem>
                  {families.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Number Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nr. Documento</label>
              <Input
                placeholder="Pesquisar documento..."
                value={filters.nrDocumento || ''}
                onChange={(e) => setFilters({ ...filters, nrDocumento: e.target.value || undefined })}
                className="bg-background"
              />
            </div>

            {/* Reference Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Referência</label>
              <Input
                placeholder="Pesquisar referência..."
                value={filters.referencia || ''}
                onChange={(e) => setFilters({ ...filters, referencia: e.target.value || undefined })}
                className="bg-background"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
