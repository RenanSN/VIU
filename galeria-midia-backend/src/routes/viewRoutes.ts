// src/routes/viewRoutes.ts

import { Router } from 'express';
import * as viewController from '../controllers/viewController';

const router = Router();

/*
 * Rota: GET /api/view/:shareCode
 * Propósito: Rota PÚBLICA para a tela /tv buscar as mídias.
 *
 * * IMPORTANTE: Esta rota NÃO USA o 'authMiddleware'
 * de propósito.
 */
router.get('/:shareCode', viewController.getViewController);

export default router;