import prisma from '../config/database.js';

class MoodService {
    async createMood(moodData) {
        return prisma.moods.create({
            data: moodData
        });
    }

    async getMoodsByUserId(userId) {
        return prisma.moods.findMany({
            where: {
                userId: parseInt(userId)
            },
            orderBy: {
                dateRegistration: 'desc'
            }
        });
    }
}

export default new MoodService(); 