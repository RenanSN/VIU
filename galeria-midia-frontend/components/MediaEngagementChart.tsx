// components/MediaEngagementChart.tsx
'use client'; // Recharts é uma biblioteca de cliente

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

// Os dados que esperamos (formatados pelo 'page.tsx')
type ChartProps = {
  data: {
    name: string;
    Minutos: number;
  }[];
};

export default function MediaEngagementChart({ data }: ChartProps) {
  return (
    // O ResponsiveContainer faz o gráfico se adaptar
    // ao tamanho do 'chartWrapper'
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis 
          dataKey="name" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          unit="m"
        />
        <Tooltip
          formatter={(value) => [`${value} min`, "Tempo total"]}
          cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} // Cor do hover
        />
        <Legend />
        <Bar 
          dataKey="Minutos" 
          fill="#2563eb" // Cor da barra
          radius={[4, 4, 0, 0]} // Cantos arredondados
        />
      </BarChart>
    </ResponsiveContainer>
  );
}