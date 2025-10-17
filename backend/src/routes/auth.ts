// backend/src/routes/auth.ts

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, company, cui, address, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email deja înregistrat' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        cui,
        address,
        phone,
      },
    });

    // Create default categories
    const defaultCategories = [
      { name: 'Ciorbe', displayName: '🍲 Ciorbe', emoji: '🍲', order: 1 },
      { name: 'Feluri Principale', displayName: '🍖 Feluri Principale', emoji: '🍖', order: 2 },
      { name: 'Garnituri', displayName: '🥔 Garnituri', emoji: '🥔', order: 3 },
    ];

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          userId: user.id,
          ...cat,
        },
      });
    }

    // Create default fixed costs
    await prisma.fixedCost.createMany({
      data: [
        { userId: user.id, name: 'Ambalaj', cost: 2.0 },
        { userId: user.id, name: 'Transport', cost: 1.0 },
      ],
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Eroare la înregistrare' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email sau parolă incorectă' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email sau parolă incorectă' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        cui: user.cui,
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Deconectat cu succes' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Neautentificat' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        cui: true,
        address: true,
        phone: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User negăsit' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Token invalid' });
  }
});

export default router;