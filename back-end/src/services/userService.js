import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

class UserService {
    async createUser(userData) {
        console.log('Création d\'utilisateur avec les données:', userData);
        
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
            
            console.log('Utilisateur créé avec succès:', user);
            return user;
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
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

        const token = jwt.sign(
            { userId: user.id_user },
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
        );

        return {
            user: {
                id_user: user.id_user,
                name: user.name
            },
            token
        };
    }

    async logoutUser(userId) {
        // Pour une déconnexion côté serveur, on pourrait gérer une liste noire de tokens
        // Pour l'instant, la déconnexion est gérée côté client
        return true;
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
        const { name } = userData;

        if (name) {
            const existingUser = await prisma.users.findFirst({
                where: {
                    name,
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
            data: userData,
            select: {
                id_user: true,
                name: true,
                createdAt: true
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
}

export default new UserService();
