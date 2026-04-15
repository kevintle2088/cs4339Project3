import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import { addComment } from './controllers/photoControllers.js';
import { requireLogin } from './middleware/requireLogin.js';

const app = express();
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project3';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const sessionSecret = process.env.SESSION_SECRET || 'photo-share-session-secret';

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json());
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

mongoose.connect(mongoUrl);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/photosOfUser', photoRoutes);
app.post('/commentsOfPhoto/:photoId', requireLogin, addComment);

app.listen(port, () => console.log(`Server running on port ${port}`));