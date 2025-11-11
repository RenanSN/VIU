// components/GroupCard.tsx
'use client';

import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import { Eye, Trash, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 1. Importamos o CSS Module
import styles from './GroupCard.module.css';

interface Group {
  id: number;
  name: string;
  share_code: string;
  created_at: string;
}

type GroupCardProps = {
  group: Group;
  onGroupDeleted: () => void;
};

export default function GroupCard({ group, onGroupDeleted }: GroupCardProps) {
  const router = useRouter();
  
  // Lógica de delete (inalterada)
  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja deletar o grupo "${group.name}"?`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/groups/${group.id}`);
      toast.success('Grupo deletado!');
      onGroupDeleted(); 
    } catch (error: any) {
      toast.error(`Falha ao deletar: ${error.message}`);
    }
  };

  // Lógica de copiar (inalterada)
  const copyShareCode = () => {
    const shareUrl = `${window.location.origin}/tv?code=${group.share_code}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('URL de compartilhamento copiada!');
  };

  // 2. Aplicamos os estilos
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <Link href={`/midias/${group.id}`}>
            {group.name}
          </Link>
        </h3>
        <p className={styles.cardDate}>
          Criado em: {new Date(group.created_at).toLocaleDateString('pt-BR')}
        </p>
        <div className={styles.shareCode}>
          <span>Código:</span>
          <strong>{group.share_code}</strong>
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <button
          onClick={copyShareCode}
          title="Copiar link (para /tv)"
          className={`${styles.footerButton} ${styles.copyButton}`}
        >
          <Copy size={16} /> Copiar
        </button>
        <button
          onClick={() => router.push(`/midias/${group.id}`)}
          title="Gerenciar mídias"
          className={`${styles.footerButton} ${styles.manageButton}`}
        >
          <Eye size={16} /> Gerenciar
        </button>
        <button
          onClick={handleDelete}
          title="Deletar grupo"
          className={`${styles.footerButton} ${styles.deleteButton}`}
        >
          <Trash size={16} /> Deletar
        </button>
      </div>
    </div>
  );
}