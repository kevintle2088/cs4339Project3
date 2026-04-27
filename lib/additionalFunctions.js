import mongoose from 'mongoose';

export function isValidObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return String(new mongoose.Types.ObjectId(id)) === String(id).toLowerCase();
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function shapeUserListItem(user) {
  return { _id: String(user._id), first_name: user.first_name, last_name: user.last_name };
}

export function shapeUserDetail(user) {
  return {
    _id: String(user._id),
    first_name: user.first_name,
    last_name: user.last_name,
    location: user.location,
    description: user.description,
    occupation: user.occupation,
  };
}

export function shapeAuthUser(user) {
  return { ...shapeUserDetail(user), login_name: user.login_name };
}

export function createUserLookup(users) {
  return new Map(users.map((user) => [String(user._id), shapeUserListItem(user)]));
}

export function shapePhoto(photo, userLookup, options = {}) {
  const { includeLikes = false } = options;

  const comments = (photo.comments || []).map((comment) => {
    const commentUser = userLookup.get(String(comment.user_id));
    if (!commentUser) throw new Error(`Missing user for comment ${String(comment._id)}`);
    return {
      _id: String(comment._id),
      comment: comment.comment,
      date_time: comment.date_time,
      user: commentUser,
    };
  });

  const shapedPhoto = {
    _id: String(photo._id),
    user_id: String(photo.user_id),
    file_name: photo.file_name,
    date_time: photo.date_time,
    comments,
  };

  if (includeLikes) {
    shapedPhoto.likes = (photo.likes || []).map((likeUserId) => String(likeUserId));
  }

  return shapedPhoto;
}