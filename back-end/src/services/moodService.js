import prisma from '../config/database.js';

class MoodService {
    async createMood(moodData) {
        console.log('Service - Création d\'humeur avec les données:', moodData);
        
        return prisma.moods.create({
            data: {
                moodType: moodData.moodType,
                description: moodData.description,
                user: {
                    connect: {
                        id_user: moodData.userId
                    }
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
    }

    async getMoodsByUserId(userId) {
        console.log('Service - Récupération des humeurs pour l\'utilisateur:', userId);
        
        return prisma.moods.findMany({
            where: {
                user: {
                    id_user: userId
                }
            },
            orderBy: {
                dateRegistration: 'desc'
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
    }

}

export default new MoodService(); 