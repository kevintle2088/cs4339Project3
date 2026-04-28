import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import mongoose from 'mongoose';
import session from 'express-session';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import photosRoutes from './routes/photosRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(48).toString('hex');

if (!mongoUrl) {
  throw new Error('MONGODB_URI is required in environment variables.');
}

if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is not set. Using an ephemeral secret for this process.');
}

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'none', secure: true},
}));

mongoose.connect(mongoUrl);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/photosOfUser', photoRoutes);
app.use('/photos', photosRoutes);
app.use('/commentsOfPhoto', commentRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));