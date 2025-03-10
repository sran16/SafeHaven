import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
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
const prisma = new PrismaClient();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL du front-end Vue.js
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Route de test pour le chatbot
app.get('/api/chat/test', (req, res) => {
  res.json({ message: 'Chatbot route is working' });
});

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/chat', chatbotRoutes);
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

// Gestion des routes non trouvées - DOIT ÊTRE LE DERNIER MIDDLEWARE
app.use((req, res) => {
  console.log('Route non trouvée:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});