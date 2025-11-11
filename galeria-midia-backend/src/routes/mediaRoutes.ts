// src/routes/mediaRoutes.ts

import { Router } from 'express';
import * as mediaController from '../controllers/mediaController';
import { authMiddleware } from '../middleware/authMiddleware';
import upload from '../lib/multerConfig'; // Nosso middleware 'multer'

const router = Router();

// Todas as rotas de mídia exigem autenticação
router.use(authMiddleware);

/*
 * Rota: POST /api/media/upload/:id (onde :id é o group_id)
 * Propósito: Fazer upload de um novo arquivo de mídia para um grupo.
 *
 * * Usamos dois middlewares em sequência:
 * 1. 'authMiddleware': Verifica se o usuário está logado.
 * 2. 'upload.single('mediaFile')': Processa o upload (form-data)
 * e anexa o arquivo a 'req.file'.
 * 'mediaFile' deve ser o nome do campo no formulário do frontend.
 */
router.post(
  '/upload/:id',
  upload.single('mediaFile'),
  mediaController.uploadMediaController,
);

/*
 * Rota: DELETE /api/media/:mediaId
 * Propósito: Excluir um arquivo de mídia específico.
 */
router.delete('/:mediaId', mediaController.deleteMediaController);

export default router;