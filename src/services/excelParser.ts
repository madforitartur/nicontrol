import * as XLSX from 'xlsx';
import { Order } from '@/types/orders';

export interface ParseResult {
  success: boolean;
  orders: Order[];
  errors: ValidationError[];
  warnings: string[];
  totalRows: number;
  validRows: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

// Column mapping from Excel headers to Order properties
const COLUMN_MAPPING: Record<string, keyof Order> = {
  'Nr.Documento': 'nrDocumento',
  'Cliente': 'cliente',
  'Data Emissão': 'dataEmissao',
  'Data Pedida': 'dataPedida',
  'Item': 'item',
  'PO': 'po',
  'Cod.Artigo': 'codArtigo',
  'Referencia': 'referencia',
  'Cor': 'cor',
  'Descricao': 'descricaoCor', // First occurrence maps to descricaoCor
  'Tam': 'tam',
  'Familia': 'familia',
  'EAN': 'ean',
  'Qtd Pedida': 'qtdPedida',
  'Data Tec.': 'dataTec',
  'Felpo Cru': 'felpoCru',
  'Data F.Cru': 'dataFelpoCru',
  'Tinturaria': 'tinturaria',
  'Data Tint.': 'dataTint',
  'Confeccao Roupoes': 'confeccaoRoupoes',
  'Confeccao Felpos': 'confeccaoFelpos',
  'Data Conf.': 'dataConf',
  'Emb./Acab.': 'embAcab',
  'Data Arm. Exp.': 'dataArmExp',
  'Stock Cx.': 'stockCx',
  'Data Ent.': 'dataEnt',
  'Data Especial.': 'dataEspecial',
  'Data Printer.': 'dataPrinter',
  'Data Debuxo.': 'dataDebuxo',
  'Data Amostras.': 'dataAmostras',
  'Data Bordados.': 'dataBordados',
  'Facturada': 'facturada',
  'Em Aberto': 'emAberto',
};

// Required fields that must have values
const REQUIRED_FIELDS: (keyof Order)[] = ['nrDocumento', 'cliente', 'qtdPedida'];

// Numeric fields that should be parsed as numbers
const NUMERIC_FIELDS: (keyof Order)[] = [
  'item', 'qtdPedida', 'felpoCru', 'tinturaria', 
  'confeccaoRoupoes', 'confeccaoFelpos', 'embAcab', 
  'stockCx', 'facturada', 'emAberto'
];

// Date fields that need formatting
const DATE_FIELDS: (keyof Order)[] = [
  'dataEmissao', 'dataPedida', 'dataTec', 'dataFelpoCru',
  'dataTint', 'dataConf', 'dataArmExp', 'dataEnt',
  'dataEspecial', 'dataPrinter', 'dataDebuxo', 
  'dataAmostras', 'dataBordados'
];

/**
 * Formats an Excel date value to DD/MM/YYYY string
 */
const formatExcelDate = (value: unknown): string => {
  if (!value) return '';
  
  // If it's already a string in date format, return it
  if (typeof value === 'string') {
    // Check if it matches DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return value;
    }
    // Try parsing other date string formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
    return value;
  }
  
  // If it's a number, Excel stores dates as days since 1899-12-30
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
    }
  }
  
  return '';
};

/**
 * Parse a numeric value from Excel
 */
const parseNumeric = (value: unknown): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Create column index mapping from headers
 */
const createColumnMapping = (headers: string[]): Map<number, keyof Order> => {
  const mapping = new Map<number, keyof Order>();
  let descricaoCount = 0;
  
  headers.forEach((header, index) => {
    const trimmedHeader = header?.trim();
    if (!trimmedHeader) return;
    
    // Special handling for duplicate "Descricao" columns
    if (trimmedHeader === 'Descricao') {
      descricaoCount++;
      if (descricaoCount === 1) {
        mapping.set(index, 'descricaoCor');
      } else if (descricaoCount === 2) {
        mapping.set(index, 'descricaoTam');
      }
      return;
    }
    
    const orderKey = COLUMN_MAPPING[trimmedHeader];
    if (orderKey) {
      mapping.set(index, orderKey);
    }
  });
  
  return mapping;
};

/**
 * Validate a single order row
 */
const validateOrder = (order: Partial<Order>, rowNumber: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    const value = order[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        row: rowNumber,
        field,
        message: `Campo obrigatório "${field}" está vazio`,
      });
    }
  }
  
  // Validate numeric fields are non-negative
  for (const field of NUMERIC_FIELDS) {
    const value = order[field] as number | undefined;
    if (value !== undefined && value < 0) {
      errors.push({
        row: rowNumber,
        field,
        message: `Campo "${field}" não pode ser negativo`,
        value: String(value),
      });
    }
  }
  
  // Validate quantity consistency
  if (order.qtdPedida !== undefined && order.emAberto !== undefined && order.facturada !== undefined) {
    const total = (order.emAberto || 0) + (order.facturada || 0);
    if (total > (order.qtdPedida || 0) * 1.1) { // Allow 10% tolerance
      errors.push({
        row: rowNumber,
        field: 'emAberto',
        message: `Soma de "Em Aberto" + "Facturada" excede "Qtd Pedida"`,
        value: `${order.emAberto} + ${order.facturada} > ${order.qtdPedida}`,
      });
    }
  }
  
  return errors;
};

/**
 * Parse Excel file and return orders with validation results
 */
export const parseExcelFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', codepage: 28591 }); // ISO-8859-1
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1,
          raw: false,
          defval: '',
        }) as unknown[][];
        
        if (jsonData.length < 2) {
          resolve({
            success: false,
            orders: [],
            errors: [{ row: 0, field: 'file', message: 'Ficheiro vazio ou sem dados válidos' }],
            warnings: [],
            totalRows: 0,
            validRows: 0,
          });
          return;
        }
        
        // First row is headers
        const headers = jsonData[0] as string[];
        const columnMapping = createColumnMapping(headers);
        
        const orders: Order[] = [];
        const errors: ValidationError[] = [];
        const warnings: string[] = [];
        
        // Check for missing expected columns
        const mappedColumns = new Set(columnMapping.values());
        const missingRequired = REQUIRED_FIELDS.filter(f => !mappedColumns.has(f));
        if (missingRequired.length > 0) {
          warnings.push(`Colunas obrigatórias não encontradas: ${missingRequired.join(', ')}`);
        }
        
        // Process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as unknown[];
          
          // Skip empty rows
          if (!row || row.length === 0 || row.every(cell => !cell)) {
            continue;
          }
          
          const order: Partial<Order> = {
            id: String(i), // Generate unique ID
          };
          
          // Map columns to order properties
          columnMapping.forEach((orderKey, colIndex) => {
            const value = row[colIndex];
            
            if (NUMERIC_FIELDS.includes(orderKey)) {
              (order as Record<string, unknown>)[orderKey] = parseNumeric(value);
            } else if (DATE_FIELDS.includes(orderKey)) {
              (order as Record<string, unknown>)[orderKey] = formatExcelDate(value);
            } else {
              (order as Record<string, unknown>)[orderKey] = value?.toString().trim() || '';
            }
          });
          
          // Validate order
          const rowErrors = validateOrder(order, i + 1);
          
          if (rowErrors.length === 0) {
            orders.push(order as Order);
          } else {
            errors.push(...rowErrors);
          }
        }
        
        resolve({
          success: errors.length === 0,
          orders,
          errors,
          warnings,
          totalRows: jsonData.length - 1,
          validRows: orders.length,
        });
        
      } catch (error) {
        resolve({
          success: false,
          orders: [],
          errors: [{ 
            row: 0, 
            field: 'file', 
            message: `Erro ao processar ficheiro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
          }],
          warnings: [],
          totalRows: 0,
          validRows: 0,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        orders: [],
        errors: [{ row: 0, field: 'file', message: 'Erro ao ler o ficheiro' }],
        warnings: [],
        totalRows: 0,
        validRows: 0,
      });
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Validate file before parsing
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const validExtensions = ['.xls', '.xlsx'];
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: `Formato de ficheiro inválido. Use ${validExtensions.join(' ou ')}` 
    };
  }
  
  // Max file size: 50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Ficheiro demasiado grande. Tamanho máximo: 50MB' 
    };
  }
  
  return { valid: true };
};
