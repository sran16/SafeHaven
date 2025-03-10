import express from 'express';
import todoController from '../controllers/todoController.js';
import { validateTodo } from '../middlewares/validation.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', [auth, validateTodo], todoController.createTodo);
router.get('/user/:userId', auth, todoController.getUserTodos);
router.put('/:id', [auth, validateTodo], todoController.updateTodo);
router.delete('/:id', auth, todoController.deleteTodo);

export default router; 