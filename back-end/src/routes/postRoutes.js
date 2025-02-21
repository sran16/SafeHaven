import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Récupérer tous les posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.experiences.findMany({
      orderBy: {
        publication_date: 'desc'
      },
      include: {
        user: {
          select: {
            id_user: true,
            name: true
          }
        }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des posts'
    });
  }
});

// Créer un nouveau post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id_user;

    const newPost = await prisma.experiences.create({
      data: {
        content,
        publication_date: new Date(),
        user: {
          connect: { id_user: userId }
        }
      },
      include: {
        user: {
          select: {
            id_user: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Post créé avec succès',
      data: newPost
    });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du post'
    });
  }
});

// Récupérer un post spécifique
router.get('/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.experiences.findUnique({
      where: { id_experience: postId },
      include: {
        user: {
          select: {
            id_user: true,
            name: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du post'
    });
  }
});

// Supprimer un post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id_user;

    // Vérifier si le post existe et appartient à l'utilisateur
    const post = await prisma.experiences.findUnique({
      where: { id_experience: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce post'
      });
    }

    await prisma.experiences.delete({
      where: { id_experience: postId }
    });

    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du post'
    });
  }
});

// Ajouter un commentaire à un post
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.id_user;

    console.log('Création de commentaire pour le post:', postId);
    console.log('Contenu:', content);
    console.log('ID utilisateur:', userId);

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du commentaire est requis'
      });
    }

    if (isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de post invalide'
      });
    }

    // Vérifier si le post existe
    const post = await prisma.experiences.findUnique({
      where: { id_experience: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    const comment = await prisma.answers.create({
      data: {
        content: content,
        publicationDate: new Date(),
        experienceId: postId,
        user: {
          connect: { id_user: userId }
        }
      },
      include: {
        user: true
      }
    });

    console.log('Commentaire créé avec succès:', comment);

    // Formater la réponse pour le front-end
    const formattedComment = {
      id: comment.id_response,
      content: comment.content,
      author: comment.user.name,
      createdAt: comment.publicationDate
    };

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      comment: formattedComment
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'ajout du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Récupérer les commentaires d'un post
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const comments = await prisma.answers.findMany({
      where: {
        experienceId: postId
      },
      include: {
        user: {
          select: {
            id_user: true,
            name: true
          }
        }
      },
      orderBy: {
        publicationDate: 'desc'
      }
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires'
    });
  }
});

export default router; 