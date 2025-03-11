import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'https://safe-haven-eosin.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api', routes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running!'
    });
});

const PORT = process.env.PORT || 3000;

// Ajout de gestion d'erreur pour le serveur
const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please:
        1. Close any other running servers
        2. Run: npx kill-port ${PORT}
        3. Or change the port in .env file`);
    } else {
        console.error('Server error:', err);
    }
});

export default app;
