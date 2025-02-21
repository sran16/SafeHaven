import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration de multer pour le stockage des avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id_user;
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        name: true,
        email: true,
        registration_Date: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// Mettre à jour le profil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { name } = req.body;

    const updatedUser = await prisma.users.update({
      where: { id_user: userId },
      data: { name },
      select: {
        id_user: true,
        name: true,
        email: true,
        registration_Date: true
      }
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
});

// Upload d'avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier n\'a été uploadé'
      });
    }

    const userId = req.user.id_user;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.users.update({
      where: { id_user: userId },
      data: { avatar_url: avatarUrl },
      select: {
        id_user: true,
        name: true,
        email: true,
        avatar_url: true
      }
    });

    res.json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'avatar'
    });
  }
});

export default router; 