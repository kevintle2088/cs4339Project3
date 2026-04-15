import bcrypt from 'bcrypt';
import User from '../schema/user.js';
import {
  isValidObjectId, isNonEmptyString, normalizeOptionalString,
  shapeUserListItem, shapeUserDetail, shapeAuthUser,
} from '../lib/additionalFunctions.js';

const USER_LIST_PROJECTION = '_id first_name last_name';
const USER_DETAIL_PROJECTION = '_id first_name last_name location description occupation';

export async function listUsers(req, res) {
  try {
    const users = await User.find({}, USER_LIST_PROJECTION).lean();
    return res.json(users.map(shapeUserListItem));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).send('Invalid user id');

    const user = await User.findById(id, USER_DETAIL_PROJECTION).lean();
    if (!user) return res.status(404).send('User not found');

    return res.json(shapeUserDetail(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export async function registerUser(req, res) {
  try {
        const loginName = req.body?.login_name;
        const password = req.body?.password;
        const firstName = req.body?.first_name;
        const lastName = req.body?.last_name;

    if (!isNonEmptyString(loginName)) return res.status(400).send('login_name is required.');
if (!isNonEmptyString(password)) return res.status(400).send('password is required.');
if (!isNonEmptyString(firstName)) return res.status(400).send('first_name is required.');
if (!isNonEmptyString(lastName)) return res.status(400).send('last_name is required.');

const exists = await User.exists({ login_name: loginName.trim() });
if (exists) return res.status(400).send('login_name is already in use.');

const password_digest = await bcrypt.hash(password, 10);
const user = await User.create({
  login_name: loginName.trim(),
  password_digest,
  first_name: firstName.trim(),
  last_name: lastName.trim(),
  location: normalizeOptionalString(req.body?.location),
  description: normalizeOptionalString(req.body?.description),
  occupation: normalizeOptionalString(req.body?.occupation),
});

    return res.json(shapeAuthUser(user));
  } catch (err) {
      console.error('registerUser error:', err);
    if (err?.code === 11000) return res.status(400).send('login_name is already in use.');
    return res.status(500).send(err.message);
  }
}