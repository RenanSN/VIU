// src/controllers/mediaController.ts

import { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';
import * as mediaModel from '../models/mediaModel';

/**
 * Controller para fazer upload de um novo arquivo de mídia.
 * * Recebe o arquivo via 'multer' (em req.file).
 */
export const uploadMediaController = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user!.id;
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f';
    const file = req.file;

    // 1. Validações
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID.' });
    }
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // 2. Pega a extensão do arquivo (ex: "png")
    const fileExt = file.originalname.split('.').pop() || 'dat';
    
    // 3. Pega o nome base e sanitiza (limpa)
    const baseName = file.originalname
      .replace(new RegExp(`\\.${fileExt}$`), '') // Remove a extensão do nome
      .replace(/[^a-zA-Z0-9-]/g, '_');    // Substitui TUDO que NÃO é letra, número ou hífen por um underscore '_'

    // 4. Limita o nome base (ex: 50 caracteres) para evitar paths muito longos
    const sanitizedBaseName = baseName.substring(0, 50);

    // 5. Cria o nome final e o caminho para o storage
    //    Ex: "1678886400000_Screenshot_2025-10-14_at_18-44-01_(11)_O_Maestro.png"
    const fileName = `${Date.now()}_${sanitizedBaseName}.${fileExt}`;
    const storagePath = `public/${userId}/${groupId}/${fileName}`;
    
    // 6. Faz o upload do buffer (do multer) para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('media_files') // Nome do nosso bucket
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 7. Salva os metadados no nosso banco (tabela 'media')
    //    Note que aqui salvamos o 'file.originalname' (o nome bonito)
    //    e não o 'fileName' (o nome sanitizado).
    const newMedia = await mediaModel.addMedia(
      groupId,
      file.originalname, // Salva o nome original (bonito)
      file.mimetype,
      storagePath, // Salva o path único do storage (sanitizado)
      userId,
    );

    res.status(201).json(newMedia);
  } catch (error: any) {
    // Agora, se houver um erro, ele será mais específico
    console.error('Detailed upload error:', error);
    res.status(500).json({ error: 'Failed to upload media', details: error.message });
  }
};

/**
 * Controller para excluir um arquivo de mídia.
 */
export const deleteMediaController = async (req: Request, res: Response) => {
  try {
    const mediaId = parseInt(req.params.mediaId, 10);
    const userId = req.user!.id;
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f';

    if (isNaN(mediaId)) {
      return res.status(400).json({ error: 'Invalid media ID.' });
    }

    const result = await mediaModel.deleteMedia(mediaId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message.includes('Access denied') || error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete media', details: error.message });
  }
};