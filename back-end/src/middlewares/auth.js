import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responses.js';

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'votre_secret_jwt');
        req.user = decoded;
        next();
    } catch (error) {
        return errorResponse(res, 401, 'Please authenticate');
    }
};

export default auth;
