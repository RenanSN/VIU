// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Pega as variáveis de ambiente públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validação
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key are not defined in .env.local');
}

/*
 * Cliente Supabase (Modo Frontend)
 * * Usamos a 'supabaseAnonKey'. Esta chave é pública e segura
 * para ser exposta no navegador.
 * * Ela permite que o Supabase gerencie a autenticação do usuário
 * e só acesse dados do banco se tivermos 'Policies' (RLS)
 * que permitam.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);