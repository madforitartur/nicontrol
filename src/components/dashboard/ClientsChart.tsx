import { ClientStats } from '@/types/orders';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientsChartProps {
  data: ClientStats[];
  limit?: number;
}

export const ClientsChart = ({ data, limit = 6 }: ClientsChartProps) => {
  const chartData = data.slice(0, limit).map(c => ({
    name: c.cliente.length > 10 ? c.cliente.substring(0, 10) + '...' : c.cliente,
    fullName: c.cliente,
    encomendas: c.totalEncomendas,
    quantidade: c.quantidadeTotal,
  }));

  return (
    <div className="bg-card rounded-xl border p-5 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Encomendas por Cliente</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={80} 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString('pt-PT'),
                name === 'encomendas' ? 'Encomendas' : 'Quantidade'
              ]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Bar 
              dataKey="encomendas" 
              fill="hsl(var(--primary))" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
