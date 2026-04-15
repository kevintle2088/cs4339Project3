import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';

import User from './schema/user.js';
import Photo from './schema/photo.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project3';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const sessionSecret = process.env.SESSION_SECRET || 'photo-share-session-secret';

const USER_LIST_PROJECTION = '_id first_name last_name';
const USER_DETAIL_PROJECTION = '_id first_name last_name location description occupation';
const USER_AUTH_PROJECTION = '_id first_name last_name location description occupation login_name';
const PHOTO_PROJECTION = '_id user_id file_name date_time comments';


// Enable CORS for frontend running on a different port
app.use(cors({
  origin: clientOrigin,
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Connect to MongoDB
mongoose.connect(mongoUrl);

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

function isValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  return String(new mongoose.Types.ObjectId(id)) === String(id).toLowerCase();
}

function shapeUserListItem(user) {
  return {
    _id: String(user._id),
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

function shapeUserDetail(user) {
  return {
    _id: String(user._id),
    first_name: user.first_name,
    last_name: user.last_name,
    location: user.location,
    description: user.description,
    occupation: user.occupation,
  };
}

function shapeAuthUser(user) {
  return {
    ...shapeUserDetail(user),
    login_name: user.login_name,
  };
}

function createUserLookup(users) {
  return new Map(users.map((user) => [String(user._id), shapeUserListItem(user)]));
}

function shapePhoto(photo, userLookup) {
  const comments = (photo.comments || []).map((comment) => {
    const commentUser = userLookup.get(String(comment.user_id));

    if (!commentUser) {
      throw new Error(`Missing user for comment ${String(comment._id)}`);
    }

    return {
      _id: String(comment._id),
      comment: comment.comment,
      date_time: comment.date_time,
      user: commentUser,
    };
  });

  return {
    _id: String(photo._id),
    user_id: String(photo.user_id),
    file_name: photo.file_name,
    date_time: photo.date_time,
    comments,
  };
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireLogin(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).send('Unauthorized');
  }

  return next();
}

/**
 * POST /admin/login
 * Authenticates a user and stores identity in session.
 */
app.post('/admin/login', async (req, res) => {
  try {
    const loginName = req.body?.login_name;
    const password = req.body?.password;

    if (!isNonEmptyString(loginName) || !isNonEmptyString(password)) {
      return res.status(400).send('login_name and password are required.');
    }

    const normalizedLoginName = loginName.trim();
    const user = await User.findOne({ login_name: normalizedLoginName }).lean();

    if (!user) {
      return res.status(400).send('Invalid login_name or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.password_digest);
    if (!passwordMatches) {
      return res.status(400).send('Invalid login_name or password.');
    }

    req.session.userId = String(user._id);

    return res.json(shapeAuthUser(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * POST /admin/logout
 * Logs out the current user by destroying their session.
 */
app.post('/admin/logout', (req, res) => {
  if (!req.session?.userId) {
    return res.status(400).send('No user is currently logged in.');
  }

  return req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Unable to logout.');
    }

    res.clearCookie('connect.sid');
    return res.status(200).send('Logged out.');
  });
});

/**
 * GET /admin/me
 * Returns the currently logged-in user.
 */
app.get('/admin/me', requireLogin, async (req, res) => {
  try {
    const sessionUserId = req.session.userId;

    if (!isValidObjectId(sessionUserId)) {
      return res.status(401).send('Unauthorized');
    }

    const user = await User.findById(sessionUserId, USER_AUTH_PROJECTION).lean();
    if (!user) {
      return res.status(401).send('Unauthorized');
    }

    return res.json(shapeAuthUser(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * POST /user
 * Registers a new user with a bcrypt-hashed password.
 */
app.post('/user', async (req, res) => {
  try {
    const loginName = req.body?.login_name;
    const password = req.body?.password;
    const firstName = req.body?.first_name;
    const lastName = req.body?.last_name;

    if (!isNonEmptyString(loginName)) {
      return res.status(400).send('login_name is required.');
    }

    if (!isNonEmptyString(password)) {
      return res.status(400).send('password is required.');
    }

    if (!isNonEmptyString(firstName)) {
      return res.status(400).send('first_name is required.');
    }

    if (!isNonEmptyString(lastName)) {
      return res.status(400).send('last_name is required.');
    }

    const normalizedLoginName = loginName.trim();
    const existingUser = await User.exists({ login_name: normalizedLoginName });
    if (existingUser) {
      return res.status(400).send('login_name is already in use.');
    }

    const passwordDigest = await bcrypt.hash(password, 10);

    const user = await User.create({
      login_name: normalizedLoginName,
      password_digest: passwordDigest,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      location: normalizeOptionalString(req.body?.location),
      description: normalizeOptionalString(req.body?.description),
      occupation: normalizeOptionalString(req.body?.occupation),
    });

    return res.json(shapeAuthUser(user));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).send('login_name is already in use.');
    }

    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/user/list', requireLogin, async (req, res) => {
  try {
    const users = await User.find({}, USER_LIST_PROJECTION).lean();

    const response = users.map((user) => shapeUserListItem(user));

    return res.json(response);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /user/:id
 * Returns the details of one user.
 */
app.get('/user/:id', requireLogin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const user = await User.findById(
      userId,
      USER_DETAIL_PROJECTION,
    ).lean();

    if (!user) {
      return res.status(404).send('User not found');
    }

    return res.json(shapeUserDetail(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

/**
 * GET /photosOfUser/:id
 * Returns all photos of the given user.
 */
app.get('/photosOfUser/:id', requireLogin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).send('User not found');
    }

    const [photos, users] = await Promise.all([
      Photo.find({ user_id: userId }, PHOTO_PROJECTION).lean(),
      User.find({}, USER_LIST_PROJECTION).lean(),
    ]);

    const userLookup = createUserLookup(users);
    const response = photos.map((photo) => shapePhoto(photo, userLookup));

    return res.json(response);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


app.post('/commentsOfPhoto/:photoId', async (req, res) => {
  try{
    
    const currentPhotoId = req.params.photoId;
    const { comment } = req.body;
    const photo = await Photo.findById(currentPhotoId);

    if(!req.session || !req.session.userId){
      return res.status(401).send("Unauthorized User");
    }

    if(!comment || !comment.trim()){
      return res.status(400).send("Comment must not be empty!");
    }

    if(!isValidObjectId(currentPhotoId)){
      return res.status(400).send("Invalid Photo Id");
    }

    if(!photo){
      return res.status(404).send("Photo does not exist.");
    }

    photo.comments.push({
      comment : comment.trim(),
      user_id : req.session.userId,
      date_time : new Date(),
    });

    await photo.save();

    return res.status(200).json({message: "Comment Added"});
  }catch(err){
    return res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
