import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import User from './schema/user.js';
import Photo from './schema/photo.js';

const app = express();

// define these in env and import in this file
const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1/project2';

const USER_LIST_PROJECTION = '_id first_name last_name';
const USER_DETAIL_PROJECTION = '_id first_name last_name location description occupation';
const PHOTO_PROJECTION = '_id user_id file_name date_time comments';


// Enable CORS for frontend running on a different port
app.use(cors());

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

/**
 * GET /user/list
 * Returns the list of users.
 */
app.get('/user/list', async (req, res) => {
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
app.get('/user/:id', async (req, res) => {
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
app.get('/photosOfUser/:id', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
