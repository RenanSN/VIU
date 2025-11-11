// lib/apiClient.ts

import axios from 'axios';
import { supabase } from './supabaseClient'; // Importamos o cliente Supabase

// 1. Cria a instância do Axios com a URL base da nossa API
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

/*
 * Interceptor do Axios (Magia do Lado do Cliente)
 * * 'interceptors.request' executa uma função ANTES de
 * CADA requisição que o 'apiClient' fizer.
 *
 * * Isso é perfeito para anexar dinamicamente o token de
 * autenticação em todas as chamadas para nossa API protegida.
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Pega a sessão ATUAL do Supabase (que gerencia o JWT)
    const { data: { session }, error } = await supabase.auth.getSession();

    // 2. Se o usuário estiver logado (tiver uma sessão)
    if (session) {
      // 3. Anexa o token de acesso (JWT) ao cabeçalho 'Authorization'
      //    Nosso 'authMiddleware' no backend (Parte 2) está
      //    esperando por isso!
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    // Libera a requisição para continuar
    return config;
  },
  (error) => {
    // Se houver erro ao configurar o interceptor
    return Promise.reject(error);
  }
);

export default apiClient;