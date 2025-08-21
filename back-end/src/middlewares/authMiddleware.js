import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

// dotenv.config() est appelé dans server.js (point d'entrée principal)

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si la session est active
    const activeSession = await prisma.activeSessions.findUnique({
      where: { token: token },
      include: { user: true }
    });

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: 'Session expirée ou invalide'
      });
    }

    if (!activeSession.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Session fermée'
      });
    }

    // Vérifier si la session n'est pas expirée
    if (new Date() > activeSession.expiresAt) {
      // Désactiver automatiquement la session expirée
      await prisma.activeSessions.update({
        where: { id: activeSession.id },
        data: { isActive: false }
      });
      return res.status(401).json({
        success: false,
        message: 'Session expirée'
      });
    }
    req.user = activeSession.user;
    req.sessionId = activeSession.id; // Pour pouvoir gérer la session plus tard
    next();
  } catch (error) {
    console.error('Erreur d\'authentification détaillée:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

export default authMiddleware; 