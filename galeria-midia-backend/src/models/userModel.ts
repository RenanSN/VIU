// src/models/userModel.ts

import { supabase } from '../lib/supabaseClient';

/**
 * Sincroniza o perfil do usuário.
 * * Esta função é chamada (pelo authController) logo após o frontend
 * confirmar um novo cadastro, garantindo que exista uma entrada
 * na tabela 'profiles' para o novo usuário de 'auth.users'.
 * * @param userId O ID do usuário vindo do Supabase Auth (req.user.id)
 * @param fullName O nome do usuário (vindo do req.body)
 */
export const syncUserProfile = async (userId: string, fullName: string) => {
  // Usamos 'upsert' (update or insert):
  // - Se o 'id' do usuário já existir em 'profiles', ele atualiza o 'full_name'.
  // - Se não existir, ele insere um novo registro.
  // Isso torna a função segura para ser chamada múltiplas vezes.
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId, // Chave primária (vinda de auth.users)
      full_name: fullName,
      updated_at: new Date().toISOString(), // Atualiza o timestamp
    })
    .select(); // Retorna o registro criado/atualizado

  if (error) {
    console.error('Error syncing profile:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Busca o perfil de um usuário pelo ID.
 * * @param userId O ID do usuário (req.user.id)
 */
export const getProfileById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name') // Seleciona apenas o id e o nome
    .eq('id', userId) // Onde o 'id' é igual ao userId
    .single(); // Esperamos apenas um resultado

  if (error && error.code !== 'PGRST116') {
    // PGRST116 é o código para "nenhuma linha encontrada", o que não é um erro fatal.
    console.error('Error fetching profile:', error.message);
    throw new Error(error.message);
  }
  return data;
};

/**
 * Atualiza o perfil de um usuário (ex: Módulo 6 - Configurações).
 * * @param userId O ID do usuário (req.user.id)
 * @param fullName O novo nome a ser atualizado (req.body.fullName)
 */
export const updateProfile = async (userId: string, fullName: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId) // Onde o 'id' é igual ao userId
    .select(); // Retorna o registro atualizado

  if (error) {
    console.error('Error updating profile:', error.message);
    throw new Error(error.message);
  }
  return data;
};