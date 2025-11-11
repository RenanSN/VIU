// components/ActiveSessionsCard.tsx

// Importamos os estilos (reutilizamos os do analytics)
import styles from '@/app/(app)/analytics/analytics.module.css';

type Props = {
  count: number;
};

export default function ActiveSessionsCard({ count }: Props) {
  return (
    <div className={styles.kpiCard}>
      <h3 className={styles.kpiLabel}>Sessões Ativas (Últimos 5 min)</h3>
      <p className={styles.kpiValue}>{count}</p>
    </div>
  );
}