import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

class UserService {
    async createUser(userData) {
        const { name, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
    }

    async loginUser(email, password) {
        const user = await prisma.users.findUnique({
            where: { email }
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
            'votre_secret_jwt'
        );

        return { user, token };
    }
}

export default new UserService();
