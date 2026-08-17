import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import entryRoutes from './routes/entries.js';
import inviteRoutes from './routes/invites.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const app = express();
const server = createServer(app);

app.set('trust proxy', 1); // Required for Render/proxies for rate limiting
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

// CORS setup
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

const io = new Server(server, {
  cors: corsOptions
});

app.set('io', io); // Make io available in routes

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.use(cors(corsOptions));

// General middleware
app.use(express.json());
app.use(cookieParser());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route Mounts
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', inviteRoutes); // Must be before projectRoutes to avoid /:id shadowing
app.use('/api/projects', projectRoutes);
app.use('/api/projects', entryRoutes);
app.use('/api', entryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Serve static frontend files in production/build environments
const clientPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientPath));

app.get('*', (req, res, next) => {
  // Let api errors pass through to error boundary / 404
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientPath, 'index.html'), (err) => {
    if (err) {
      next(); // Pass to error handler if index.html is missing
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/memory_vault';
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
