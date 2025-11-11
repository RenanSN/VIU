// src/controllers/profileController.ts

import { Request, Response } from 'express';
import { getProfileById, updateProfile } from '../models/userModel';

/**
 * Controller para buscar o perfil do usuário logado.
 */
export const getProfileController = async (req: Request, res: Response) => {
  try {
    // O 'authMiddleware' garante que req.user exista
    const userId = req.user!.id;
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO

    // Busca o perfil no banco de dados
    const profile = await getProfileById(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
};

/**
 * Controller para atualizar o perfil do usuário logado
 * (ex: mudar o nome).
 */
export const updateProfileController = async (req: Request, res: Response) => {
  try {
    // O 'authMiddleware' garante que req.user exista
    const userId = req.user!.id;
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO
    const { fullName } = req.body;

    if (!fullName) {
      return res.status(400).json({ error: 'fullName is required.' });
    }

    // Atualiza o perfil no banco de dados
    const updatedProfile = await updateProfile(userId, fullName);

    res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};