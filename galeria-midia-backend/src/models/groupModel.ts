// src/models/groupModel.ts

import { supabase } from '../lib/supabaseClient';
import { generateShareCode } from '../utils/generators';

/**
 * Cria um novo grupo de mídia no banco de dados.
 * @param name O nome do grupo (fornecido pelo usuário).
 * @param ownerId O ID do usuário logado (de req.user.id).
 */
export const createGroup = async (name: string, ownerId: string) => {
  // Gera um código de compartilhamento único
  const shareCode = generateShareCode();
  // NOTA: Em um sistema de produção em larga escala,
  // deveríamos verificar se o shareCode já existe e gerar um
  // novo em loop, mas para este caso, a chance de colisão
  // com 8 caracteres é astronomicamente baixa.

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: name,
      owner_id: ownerId,
      share_code: shareCode,
    })
    .select() // Retorna o grupo recém-criado
    .single(); // Esperamos apenas um

  if (error) {
    console.error('Error creating group:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Busca todos os grupos pertencentes a um usuário.
 * @param ownerId O ID do usuário logado.
 */
export const getGroupsByOwner = async (ownerId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, share_code, created_at') // Seleciona os campos
    .eq('owner_id', ownerId) // Onde o dono é o usuário
    .order('created_at', { ascending: false }); // Mais recentes primeiro

  if (error) {
    console.error('Error fetching groups:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Busca um grupo específico pelo ID, incluindo suas mídias.
 * Esta função também verifica a propriedade.
 * @param groupId O ID do grupo.
 * @param userId O ID do usuário logado (para verificação de propriedade).
 */
export const getGroupById = async (groupId: number, userId: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      share_code,
      owner_id,
      media ( id, file_name, file_type, storage_path )
    `) // "media (...)" faz um JOIN na tabela 'media'
    .eq('id', groupId)
    .eq('owner_id', userId) // GARANTE QUE O USUÁRIO É O DONO
    .single(); // Esperamos um resultado

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum registro encontrado (ou o ID está errado ou o usuário não é o dono)
      throw new Error('Group not found or access denied.');
    }
    console.error('Error fetching group details:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Exclui um grupo.
 * Esta função também verifica a propriedade.
 * @param groupId O ID do grupo.
 * @param userId O ID do usuário logado (para verificação de propriedade).
 */
export const deleteGroup = async (groupId: number, userId: string) => {
  
  // 1. PRIMEIRO, verificar se o usuário é o dono do grupo
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .eq('owner_id', userId) // Verifica a propriedade AQUI
    .single();

  if (groupError || !group) {
    // Se o grupo não for encontrado ou o usuário não for o dono
    throw new Error('Group not found or access denied.');
  }

  // 2. AGORA, buscar as mídias do grupo (sem checagem de owner_id aqui)
  const { data: mediaFiles, error: mediaError } = await supabase
    .from('media')
    .select('storage_path')
    .eq('group_id', groupId); // Apenas pelo ID do grupo

  if (mediaError) {
    console.error('Error fetching media paths for deletion:', mediaError.message);
    throw new Error(mediaError.message);
  }

  // 3. Deletar os arquivos do Storage (se houver)
  if (mediaFiles && mediaFiles.length > 0) {
    const filePaths = mediaFiles.map(file => file.storage_path);
    
    const { error: storageError } = await supabase
      .storage
      .from('media_files') // Nome do nosso bucket
      .remove(filePaths);

    if (storageError) {
      console.error('Error deleting files from storage:', storageError.message);
      // Continua mesmo com erro de storage, para deletar do DB
    }
  }

  // 4. Deletar o grupo do banco de dados
  // O 'ON DELETE CASCADE' do nosso SQL (Parte 1) vai
  // cuidar de deletar as 'media', 'analytics_sessions', etc.
  const { error: dbError } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('owner_id', userId); // Dupla checagem de segurança

  if (dbError) {
    console.error('Error deleting group:', dbError.message);
    throw new Error(dbError.message);
  }

  return { message: 'Group and associated media deleted successfully.' };
};