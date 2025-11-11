// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Obtém a URL e a Service Role Key do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação: Garante que as variáveis de ambiente foram carregadas
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key are not defined in .env');
}

/*
 * Criação do Cliente Supabase (Modo Servidor)
 * * Usamos a 'supabaseServiceKey' aqui. Isso dá ao nosso backend
 * privilégios de administrador (bypass RLS) para realizar
 * operações que um usuário comum não poderia, como consultar
 * tabelas de analytics ou gerenciar dados de usuários.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // É importante desabilitar o auto-refresh e a persistência
    // em um ambiente de servidor (backend)
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('Supabase service client initialized.');