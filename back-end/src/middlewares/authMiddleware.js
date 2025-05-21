import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header reçu:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Header d\'authentification invalide ou manquant');
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extrait:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);
    
    const user = await prisma.users.findUnique({
      where: { id_user: decoded.userId }
    });

    if (!user) {
      console.log('Utilisateur non trouvé pour l\'ID:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log('Utilisateur trouvé:', user);
    req.user = user;
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