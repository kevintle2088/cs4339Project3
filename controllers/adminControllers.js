import bcrypt from 'bcrypt';
import User from '../schema/user.js';
import { isNonEmptyString, shapeAuthUser } from '../lib/additionalFunctions.js';

const USER_AUTH_PROJECTION = '_id first_name last_name location description occupation login_name';

export async function login(req, res) {
  try {
    const { login_name, password } = req.body ?? {};

    if (!isNonEmptyString(login_name) || !isNonEmptyString(password)) {
      return res.status(400).send('login_name and password are required.');
    }

    const user = await User.findOne({ login_name: login_name.trim() }).lean();
    if (!user) return res.status(400).send('Invalid login_name or password.');

    const passwordMatches = await bcrypt.compare(password, user.password_digest);
    if (!passwordMatches) return res.status(400).send('Invalid login_name or password.');

    req.session.userId = String(user._id);
    return res.json(shapeAuthUser(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

export function logout(req, res) {
  if (!req.session?.userId) return res.status(400).send('No user is currently logged in.');

  return req.session.destroy((err) => {
    if (err) return res.status(500).send('Unable to logout.');
    res.clearCookie('connect.sid');
    return res.status(200).send('Logged out.');
  });
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.session.userId, USER_AUTH_PROJECTION).lean();
    if (!user) return res.status(401).send('Unauthorized');
    return res.json(shapeAuthUser(user));
  } catch (err) {
    return res.status(500).send(err.message);
  }
}