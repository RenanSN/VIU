// components/MediaGallery.tsx
'use client';

import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import { Trash, Video } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; 

// 1. Importamos o CSS Module
import styles from './MediaGallery.module.css';

interface Media {
  id: number;
  file_name: string;
  file_type: string;
  storage_path: string;
}

type GalleryProps = {
  media: Media[];
  onMediaDeleted: () => void;
};

export default function MediaGallery({ media, onMediaDeleted }: GalleryProps) {
  
  // Lógica de getPublicUrl e handleDelete (inalterada)
  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase
      .storage
      .from('media_files')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  };

  const handleDelete = async (mediaId: number, mediaName: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${mediaName}"?`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/media/${mediaId}`);
      toast.success('Mídia deletada!');
      onMediaDeleted();
    } catch (error: any) {
      toast.error(`Falha ao deletar: ${error.message}`);
    }
  };

  if (media.length === 0) {
    return <p className={styles.emptyText}>Nenhuma mídia encontrada neste grupo.</p>;
  }

  // 2. Aplicamos os estilos
  return (
    <div className={styles.grid}>
      {media.map((item) => {
        const url = getPublicUrl(item.storage_path);
        const isVideo = item.file_type.startsWith('video');

        return (
          <div key={item.id} className={styles.card}>
            <div className={styles.mediaContainer}>
              {isVideo ? (
                <div className={styles.videoPlaceholder}>
                  <Video size={40} />
                </div>
              ) : (
                <img
                  src={url}
                  alt={item.file_name}
                  className={styles.image}
                  loading="lazy"
                />
              )}
            </div>
            
            <div className={styles.cardFooter}>
              <p className={styles.fileName} title={item.file_name}>
                {item.file_name}
              </p>
            </div>
            
            <button
              onClick={() => handleDelete(item.id, item.file_name)}
              className={styles.deleteButton}
              title="Deletar mídia"
            >
              <Trash size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}