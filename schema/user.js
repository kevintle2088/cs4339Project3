// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";

/**
 * Define the Mongoose Schema for a User.
 */
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  occupation: { type: String, default: '' },
  login_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password_digest: { type: String, required: true },
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
export default User;
