// src/lib/multerConfig.ts

import multer from 'multer';

/**
 * Configuração do Multer para Upload de Mídia.
 *
 * * Usamos 'multer.memoryStorage()' para armazenar o arquivo
 * temporariamente na memória (RAM) como um Buffer.
 *
 * * Isso é ideal para ambientes de servidor "sem estado" (stateless)
 * como o Render, pois não precisamos salvar o arquivo em disco
 * antes de enviá-lo para o Supabase Storage.
 *
 * * Definimos um limite de tamanho de arquivo (ex: 100MB) para
 * evitar abusos e sobrecarga de memória.
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    // Limite de 100 Megabytes por arquivo
    fileSize: 100 * 1024 * 1024, 
  },
});

export default upload;