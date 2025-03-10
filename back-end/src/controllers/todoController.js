import todoService from '../services/todoService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

class TodoController {
    async createTodo(req, res) {
        try {
            const todo = await todoService.createTodo(req.body);
            return successResponse(res, 201, 'Todo created successfully', todo);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getUserTodos(req, res) {
        try {
            const todos = await todoService.getTodosByUserId(req.params.userId);
            return successResponse(res, 200, 'Todos retrieved successfully', todos);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async updateTodo(req, res) {
        try {
            const todo = await todoService.updateTodo(req.params.id, req.body);
            return successResponse(res, 200, 'Todo updated successfully', todo);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async deleteTodo(req, res) {
        try {
            await todoService.deleteTodo(req.params.id);
            return successResponse(res, 200, 'Todo deleted successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

export default new TodoController(); 