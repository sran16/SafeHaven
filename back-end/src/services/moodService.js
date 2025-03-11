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

    async getMoodStats(userId, startDate, endDate) {
        const moods = await prisma.moods.findMany({
            where: {
                user: {
                    id_user: userId
                },
                dateRegistration: {
                    gte: startDate ? new Date(startDate) : undefined,
                    lte: endDate ? new Date(endDate) : undefined
                }
            }
        });

        // Calculer les statistiques
        const stats = {
            total: moods.length,
            byType: {},
            mostCommon: null,
            leastCommon: null
        };

        // Compter les occurrences de chaque type d'humeur
        moods.forEach(mood => {
            if (!stats.byType[mood.moodType]) {
                stats.byType[mood.moodType] = 0;
            }
            stats.byType[mood.moodType]++;
        });

        // Trouver les types les plus et moins communs
        let maxCount = 0;
        let minCount = Infinity;
        
        Object.entries(stats.byType).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                stats.mostCommon = type;
            }
            if (count < minCount) {
                minCount = count;
                stats.leastCommon = type;
            }
        });

        return stats;
    }
}

export default new MoodService(); 