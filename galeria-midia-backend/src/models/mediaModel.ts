// src/models/mediaModel.ts

import { supabase } from '../lib/supabaseClient';

/**
 * Adiciona os metadados de uma nova mídia ao banco de dados.
 * @param groupId O ID do grupo onde a mídia será adicionada.
 * @param fileName O nome original do arquivo.
 * @param fileType O MIME type (ex: 'image/png').
 * @param storagePath O caminho completo do arquivo no Supabase Storage.
 * @param userId O ID do usuário (para verificação de propriedade do grupo).
 */
export const addMedia = async (
  groupId: number,
  fileName: string,
  fileType: string,
  storagePath: string,
  userId: string,
) => {
  // 1. Verifica se o usuário é o dono do grupo
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .eq('owner_id', userId)
    .single();

  if (groupError || !group) {
    throw new Error('Group not found or access denied.');
  }

  // 2. Se for o dono, insere os metadados da mídia
  const { data, error: mediaError } = await supabase
    .from('media')
    .insert({
      group_id: groupId,
      file_name: fileName,
      file_type: fileType,
      storage_path: storagePath,
    })
    .select()
    .single();
  
  if (mediaError) {
    console.error('Error adding media to database:', mediaError.message);
    throw new Error(mediaError.message);
  }
  return data;
};

/**
 * Exclui um arquivo de mídia (do Storage e do Banco de Dados).
 * @param mediaId O ID da mídia a ser excluída.
 * @param userId O ID do usuário logado (para verificação de propriedade).
 */
export const deleteMedia = async (mediaId: number, userId: string) => {
  // 1. Busca os metadados da mídia E verifica se o usuário é o dono
  //    Fazemos um JOIN com a tabela 'groups' para checar o 'owner_id'
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select(`
      id,
      storage_path,
      group:groups ( owner_id )
    `)
    .eq('id', mediaId)
    .single();

  if (fetchError || !media) {
    throw new Error('Media not found.');
  }

  // 2. Verifica a propriedade
  // @ts-ignore (O Supabase retorna 'group' como um objeto se o JOIN for bem-sucedido)
  if (!media.group || media.group.owner_id !== userId) {
    throw new Error('Access denied. You are not the owner of this media.');
  }

  // 3. Exclui o arquivo do Supabase Storage
  const { error: storageError } = await supabase
    .storage
    .from('media_files') // Nome do nosso bucket
    .remove([media.storage_path]); // .remove() espera um array de paths
  
  if (storageError) {
    // Loga o erro, mas continua para deletar do banco
    console.error('Error deleting file from storage:', storageError.message);
    // Pode ser um erro "File not found", o que não é crítico.
  }

  // 4. Exclui os metadados do banco de dados
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId);
  
  if (dbError) {
    console.error('Error deleting media from database:', dbError.message);
    throw new Error(dbError.message);
  }

  return { message: 'Media deleted successfully.' };
};