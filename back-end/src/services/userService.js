import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';


class UserService {
    async createUser(userData) {
        // Création d'utilisateur
        
        const { name, email, password } = userData;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [
                    { name },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.name === name) {
                throw new Error('Ce nom d\'utilisateur est déjà pris');
            }
            if (existingUser.email === email) {
                throw new Error('Cette adresse email est déjà utilisée');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const user = await prisma.users.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
                select: {
                    id_user: true,
                    name: true,
                    email: true,
                    registration_Date: true
                }
            });
            
            // Utilisateur créé avec succès
            return user;
        } catch (error) {
            // Log l'erreur en développement seulement
            if (process.env.NODE_ENV === 'development') {
                console.error('Erreur lors de la création de l\'utilisateur:', error);
            }
            throw new Error('Erreur lors de la création de l\'utilisateur');
        }
    }

    async loginUser(name, password) {
        const user = await prisma.users.findFirst({
            where: { name }
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('Mot de passe incorrect');
        }

        // Session mobile longue pour accessibilité en cas de détresse
        const MOBILE_SESSION_DURATION = 24 * 60 * 60; // 24h en secondes
        
        const token = jwt.sign(
            { userId: user.id_user },
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: MOBILE_SESSION_DURATION }
        );

        // Synchroniser l'expiration DB avec JWT
        const expiresAt = new Date(Date.now() + MOBILE_SESSION_DURATION * 1000);

        // Créer une session active
        await prisma.activeSessions.create({
            data: {
                token: token,
                userId: user.id_user,
                expiresAt: expiresAt,
                isActive: true
            }
        });



        return {
            user: {
                id_user: user.id_user,
                name: user.name
            },
            token
        };
    }

    async logoutUser(userId, sessionId = null) {
        try {
            if (sessionId) {
                // Désactiver une session spécifique
                await prisma.activeSessions.update({
                    where: { id: sessionId },
                    data: { isActive: false }
                });

            } else {
                // Désactiver toutes les sessions de l'utilisateur
                await prisma.activeSessions.updateMany({
                    where: { 
                        userId: userId,
                        isActive: true 
                    },
                    data: { isActive: false }
                });

            }
            return true;
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            throw new Error('Erreur lors de la déconnexion');
        }
    }

    async getUserProfile(userId) {
        const user = await prisma.users.findUnique({
            where: { id_user: userId },
            select: {
                id_user: true,
                name: true,
                registration_Date: true,
                experiences: true,
                moods: true
            }
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        return user;
    }

    async updateUserProfile(userId, userData) {
        // Mapper les champs du frontend vers la base de données
        const mappedData = {};
        
        if (userData.username) {
            mappedData.name = userData.username;
        }
        
        // Note: 'bio' n'existe pas dans le schéma Users, on l'ignore

        // Vérifier si le nom d'utilisateur est déjà pris
        if (mappedData.name) {
            const existingUser = await prisma.users.findFirst({
                where: {
                    name: mappedData.name,
                    NOT: {
                        id_user: userId
                    }
                }
            });

            if (existingUser) {
                throw new Error('Ce nom d\'utilisateur est déjà pris');
            }
        }

        return prisma.users.update({
            where: { id_user: userId },
            data: mappedData,
            select: {
                id_user: true,
                name: true,
                registration_Date: true
            }
        });
    }

    async changeUserPassword(userId, currentPassword, newPassword) {
        const user = await prisma.users.findUnique({
            where: { id_user: userId }
        });

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            throw new Error('Mot de passe actuel incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.users.update({
            where: { id_user: userId },
            data: { password: hashedPassword }
        });

        return true;
    }

    // Fonction de nettoyage des sessions expirées
    async cleanupExpiredSessions() {
        try {
            const result = await prisma.activeSessions.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        { isActive: false }
                    ]
                }
            });

            return result.count;
        } catch (error) {
            console.error('Erreur lors du nettoyage des sessions:', error);
            return 0;
        }
    }

    // Fonction pour obtenir les sessions actives d'un utilisateur
    async getUserActiveSessions(userId) {
        return await prisma.activeSessions.findMany({
            where: {
                userId: userId,
                isActive: true,
                expiresAt: { gt: new Date() }
            },
            select: {
                id: true,
                createdAt: true,
                expiresAt: true,
                deviceInfo: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export default new UserService();
