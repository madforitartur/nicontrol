// Order Management System Types

export interface Order {
  id: string;
  nrDocumento: string;
  cliente: string;
  dataEmissao: string;
  dataPedida: string;
  item: number;
  po: string;
  codArtigo: string;
  referencia: string;
  cor: string;
  descricaoCor: string;
  tam: string;
  familia: string;
  descricaoTam: string;
  ean: string;
  qtdPedida: number;
  dataTec: string;
  felpoCru: number;
  dataFelpoCru: string;
  tinturaria: number;
  dataTint: string;
  confeccaoRoupoes: number;
  confeccaoFelpos: number;
  dataConf: string;
  embAcab: number;
  dataArmExp: string;
  stockCx: number;
  dataEnt: string;
  dataEspecial: string;
  dataPrinter: string;
  dataDebuxo: string;
  dataAmostras: string;
  dataBordados: string;
  facturada: number;
  emAberto: number;
}

export type SectorType = 
  | 'tecelagem' 
  | 'felpoCru' 
  | 'tinturaria' 
  | 'confeccao' 
  | 'embalagem' 
  | 'stock';

export interface Sector {
  id: SectorType;
  name: string;
  shortName: string;
  color: string;
  order: number;
}

export const SECTORS: Sector[] = [
  { id: 'tecelagem', name: 'Tecelagem', shortName: 'TEC', color: 'tecelagem', order: 1 },
  { id: 'felpoCru', name: 'Felpo Cru', shortName: 'FC', color: 'felpo', order: 2 },
  { id: 'tinturaria', name: 'Tinturaria', shortName: 'TINT', color: 'tinturaria', order: 3 },
  { id: 'confeccao', name: 'Confecção', shortName: 'CONF', color: 'confeccao', order: 4 },
  { id: 'embalagem', name: 'Emb./Acabamento', shortName: 'EMB', color: 'embalagem', order: 5 },
  { id: 'stock', name: 'Stock/Expedição', shortName: 'STK', color: 'stock', order: 6 },
];

export type OrderStatus = 'em_producao' | 'concluida' | 'atrasada' | 'facturada' | 'em_aberto';

export interface OrderFilter {
  cliente?: string;
  nrDocumento?: string;
  po?: string;
  dataEmissaoInicio?: string;
  dataEmissaoFim?: string;
  dataPedidaInicio?: string;
  dataPedidaFim?: string;
  familia?: string;
  referencia?: string;
  status?: OrderStatus;
}

export interface KPIData {
  totalEncomendas: number;
  encomendasAtrasadas: number;
  entregasEstaSemana: number;
  entregasEsteMes: number;
  taxaCumprimento: number;
  quantidadeProducao: number;
  quantidadeFacturada: number;
  quantidadeEmAberto: number;
}

export interface SectorStats {
  sectorId: SectorType;
  sectorName: string;
  quantidade: number;
  numeroEncomendas: number;
}

export interface ClientStats {
  cliente: string;
  totalEncomendas: number;
  quantidadeTotal: number;
  emAberto: number;
}
