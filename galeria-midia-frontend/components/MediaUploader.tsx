// components/MediaUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; 
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';

// 1. Importamos o CSS Module
import styles from './MediaUploader.module.css';

type UploaderProps = {
  groupId: number;
  onUploadFinished: () => void;
};

export default function MediaUploader({ groupId, onUploadFinished }: UploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de onDrop e handleUpload (inalterada)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'video/mp4': [],
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsLoading(true);
    const uploadPromises = []; 

    for (const file of files) {
      const formData = new FormData();
      formData.append('mediaFile', file);
      
      uploadPromises.push(
        apiClient.post(`/api/media/upload/${groupId}`, formData)
      );
    }
    
    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} arquivo(s) enviados com sucesso!`);
      setFiles([]); 
      onUploadFinished();
    } catch (error: any) {
      toast.error(`Falha no upload: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Aplicamos os estilos
  return (
    <div className={styles.uploaderContainer}>
      <div
        {...getRootProps()}
        // Lógica de classe para o 'isDragActive'
        className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={40} className={styles.dropzoneIcon} />
        <p className={styles.dropzoneText}>
          Arraste e solte arquivos aqui, ou clique para selecionar.
        </p>
        <p className={styles.dropzoneHint}>(PNG, JPG, GIF, MP4)</p>
      </div>
      
      {files.length > 0 && (
        <div className={styles.fileList}>
          <h4>Arquivos na fila:</h4>
          <ul>
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || isLoading}
        className={styles.uploadButton}
      >
        {isLoading ? `Enviando ${files.length}...` : `Enviar ${files.length} Arquivo(s)`}
      </button>
    </div>
  );
}