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
import userService from './src/services/userService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Required behind proxy (Render) for express-rate-limit to read X-Forwarded-For correctly
app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:5173', 'capacitor://localhost', 'http://localhost', 'file://', 'http://10.0.2.2:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HTTP Security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({ crossOriginResourcePolicy: false }));
}

// Rate limiting for login and message sending
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const postLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });

// Middleware to parse JSON
app.use(express.json());

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Main test route
app.get("/", (req, res) => {
  res.send("SafeHaven API is online 🚀");
});

// Health check route for monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!'
  });
});

// Routes API
app.use('/api/users', authLimiter, userRoutes);
app.use('/api/chat', postLimiter, chatbotRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/experiences', experienceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle not found routes
app.use((req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Route not found:', req.method, req.url);
  }
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', async () => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`Server started on http://localhost:${PORT}`);
  }
  
  // Initial cleanup of expired sessions
  try {
    await userService.cleanupExpiredSessions();
    // console.log('Initial session cleanup completed');
  } catch (error) {
    console.error('Error during initial cleanup:', error);
  }
  
  // Automatic cleanup every hour (mobile-friendly)
  setInterval(async () => {
    try {
      await userService.cleanupExpiredSessions();
      // console.log('Automatic session cleanup completed');
    } catch (error) {
      console.error('Error during automatic cleanup:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
});