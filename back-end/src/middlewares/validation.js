import { errorResponse } from '../utils/responses.js';

export const validateUser = (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return errorResponse(res, 400, 'Missing required fields');
    }
    next();
};

export const validateTodo = (req, res, next) => {
    const { name, dueDate } = req.body;
    if (!name || !dueDate) {
        return errorResponse(res, 400, 'Missing required fields');
    }
    next();
};

export const validateMood = (req, res, next) => {
    const { moodType } = req.body;
    if (!moodType) {
        return errorResponse(res, 400, 'Missing mood type');
    }
    next();
}; 