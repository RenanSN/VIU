// src/routes/groupRoutes.ts

import { Router } from 'express';
import * as groupController from '../controllers/groupController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Aplicamos o middleware de autenticação a TODAS as rotas de grupo.
// Ninguém pode gerenciar grupos sem estar logado.
router.use(authMiddleware);

// Rota: POST /api/groups
// Propósito: Criar um novo grupo.
router.post('/', groupController.createGroupController);

// Rota: GET /api/groups
// Propósito: Listar todos os grupos do usuário logado.
router.get('/', groupController.getGroupsController);

// Rota: GET /api/groups/:id
// Propósito: Ver os detalhes de um grupo específico (e suas mídias).
router.get('/:id', groupController.getGroupByIdController);

// Rota: DELETE /api/groups/:id
// Propósito: Excluir um grupo (e todas as suas mídias).
router.delete('/:id', groupController.deleteGroupController);

export default router;