// src/controllers/viewController.ts

import { Request, Response } from 'express';
import * as viewModel from '../models/viewModel';

// GET /api/view/:shareCode
export const getViewController = async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;

    if (!shareCode) {
      return res.status(400).json({ error: 'Share code is required.' });
    }

    const groupData = await viewModel.getMediaByShareCode(shareCode);
    res.status(200).json(groupData);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch view data', details: error.message });
  }
};