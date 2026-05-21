const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const commentRoutes = require('./routes/comments');
const statsRoutes = require('./routes/stats');

const app = express();

// ─── MIDDLEWARE ─────────────────────────────
app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stats', statsRoutes);

// ─── HEALTH CHECK ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Server is running!',
    time: new Date().toISOString(),
  });
});

// ─── ERROR HANDLER ───────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// ─── START SERVER ───────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('─────────────────────────────────');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`✅ MySQL connected`);
      console.log('─────────────────────────────────');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();