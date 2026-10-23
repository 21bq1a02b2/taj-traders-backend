import User from '../models/User.js';
import { getIsMongoConnected } from '../config/db.js';

// Pre-seeded memory users for resilient offline/in-memory mode
let memoryUsers = [
  {
    _id: 'usr_admin_1',
    name: 'Taj Admin (Store Owner)',
    email: 'admin@tajtraders.com',
    password: 'admin123',
    role: 'admin',
    salonName: 'Taj Traders Beauty Hub',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_cust_2',
    name: 'Priya Sharma (Salon Partner)',
    email: 'customer@tajtraders.com',
    password: 'user123',
    role: 'customer',
    salonName: 'Glow & Glam Parlour',
    phone: '+91 98123 45678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    createdAt: new Date().toISOString(),
  },
];

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsMongoConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user || user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const userProfile = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        salonName: user.salonName,
        phone: user.phone,
        avatar: user.avatar,
      };

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token: `token_${user._id}_${Date.now()}`,
        user: userProfile,
      });
    }

    // In-memory mode fallback
    const user = memoryUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Use demo credentials or register.',
      });
    }

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      salonName: user.salonName,
      phone: user.phone,
      avatar: user.avatar,
    };

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token: `token_${user._id}_${Date.now()}`,
      user: userProfile,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', salonName = '', phone = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (getIsMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }

      const newUser = await User.create({
        name,
        email: cleanEmail,
        password, // In production, hash with bcrypt
        role,
        salonName,
        phone,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      });

      const userProfile = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        salonName: newUser.salonName,
        phone: newUser.phone,
        avatar: newUser.avatar,
      };

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token: `token_${newUser._id}_${Date.now()}`,
        user: userProfile,
      });
    }

    // In-memory fallback
    const existing = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email: cleanEmail,
      password,
      role,
      salonName,
      phone,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    memoryUsers.unshift(newUser);

    const userProfile = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      salonName: newUser.salonName,
      phone: newUser.phone,
      avatar: newUser.avatar,
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token: `token_${newUser._id}_${Date.now()}`,
      user: userProfile,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDemoAccounts = (req, res) => {
  res.json({
    success: true,
    data: [
      {
        role: 'admin',
        title: 'Taj Admin (Store Owner / Manager)',
        email: 'admin@tajtraders.com',
        password: 'admin123',
        description: 'Full admin access to add products, edit catalog, view orders',
      },
      {
        role: 'customer',
        title: 'Priya Sharma (Salon Professional)',
        email: 'customer@tajtraders.com',
        password: 'user123',
        description: 'B2B Wholesale client with wishlist & checkout history',
      },
    ],
  });
};
