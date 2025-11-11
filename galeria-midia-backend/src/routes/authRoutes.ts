// src/routes/authRoutes.ts

import { Router } from 'express';
import { syncProfileController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

// Criamos um novo roteador
const router = Router();

/*
 * Rota: POST /api/auth/sync
 * Propósito: Sincronizar o perfil do usuário (criar na tabela 'profiles')
 * Proteção: Requer autenticação (authMiddleware)
 *
 * O frontend chamará esta rota após o cadastro (com o nome do usuário)
 * para criar a entrada correspondente na tabela 'profiles'.
 */
router.post('/sync', authMiddleware, syncProfileController);

// Exportamos o roteador
export default router;