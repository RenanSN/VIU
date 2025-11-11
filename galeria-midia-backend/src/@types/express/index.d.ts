// src/@types/express/index.d.ts

// Importa os tipos do Supabase Auth
import { User } from '@supabase/supabase-js';

// Declaração de módulo para 'express-serve-static-core'
// Isso permite estender a interface Request do Express
declare module 'express-serve-static-core' {
  interface Request {
    // Adicionamos a propriedade 'user' ao Request.
    // Ela pode ser o objeto User completo do Supabase
    // ou nula se a autenticação falhar.
    user?: User | null;
  }
}