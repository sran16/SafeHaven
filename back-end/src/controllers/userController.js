import userService from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

class UserController {
    async register(req, res) {
        try {
            const { name, password } = req.body;

            const user = await userService.createUser(req.body);
            const loginResult = await userService.loginUser(name, password);
            
            return successResponse(res, 201, 'User created successfully', {
                user: loginResult.user,
                token: loginResult.token
            });
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async login(req, res) {
        try {
            const { name, password } = req.body;
            const result = await userService.loginUser(name, password);
            return successResponse(res, 200, 'Login successful', result);
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }

    async logout(req, res) {
        try {
            await userService.logoutUser(req.user.id_user, req.sessionId);
            return successResponse(res, 200, 'Logout successful');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getProfile(req, res) {
        try {
            const user = await userService.getUserProfile(req.user.id_user);
            
            // Formater les données pour le frontend
            const formattedUser = {
                id_user: user.id_user,
                username: user.name,
                createdAt: user.registration_Date ? new Date(user.registration_Date).toISOString() : null,
                posts: user.experiences?.length || 0,
            };
            
            return successResponse(res, 200, 'Profile retrieved successfully', formattedUser);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async updateProfile(req, res) {
        try {
            const updatedUser = await userService.updateUserProfile(req.user.id_user, req.body);
            return successResponse(res, 200, 'Profile updated successfully', updatedUser);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async verifyToken(req, res) {
        try {
            return successResponse(res, 200, 'Token is valid', { user: req.user });
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            await userService.changeUserPassword(req.user.id_user, currentPassword, newPassword);
            return successResponse(res, 200, 'Password changed successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

export default new UserController();
