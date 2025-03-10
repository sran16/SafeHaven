import prisma from '../config/database.js';

class TodoService {
    async createTodo(todoData) {
        return prisma.toDoLists.create({
            data: todoData
        });
    }

    async getTodosByUserId(userId) {
        return prisma.toDoLists.findMany({
            where: {
                userId: parseInt(userId)
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
    }

    async updateTodo(id, data) {
        return prisma.toDoLists.update({
            where: { id_todo: parseInt(id) },
            data
        });
    }

    async deleteTodo(id) {
        return prisma.toDoLists.delete({
            where: { id_todo: parseInt(id) }
        });
    }
}

export default new TodoService(); 