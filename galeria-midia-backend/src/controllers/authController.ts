// src/controllers/authController.ts

import { Request, Response } from 'express';
import { syncUserProfile } from '../models/userModel';

/**
 * Controller para sincronizar o perfil do usuário.
 * * Espera-se que o frontend chame esta rota (POST /api/auth/sync)
 * imediatamente após um novo usuário se cadastrar com sucesso.
 */
export const syncProfileController = async (req: Request, res: Response) => {
  try {
    // 1. O 'authMiddleware' já validou o token e nos deu 'req.user'
    const user = req.user;
    
    // 2. O usuário deve estar logado para sincronizar
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // 3. Pegamos o 'fullName' do corpo da requisição
    const { fullName } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: 'fullName is required.' });
    }

    // 4. Chamamos o Model para fazer o 'upsert' no banco
    const profile = await syncUserProfile(user.id, fullName);

    res.status(201).json({ message: 'Profile synced successfully', profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync profile', details: error.message });
  }
};