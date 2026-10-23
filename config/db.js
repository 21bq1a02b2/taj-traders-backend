import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { seedProducts } from '../data/seedProducts.js';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cosmetics';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed if products collection is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Empty catalog detected. Seeding initial cosmetics products...');
      await Product.insertMany(seedProducts);
      console.log(`[MongoDB] Successfully seeded ${seedProducts.length} cosmetics products!`);
    } else {
      console.log(`[MongoDB] Database contains ${count} cosmetics products.`);
    }
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[MongoDB] Could not connect to MongoDB at "${uri}".`);
    console.warn(`[MongoDB] Error: ${error.message}`);
    console.warn(`[MongoDB] Notice: Running with built-in resilient catalog so the app works immediately!`);
    console.warn(`[MongoDB] (To use MongoDB, start your local mongod service or update MONGO_URI in backend/.env)`);
  }
};

export const getIsMongoConnected = () => isMongoConnected;
