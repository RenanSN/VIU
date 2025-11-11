// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
// Importamos nosso cliente Supabase (modo admin)
import { supabase } from '../lib/supabaseClient';

/**
 * Middleware de Autenticação
 * * Verifica o token JWT (Bearer Token) enviado no cabeçalho Authorization
 * de cada requisição.
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Pega o token do cabeçalho "Authorization"
    const authHeader = req.headers.authorization;

    // 2. Verifica se o cabeçalho existe
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided.' });
    }

    // 3. O token vem no formato "Bearer <token>"
    //    Então, separamos o "Bearer" do token em si.
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    // 4. Valida o token usando o Supabase
    //    O supabase.auth.getUser(token) verifica o JWT e retorna
    //    os dados do usuário se o token for válido.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // 5. Se houver erro ou o usuário não for encontrado
    if (error) {
      console.error('Error validating token:', error.message);
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'User not found for this token.' });
    }

    // 6. SUCESSO! Anexa o objeto 'user' ao objeto 'req'
    //    Agora, todos os próximos controllers/rotas
    //    terão acesso a 'req.user'.
    req.user = user;

    // 7. Passa para o próximo middleware ou controller
    next();
  } catch (error) {
    console.error('Unhandled error in auth middleware:', error);
    res.status(500).json({ error: 'Internal server error in authentication.' });
  }
};