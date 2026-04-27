import User from '../schema/user.js';
import Photo from '../schema/photo.js';
import { isValidObjectId, createUserLookup, shapePhoto } from '../lib/additionalFunctions.js';

const USER_LIST_PROJECTION = '_id first_name last_name';
const PHOTO_PROJECTION = '_id user_id file_name date_time comments likes';

function shouldIncludeLikes(req) {
  const includeLikes = req.query?.includeLikes;
  return includeLikes === '1' || includeLikes === 'true';
}

async function buildUserLookup() {
  const users = await User.find({}, USER_LIST_PROJECTION).lean();
  return createUserLookup(users);
}

export async function getPhotosOfUser(req, res) {
  try {
    const userId = req.params.id;
    const includeLikes = shouldIncludeLikes(req);

    if (!isValidObjectId(userId)) {
      return res.status(400).send('Invalid user id');
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).send('User not found');
    }

    const [photos, userLookup] = await Promise.all([
      Photo.find({ user_id: userId }, PHOTO_PROJECTION).lean(),
      buildUserLookup(),
    ]);

    const response = photos.map((photo) => shapePhoto(photo, userLookup, { includeLikes }));

    return res.json(response);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function createPhoto(req, res) {
  try {
    const url = typeof req.body?.url === 'string' ? req.body.url.trim() : '';

    if (!url) {
      return res.status(400).send('url is required.');
    }

    const photo = await Photo.create({
      file_name: url,
      user_id: req.session.userId,
      date_time: new Date(),
    });

    return res.json(shapePhoto(photo.toObject(), new Map(), { includeLikes: true }));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function togglePhotoLike(req, res) {
  try {
    const { photoId } = req.params;
    const currentUserId = String(req.session.userId);

    if (!isValidObjectId(photoId)) {
      return res.status(404).send('Photo not found.');
    }

    const existingPhoto = await Photo.findById(photoId, '_id likes').lean();
    if (!existingPhoto) {
      return res.status(404).send('Photo not found.');
    }

    const alreadyLiked = (existingPhoto.likes || [])
      .some((likeUserId) => String(likeUserId) === currentUserId);

    const updateOperation = alreadyLiked
      ? { $pull: { likes: currentUserId } }
      : { $addToSet: { likes: currentUserId } };

    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      updateOperation,
      { new: true, projection: PHOTO_PROJECTION },
    ).lean();

    if (!updatedPhoto) {
      return res.status(404).send('Photo not found.');
    }

    const userLookup = await buildUserLookup();
    return res.json(shapePhoto(updatedPhoto, userLookup, { includeLikes: true }));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function addComment(req, res) {
  try {
    const currentPhotoId = req.params.photoId;
    const rawComment = req.body?.comment;
    const comment = typeof rawComment === 'string' ? rawComment.trim() : '';

    if (!comment) {
      return res.status(400).send('Comment must not be empty!');
    }

    if (!isValidObjectId(currentPhotoId)) {
      return res.status(400).send('Invalid Photo Id');
    }

    const photo = await Photo.findById(currentPhotoId);

    if (!photo) {
      return res.status(404).send('Photo does not exist.');
    }

    photo.comments.push({
      comment,
      user_id: req.session.userId,
      date_time: new Date(),
    });

    await photo.save();

    return res.status(200).json({ message: 'Comment Added' });
  } catch (err) {
    return res.status(500).send(err.message);
  }
}