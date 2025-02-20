import prisma from '../config/database.js';

class ExperienceService {
    async createExperience(experienceData) {
        return prisma.experiences.create({
            data: experienceData
        });
    }

    async getAllExperiences() {
        return prisma.experiences.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getExperienceById(id) {
        return prisma.experiences.findUnique({
            where: {
                id_experience: parseInt(id)
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
}

export default new ExperienceService(); 