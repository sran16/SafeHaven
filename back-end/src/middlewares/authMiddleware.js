import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';


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
    
        // Vérifier JWT d'abord 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si la session est active avec les données utilisateur
    const activeSession = await prisma.activeSessions.findUnique({
        where: { 
            token: token,
            isActive: true,
            expiresAt: {
                gt: new Date() // Session non expirée
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

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: 'Session expirée ou invalide'
      });
    }

    req.user = activeSession.user;
    req.sessionId = activeSession.id; // Pour pouvoir gérer la session plus tard
    next();
  } catch (error) {
    console.error(' Erreur d\'authentification:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

export default authMiddleware; 