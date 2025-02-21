import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Récupérer toutes les humeurs de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const moods = await prisma.moods.findMany({
      where: {
        userId: req.user.id_user
      },
      orderBy: {
        dateRegistration: 'desc'
      }
    });

    res.json(moods);
  } catch (error) {
    console.error('Erreur lors de la récupération des humeurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des humeurs'
    });
  }
});

// Créer une nouvelle humeur
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { moodType, description } = req.body;
    console.log('Données reçues:', req.body);

    if (!moodType) {
      return res.status(400).json({
        success: false,
        message: 'Le type d\'humeur est requis'
      });
    }

    // Vérifier si le type d'humeur est valide
    const validMoodTypes = ['happy', 'calm', 'neutral', 'anxious', 'sad', 'angry'];
    if (!validMoodTypes.includes(moodType)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'humeur invalide'
      });
    }

    const newMood = await prisma.moods.create({
      data: {
        moodType,
        description: description || '',
        dateRegistration: new Date(),
        userId: req.user.id_user
      }
    });

    console.log('Humeur créée:', newMood);

    res.status(201).json({
      success: true,
      message: 'Humeur enregistrée avec succès',
      data: newMood
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'enregistrement de l\'humeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'humeur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Récupérer une humeur spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const moodId = parseInt(req.params.id);
    const mood = await prisma.moods.findUnique({
      where: {
        id_mood: moodId,
        userId: req.user.id_user
      }
    });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Humeur non trouvée'
      });
    }

    res.json({
      success: true,
      data: mood
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'humeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'humeur'
    });
  }
});

// Mettre à jour une humeur
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const moodId = parseInt(req.params.id);
    const { moodType, description } = req.body;

    const mood = await prisma.moods.findUnique({
      where: {
        id_mood: moodId,
        userId: req.user.id_user
      }
    });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Humeur non trouvée'
      });
    }

    const updatedMood = await prisma.moods.update({
      where: {
        id_mood: moodId
      },
      data: {
        moodType,
        description
      }
    });

    res.json({
      success: true,
      message: 'Humeur mise à jour avec succès',
      data: updatedMood
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'humeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'humeur'
    });
  }
});

// Supprimer une humeur
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const moodId = parseInt(req.params.id);

    const mood = await prisma.moods.findUnique({
      where: {
        id_mood: moodId,
        userId: req.user.id_user
      }
    });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: 'Humeur non trouvée'
      });
    }

    await prisma.moods.delete({
      where: {
        id_mood: moodId
      }
    });

    res.json({
      success: true,
      message: 'Humeur supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'humeur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'humeur'
    });
  }
});

export default router; 