// src/controllers/groupController.ts

import { Request, Response } from 'express';
import * as groupModel from '../models/groupModel';

// POST /api/groups
export const createGroupController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user!.id; // Garantido pelo authMiddleware
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO

    if (!name) {
      return res.status(400).json({ error: 'Group name is required.' });
    }

    const newGroup = await groupModel.createGroup(name, userId);
    res.status(201).json(newGroup);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
};

// GET /api/groups
export const getGroupsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // Garantido pelo authMiddleware
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO
    const groups = await groupModel.getGroupsByOwner(userId);
    res.status(200).json(groups);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
};

// GET /api/groups/:id
export const getGroupByIdController = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user!.id; // Garantido pelo authMiddleware
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO

    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID.' });
    }

    const group = await groupModel.getGroupById(groupId, userId);
    res.status(200).json(group);
  } catch (error: any) {
    // Trata o erro "Group not found" do model
    if (error.message.includes('Group not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch group details', details: error.message });
  }
};

// DELETE /api/groups/:id
export const deleteGroupController = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user!.id; // Garantido pelo authMiddleware
    //const userId = '39841621-d2fd-43c0-9c84-66a68e10b64f'; // ID de teste FIXO

    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID.' });
    }

    const result = await groupModel.deleteGroup(groupId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete group', details: error.message });
  }
};