const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ========================================
// CONFIGURATION
// ========================================

const CONFIG = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'shifa_parapharmacie_secret_key_2024'
};

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

// CORS - Must be FIRST
app.use(cors({
    origin: function(origin, callback) {
        // Allow all origins for maximum compatibility
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Minimal request logging (only errors and important requests)
app.use((req, res, next) => {
    // Only log non-health/ping requests to reduce noise
    if (!req.path.includes('/ping') && !req.path.includes('/health')) {
        console.log(`${req.method} ${req.path}`);
    }
    next();
});

// ========================================
// ⚡ INSTANT WAKE-UP ENDPOINT (FASTEST)
// ========================================

// Ultra-fast ping - responds in ~0.5ms
app.get('/api/ping', (req, res) => {
    res.json({ ok: 1, ts: Date.now() });
});

// Fast health endpoint - works without DB
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
        uptime: Math.floor(process.uptime())
    });
});

// ========================================
// ROOT ENDPOINTS
// ========================================

app.get('/', (req, res) => {
    res.json({
        name: 'Shifa Parapharmacie API',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            ping: '/api/ping',
            health: '/api/health',
            auth: '/api/auth',
            products: '/api/products',
            orders: '/api/orders',
            admin: '/api/admin'
        }
    });
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Shifa Parapharmacie API',
        status: 'running',
        endpoints: ['/api/ping', '/api/health', '/api/auth', '/api/products', '/api/orders', '/api/admin']
    });
});

// ========================================
// START SERVER IMMEDIATELY
// ========================================

const server = app.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`✅ Server live on port ${CONFIG.PORT}`);
    console.log(`⚡ Ready: http://localhost:${CONFIG.PORT}/api/ping`);
    
    // Load everything else AFTER server starts (non-blocking)
    setImmediate(() => {
        initializeApplication();
    });
});

// ========================================
// DEFERRED INITIALIZATION
// ========================================

async function initializeApplication() {
    try {
        // Step 1: Load models
        console.log('📦 Loading models...');
        const Product = require('./models/Product');
        const Order = require('./models/Order');
        const User = require('./models/User');
        global.Models = { Product, Order, User };
        
        // Step 2: Load routes
        console.log('🔌 Loading routes...');
        
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/products', require('./routes/products'));
        app.use('/api/orders', require('./routes/orders'));
        app.use('/api/admin', require('./routes/admin'));
        
        try {
            app.use('/api/settings', require('./routes/settings'));
        } catch (e) {}
        
        try {
            app.use('/api', require('./routes/sitemap'));
        } catch (e) {}
        
        // Step 3: Error handlers (must be last)
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.path
            });
        });
        
        app.use((err, req, res, next) => {
            console.error('❌ Error:', err.message);
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Internal server error'
            });
        });
        
        console.log('✅ Routes loaded');
        
        // Step 4: Connect to database (async, non-blocking)
        connectDB();
        
    } catch (error) {
        console.error('❌ Init error:', error.message);
    }
}

// ========================================
// DATABASE CONNECTION
// ========================================

const connectDB = async () => {
    try {
        if (!CONFIG.MONGODB_URI) {
            console.error('❌ MONGODB_URI not set');
            return;
        }

        console.log('🔌 Connecting to MongoDB...');
        
        await mongoose.connect(CONFIG.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ MongoDB connected');
        
        // Run maintenance in background (don't block)
        setImmediate(() => {
            runMaintenanceTasks();
        });
        
    } catch (error) {
        console.error('❌ MongoDB error:', error.message);
        // Retry after 10 seconds
        setTimeout(connectDB, 10000);
    }
};

// ========================================
// BACKGROUND MAINTENANCE TASKS
// ========================================

async function runMaintenanceTasks() {
    try {
        console.log('🔧 Running maintenance...');
        
        const { Product, Order, User } = global.Models;
        
        // Create indexes (async, don't wait)
        Product.ensureIndexes().catch(e => {});
        Order.ensureIndexes().catch(e => {});
        User.ensureIndexes().catch(e => {});
        
        // Create admin user if needed
        await createAdminUser();
        
        // Fix order number index if needed
        await fixOrderNumberIndex();
        
        console.log('✅ Maintenance complete');
        
    } catch (error) {
        console.error('❌ Maintenance error:', error.message);
    }
}

// Fix orderNumber index
async function fixOrderNumberIndex() {
    try {
        const { Order } = global.Models;
        const collection = mongoose.connection.collection('orders');
        
        // Check if old index exists
        const indices = await collection.indexes();
        const hasOldIndex = indices.some(idx => 
            idx.name === 'orderNumber_1' && !idx.sparse
        );
        
        if (hasOldIndex) {
            await collection.dropIndex('orderNumber_1').catch(e => {});
        }
        
        // Sync orderNumber with numeroCommande
        await collection.updateMany(
            { 
                numeroCommande: { $exists: true, $ne: null },
                $or: [
                    { orderNumber: null },
                    { orderNumber: { $exists: false } }
                ]
            },
            [{ $set: { orderNumber: "$numeroCommande" } }]
        );
        
    } catch (error) {
        // Silently fail - not critical
    }
}

// Create admin user
async function createAdminUser() {
    try {
        const { User } = global.Models;
        const admin = await User.findOne({ email: 'pharmaciegaher@gmail.com' });
        
        if (!admin) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash('anesaya75', salt);
            
            const newAdmin = new User({
                nom: 'Gaher',
                prenom: 'Parapharmacie',
                email: 'pharmaciegaher@gmail.com',
                password: hashedPassword,
                telephone: '0555123456',
                adresse: 'Tipaza, Algérie',
                wilaya: 'Tipaza',
                role: 'admin',
                actif: true
            });
            
            await newAdmin.save();
            console.log('✅ Admin user created');
        }
    } catch (error) {
        // Silently fail - not critical
    }
}

// ========================================
// DATABASE EVENT HANDLERS
// ========================================

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = (signal) => {
    console.log(`\n⚠️  ${signal} - shutting down...`);
    
    server.close(async () => {
        console.log('✅ Server closed');
        
        try {
            await mongoose.connection.close();
            console.log('✅ DB closed');
            process.exit(0);
        } catch (err) {
            console.error('❌ Shutdown error:', err);
            process.exit(1);
        }
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Force shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ========================================
// ERROR HANDLERS
// ========================================

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
});

module.exports = app;
