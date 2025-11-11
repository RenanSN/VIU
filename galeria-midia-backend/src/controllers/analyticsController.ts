// src/controllers/analyticsController.ts

import { Request, Response } from 'express';
import * as analyticsModel from '../models/analyticsModel';

// POST /api/analytics/start
export const startSessionController = async (req: Request, res: Response) => {
  try {
    const { shareCode, sessionId } = req.body;
    if (!shareCode || !sessionId) {
      return res.status(400).json({ error: 'shareCode and sessionId are required.' });
    }

    const data = await analyticsModel.startSession(shareCode, sessionId);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to start session', details: error.message });
  }
};

// POST /api/analytics/end
export const endSessionController = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }
    const data = await analyticsModel.endSession(sessionId);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to end session', details: error.message });
  }
};

// POST /api/analytics/events (o "heartbeat")
export const recordEventsController = async (req: Request, res: Response) => {
  try {
    const { sessionId, events } = req.body;
    if (!sessionId || !Array.isArray(events)) {
      return res.status(400).json({ error: 'sessionId and events array are required.' });
    }
    
    if (events.length === 0) {
      return res.status(200).json({ message: 'No events to record.' });
    }

    const data = await analyticsModel.recordVisibilityEvents(sessionId, events);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record events', details: error.message });
  }
};

// GET /api/analytics/dashboard
export const getDashboardController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // Garantido pelo authMiddleware
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO
    const data = await analyticsModel.getDashboardData(userId);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
};