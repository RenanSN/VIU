// app/(app)/midias/[groupId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import MediaUploader from '@/components/MediaUploader';
import MediaGallery from '@/components/MediaGallery';

// 1. Importamos o CSS Module
import styles from './media.module.css';

export const dynamic = 'force-dynamic';

interface Media {
  id: number;
  file_name: string;
  file_type: string;
  storage_path: string;
}
interface GroupDetails {
  id: number;
  name: string;
  share_code: string;
  media: Media[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lógica de fetch (inalterada)
  const fetchGroupDetails = async () => {
    if (!groupId) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/api/groups/${groupId}`);
      setGroup(response.data);
    } catch (error: any) {
      toast.error(`Falha ao buscar detalhes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]); 

  const onDataChanged = () => {
    toast.success('Galeria atualizada!');
    fetchGroupDetails();
  };

  if (isLoading) {
    return <p>Carregando detalhes do grupo...</p>;
  }

  if (!group) {
    return <p>Grupo não encontrado.</p>;
  }

  // 2. Aplicamos os estilos
  return (
    <div>
      <h1 className={styles.title}>{group.name}</h1>
      <p className={styles.subtitle}>
        Gerencie as mídias do seu grupo.
      </p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Fazer Upload</h2>
        <MediaUploader 
          groupId={group.id} 
          onUploadFinished={onDataChanged} 
        />
      </div>
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Mídias Carregadas</h2>
        <MediaGallery 
          media={group.media} 
          onMediaDeleted={onDataChanged} 
        />
      </div>
    </div>
  );
}