import experienceService from '../services/experienceService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

class ExperienceController {
    async createExperience(req, res) {
        try {
            const experience = await experienceService.createExperience(req.body);
            return successResponse(res, 201, 'Experience created successfully', experience);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getExperiences(req, res) {
        try {
            const experiences = await experienceService.getAllExperiences();
            return successResponse(res, 200, 'Experiences retrieved successfully', experiences);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getExperienceById(req, res) {
        try {
            const experience = await experienceService.getExperienceById(req.params.id);
            if (!experience) {
                return errorResponse(res, 404, 'Experience not found');
            }
            return successResponse(res, 200, 'Experience retrieved successfully', experience);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new ExperienceController(); 