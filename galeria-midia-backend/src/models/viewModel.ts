// src/models/viewModel.ts

import { supabase } from '../lib/supabaseClient';

/**
 * Busca um grupo e suas mídias usando o 'share_code'.
 * Esta é uma função pública, não verifica o 'owner_id'.
 * @param shareCode O código de 8 caracteres.
 */
export const getMediaByShareCode = async (shareCode: string) => {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      media ( id, file_name, file_type, storage_path )
    `)
    .eq('share_code', shareCode) // Busca pelo código de compartilhamento
    .single(); // Esperamos apenas um

  if (error) {
    if (error.code === 'PGRST116') {
      // Código PGRST116 = Nenhuma linha encontrada
      throw new Error('Group not found. Invalid code.');
    }
    console.error('Error fetching group by share code:', error.message);
    throw new Error(error.message);
  }
  return data;
};