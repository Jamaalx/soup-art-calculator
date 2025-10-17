// backend/src/routes/categories.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories with products for current user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId },
      include: {
        products: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Eroare la obținerea categoriilor' });
  }
});

// Get fixed costs
router.get('/fixed-costs', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const fixedCosts = await prisma.fixedCost.findMany({
      where: { userId: req.userId }
    });

    res.json({ fixedCosts });
  } catch (error) {
    console.error('Get fixed costs error:', error);
    res.status(500).json({ error: 'Eroare la obținerea costurilor fixe' });
  }
});

// Update fixed cost
router.put('/fixed-costs/:name', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name } = req.params;
    const { cost } = req.body;

    const fixedCost = await prisma.fixedCost.upsert({
      where: { userId_name: { userId: req.userId!, name } },
      update: { cost },
      create: { userId: req.userId!, name, cost }
    });

    res.json({ fixedCost });
  } catch (error) {
    console.error('Update fixed cost error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea costului fix' });
  }
});

// Create category
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, displayName, emoji } = req.body;

    const maxOrder = await prisma.category.findFirst({
      where: { userId: req.userId },
      orderBy: { order: 'desc' }
    });

    const category = await prisma.category.create({
      data: {
        userId: req.userId!,
        name,
        displayName: displayName || name,
        emoji: emoji || '📦',
        order: (maxOrder?.order || 0) + 1
      }
    });

    res.json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Eroare la crearea categoriei' });
  }
});

// Update category
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, displayName, emoji } = req.body;

    const category = await prisma.category.updateMany({
      where: { id, userId: req.userId },
      data: { name, displayName, emoji }
    });

    if (category.count === 0) {
      return res.status(404).json({ error: 'Categorie negăsită' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea categoriei' });
  }
});

// Delete category
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.category.deleteMany({
      where: { id, userId: req.userId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Categorie negăsită' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Eroare la ștergerea categoriei' });
  }
});

export default router;