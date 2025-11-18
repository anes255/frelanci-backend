const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const jobRoutes = require('./routes/job');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');
const maintenanceRoutes = require('./routes/maintenance');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Freelanci API is running'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Freelanci API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      orders: '/api/orders',
      admin: '/api/admin',
      maintenance: '/api/maintenance'
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║     🚀 Freelanci API Server Running     ║
║                                          ║
║     Port: ${PORT}                       ║
║     Environment: Production              ║
║     Domain: https://frelanci-backend     ║
║             .onrender.com                ║
║                                          ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
