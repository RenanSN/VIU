// app/(app)/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

// Importamos nossos componentes de visualização
import ActiveSessionsCard from '@/components/ActiveSessionsCard';
import MediaEngagementChart from '@/components/MediaEngagementChart';

// Importamos os estilos
import styles from './analytics.module.css';

export const dynamic = 'force-dynamic';

// O tipo de dados que esperamos do backend
interface DashboardData {
  active_sessions_count: number;
  media_engagement: {
    name: string;
    total_ms: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lógica de fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/analytics/dashboard');
        setData(response.data);
      } catch (error: any) {
        toast.error(`Falha ao buscar dados: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return <p>Carregando dados do dashboard...</p>;
  }

  if (!data) {
    return <p>Não foi possível carregar os dados.</p>;
  }

  // Converte milissegundos para um formato legível (Minutos)
  const chartData = data.media_engagement.map(item => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    Minutos: parseFloat((item.total_ms / 1000 / 60).toFixed(2)),
  }));

  return (
    <div>
      <h1 className={styles.title}>Dashboard de Analytics</h1>
      
      {/* 1. KPIs (Indicadores) */}
      <div className={styles.kpiGrid}>
        <ActiveSessionsCard count={data.active_sessions_count} />
        {/* Adicione mais cards aqui (ex: Total de Views) */}
      </div>

      {/* 2. Gráfico de Engajamento */}
      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Engajamento por Mídia (Total de Minutos Vistos)</h2>
        <div className={styles.chartWrapper}>
          <MediaEngagementChart data={chartData} />
        </div>
      </div>
    </div>
  );
}