// backend/src/routes/products.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Add product
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { categoryId, name, price } = req.body;

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.userId }
    });

    if (!category) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const product = await prisma.product.create({
      data: { categoryId, name, price }
    });

    res.json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Eroare la crearea produsului' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id },
      include: { category: true }
    });

    if (!product || product.category.userId !== req.userId) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { name, price }
    });

    res.json({ product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea produsului' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id },
      include: { category: true }
    });

    if (!product || product.category.userId !== req.userId) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Eroare la ștergerea produsului' });
  }
});

export default router;