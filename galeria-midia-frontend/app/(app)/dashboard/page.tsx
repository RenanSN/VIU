// app/(app)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import CreateGroupModal from '@/components/CreateGroupModal';
import GroupCard from '@/components/GroupCard';
import { Plus } from 'lucide-react';

// 1. Importamos o CSS Module
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

interface Group {
  id: number;
  name: string;
  share_code: string;
  created_at: string;
}

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/api/groups');
      setGroups(response.data);
    } catch (error: any) { // <-- Chave de abertura adicionada
      toast.error(`Falha ao buscar grupos: ${error.message}`);
    } finally { // <-- Chave de fechamento movida
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = () => {
    setIsModalOpen(false);
    toast.success('Grupo criado!');
    fetchGroups();
  };

  // 2. Aplicamos os estilos
  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Seus Grupos de Mídia</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.createButton}
        >
          <Plus size={20} />
          Criar Grupo
        </button>
      </div>

      <div className={styles.galleryContainer}>
        {isLoading && <p>Carregando grupos...</p>}
        
        {!isLoading && groups.length === 0 && (
          <p>Você ainda não tem grupos. Clique em "Criar Grupo" para começar.</p>
        )}
        
        {!isLoading && groups.length > 0 && (
          <div className={styles.grid}>
            {groups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onGroupDeleted={fetchGroups} 
              />
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}