const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { initDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const articlesPublicRoutes = require('./routes/articles-public');
const articlesAuthorRoutes = require('./routes/articles-author');
const articlesEditorRoutes = require('./routes/articles-editor');
const adminRoutes = require('./routes/admin');
const commentsRoutes = require('./routes/comments');
const bookmarksRoutes = require('./routes/bookmarks');
const notificationsRoutes = require('./routes/notifications');
const recommendationRoutes = require('./routes/recommendations');
const researchRoutes = require('./routes/research');

// Create Express app
const app = express();

// Middleware
app.use(morgan('combined'));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const { startScraperService } = require('./services/scraperService');
const { startResearchScraperService } = require('./services/researchScraperService');

// Initialize database (run pending migrations)
initDatabase()
   .then(() => {
      // Bắt đầu cào dữ liệu định kỳ sau khi DB đã kết nối
      startScraperService();
      startResearchScraperService();
   })
   .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
   });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesPublicRoutes);
app.use('/api/author/articles', articlesAuthorRoutes);
app.use('/api/editor/articles', articlesEditorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/research', researchRoutes);

// Health check
app.get('/api/health', (req, res) => {
   res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error('Error:', err);
   res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err : {},
   });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
   console.log(`Environment: ${process.env.NODE_ENV}`);
});
