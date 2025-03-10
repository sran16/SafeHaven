import prisma from '../config/database.js';
import answerService from './answerService.js';

// Stockage en mémoire pour les likes
const likesStore = new Map(); // Map<experienceId, Set<userId>>
const likesCount = new Map(); // Map<experienceId, number>

class ExperienceService {
    async createExperience(experienceData) {
        console.log('Creating experience with data:', experienceData);
        const experience = await prisma.experiences.create({
            data: {
                content: experienceData.content,
                user: {
                    connect: {
                        id_user: experienceData.userId
                    }
                }
            },
            include: {
                user: {
                    select: {
                        id_user: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Initialiser les likes pour cette expérience
        likesStore.set(experience.id_experience, new Set());
        likesCount.set(experience.id_experience, 0);

        return {
            ...experience,
            likes: 0,
            isLiked: false,
            comments: []
        };
    }

    async getAllExperiences() {
        try {
            const experiences = await prisma.experiences.findMany({
                include: {
                    user: true
                },
                orderBy: {
                    publication_date: 'desc'
                }
            });

            return experiences.map(exp => ({
                id_experience: exp.id_experience,
                content: exp.content,
                publication_date: exp.publication_date,
                user: {
                    id_user: exp.user.id_user,
                    name: exp.user.name
                },
                likes: likesCount.get(exp.id_experience) || 0,
                isLiked: false,
                comments: []
            }));
        } catch (error) {
            console.error('Error in getAllExperiences:', error);
            throw error;
        }
    }

    async toggleLike(experienceId, userId) {
        // Initialiser les sets s'ils n'existent pas
        if (!likesStore.has(experienceId)) {
            likesStore.set(experienceId, new Set());
            likesCount.set(experienceId, 0);
        }

        const userLikes = likesStore.get(experienceId);
        const currentCount = likesCount.get(experienceId);

        // Toggle like
        const isLiked = userLikes.has(userId);
        if (isLiked) {
            userLikes.delete(userId);
            likesCount.set(experienceId, currentCount - 1);
        } else {
            userLikes.add(userId);
            likesCount.set(experienceId, currentCount + 1);
        }

        return {
            isLiked: !isLiked,
            likes: likesCount.get(experienceId)
        };
    }

    async getExperienceById(id) {
        try {
            const experience = await prisma.experiences.findUnique({
                where: {
                    id_experience: parseInt(id)
                },
                include: {
                    user: true
                }
            });

            if (!experience) {
                return null;
            }

            // Récupérer les commentaires séparément
            const answers = await prisma.answers.findMany({
                where: {
                    experienceId: experience.id_experience
                },
                include: {
                    user: true
                },
                orderBy: {
                    publicationDate: 'desc'
                }
            });

            return {
                ...experience,
                likes: likesCount.get(experience.id_experience) || 0,
                isLiked: likesStore.get(experience.id_experience)?.has(experience.user.id_user) || false,
                comments: answers.map(answer => ({
                    id: answer.id_response,
                    content: answer.content,
                    author: answer.user.name || 'Utilisateur inconnu',
                    createdAt: answer.publicationDate
                }))
            };
        } catch (error) {
            console.error('Error in getExperienceById:', error);
            throw error;
        }
    }
}

export default new ExperienceService(); 