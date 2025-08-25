import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatbotRoutes from './src/routes/chatbotRoutes.js';
import moodRoutes from './src/routes/moodRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import experienceRoutes from './src/routes/experienceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Requis derrière un proxy (Render) pour que express-rate-limit lise correctement X-Forwarded-For
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:5173', 'https://safe-haven-kappa.vercel.app', 'capacitor://localhost', 'http://localhost', 'file://', 'http://10.0.2.2:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Sécurité HTTP 
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({ crossOriginResourcePolicy: false }));
}

// Rate limiting  sur login et envoi de messages
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const postLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir les fichiers statiques
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Route de test principale
app.get("/", (req, res) => {
  res.send("API SafeHaven est en ligne 🚀");
});

// Route de santé pour le monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!'
  });
});

// Route de test pour le chatbot
app.get('/api/chat/test', (req, res) => {
  res.json({ message: 'Chatbot route is working' });
});

// Route de test simple
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/users', authLimiter, userRoutes);
app.use('/api/chat', postLimiter, chatbotRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/experiences', experienceRoutes);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gestion des routes non trouvées 
app.use((req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Route non trouvée:', req.method, req.url);
  }
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`Serveur démarré sur http://localhost:${PORT}`);
  }
});