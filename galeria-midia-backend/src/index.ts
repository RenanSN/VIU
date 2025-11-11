// src/index.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importa nossas rotas (da Parte 2)
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';

// --- NOVAS ROTAS (Parte 3) ---
import groupRoutes from './routes/groupRoutes';
import mediaRoutes from './routes/mediaRoutes';
import viewRoutes from './routes/viewRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// --- Configuração Inicial ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// --- Middlewares Essenciais ---

// Habilita o CORS (Cross-Origin Resource Sharing)
//    Esta é a configuração de segurança VITAL.
const allowedOrigins = [
  process.env.FRONTEND_URL, // A URL do seu app na Vercel (ex: https://meu-app.vercel.app)
  'http://localhost:3000', // A URL do seu app rodando localmente (para testes)
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como Postman ou apps mobile)
    if (!origin) return callback(null, true);
    
    // Se a origem da requisição ESTÁ na nossa lista, permite
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS para este site não permite acesso da Origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Precisamos permitir explicitamente estes cabeçalhos
  // para que o "preflight" (OPTIONS) do Axios (POST) funcione.
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Habilita o parsing de JSON
app.use(express.json());

// --- Rotas da API ---

// Rotas de Autenticação e Perfil (Parte 2)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Rotas de Grupos e Mídias (Parte 3)
app.use('/api/groups', groupRoutes);
app.use('/api/media', mediaRoutes);

// Rotas Públicas (Parte 3)
app.use('/api/view', viewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Rota "raiz" de verificação (health check)
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('API da Galeria de Mídia está online e funcionando!');
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express rodando com TypeScript na porta ${PORT}`);
});