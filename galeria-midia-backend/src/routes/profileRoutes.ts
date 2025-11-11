// src/routes/profileRoutes.ts

import { Router } from 'express';
import { getProfileController, updateProfileController } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/*
 * Todas as rotas neste arquivo exigem autenticação.
 * Poderíamos usar o middleware em cada rota...
 * router.get('/', authMiddleware, getProfileController);
 *
 * ... ou podemos usar o 'router.use()' para aplicar o middleware
 * a TODAS as rotas definidas neste arquivo.
 */
router.use(authMiddleware);

/*
 * Rota: GET /api/profile
 * Propósito: Busca os dados de perfil (nome) do usuário logado.
 */
router.get('/', getProfileController);

/*
 * Rota: PUT /api/profile
 * Propósito: Atualiza os dados de perfil (nome) do usuário logado.
 */
router.put('/', updateProfileController);

export default router;