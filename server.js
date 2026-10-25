import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getIsMongoConnected } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health and Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Taj Traders API',
    database: getIsMongoConnected() ? 'Connected to MongoDB' : 'Resilient In-Memory Mode (Active)',
    endpoints: {
      products: '/api/products',
      categories: '/api/products/categories/all',
      brands: '/api/products/brands/all',
      orders: '/api/orders',
      auth: '/api/auth',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Taj Traders',
    database: getIsMongoConnected() ? 'MongoDB' : 'MemoryCache',
    time: new Date().toISOString(),
  });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`💄 Taj Traders Backend running on port ${PORT}`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}`);
  console.log(`📦 Database: ${getIsMongoConnected() ? 'MongoDB Connected' : 'Resilient In-Memory Mode'}`);
  console.log(`===============================================`);
});
