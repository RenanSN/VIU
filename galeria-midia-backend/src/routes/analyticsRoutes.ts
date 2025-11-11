// src/routes/analyticsRoutes.ts

import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/*
 * ========================================
 * Rotas PÚBLICAS (chamadas pela tela /tv)
 * ========================================
 */

// Rota: POST /api/analytics/start
// Propósito: Iniciar uma sessão de visualização.
router.post('/start', analyticsController.startSessionController);

// Rota: POST /api/analytics/end
// Propósito: Encerrar uma sessão de visualização.
router.post('/end', analyticsController.endSessionController);

// Rota: POST /api/analytics/events
// Propósito: Enviar "pings" de eventos de visibilidade.
router.post('/events', analyticsController.recordEventsController);

/*
 * ========================================
 * Rota PRIVADA (chamada pelo dashboard)
 * ========================================
 */

// Rota: GET /api/analytics/dashboard
// Propósito: Obter dados agregados para o dono do grupo.
// * Protegida pelo authMiddleware.
router.get('/dashboard', authMiddleware, analyticsController.getDashboardController);
//router.get('/dashboard', analyticsController.getDashboardController); // LINHA SEM O MIDDLEWARE

export default router;