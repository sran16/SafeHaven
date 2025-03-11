import prisma from '../config/database.js';

class AnswerService {
    async createAnswer(data) {
        try {
            console.log('Création d\'un nouveau commentaire avec les données:', data);
            
            // Créer d'abord la réponse avec les champs directs
            const answer = await prisma.answers.create({
                data: {
                    content: data.content,
                    userId: data.userId,        // Utilisation directe de userId
                    experienceId: data.experienceId  // Utilisation directe de experienceId
                }
            });

            // Récupérer la réponse avec l'utilisateur
            const answerWithUser = await prisma.answers.findUnique({
                where: {
                    id_response: answer.id_response
                },
                include: {
                    user: true
                }
            });

            console.log('Commentaire créé avec succès:', answerWithUser);

            return {
                id: answerWithUser.id_response,
                content: answerWithUser.content,
                author: answerWithUser.user.name,
                createdAt: answerWithUser.publicationDate
            };
        } catch (error) {
            console.error('Erreur lors de la création du commentaire:', error);
            throw error;
        }
    }

    async getAnswersByExperience(experienceId) {
        try {
            const answers = await prisma.answers.findMany({
                where: {
                    experienceId: experienceId  // Utilisation directe de experienceId
                },
                include: {
                    user: true
                },
                orderBy: {
                    publicationDate: 'desc'
                }
            });

            return answers.map(answer => ({
                id: answer.id_response,
                content: answer.content,
                author: answer.user.name,
                createdAt: answer.publicationDate
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            throw error;
        }
    }
}

export default new AnswerService(); 