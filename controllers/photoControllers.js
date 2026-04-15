import User from '../schema/user.js';
import Photo from '../schema/photo.js';
import { isValidObjectId, createUserLookup, shapePhoto } from '../lib/additionalFunctions.js';

const USER_LIST_PROJECTION = '_id first_name last_name';
const PHOTO_PROJECTION = '_id user_id file_name date_time comments';

export async function getPhotosOfUser(req, res) {
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
}

export async function addComment(req, res) {
  try {
    const currentPhotoId = req.params.photoId;
    const { comment } = req.body;
    const photo = await Photo.findById(currentPhotoId);

    if (!req.session || !req.session.userId) {
      return res.status(401).send('Unauthorized User');
    }

    if (!comment || !comment.trim()) {
      return res.status(400).send('Comment must not be empty!');
    }

    if (!isValidObjectId(currentPhotoId)) {
      return res.status(400).send('Invalid Photo Id');
    }

    if (!photo) {
      return res.status(404).send('Photo does not exist.');
    }

    photo.comments.push({
      comment: comment.trim(),
      user_id: req.session.userId,
      date_time: new Date(),
    });

    await photo.save();

    return res.status(200).json({ message: 'Comment Added' });
  } catch (err) {
    return res.status(500).send(err.message);
  }
}