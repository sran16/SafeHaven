import userService from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

class UserController {
    async register(req, res) {
        try {
            const user = await userService.createUser(req.body);
            return successResponse(res, 201, 'User created successfully', user);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await userService.loginUser(email, password);
            return successResponse(res, 200, 'Login successful', result);
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }
}

export default new UserController();
