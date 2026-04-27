/**
 * Loads the Project 4 demo data into MongoDB using Mongoose.
 * Run: node loadDatabase.js
 */

import mongoose from "mongoose";
import bluebird from "bluebird";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import models from "./modelData/photoApp.js";

import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

dotenv.config();

const cloudinaryUrls = {
  "kenobi1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568710/photoapp-seed/kenobi1.jpg",
  "kenobi2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568711/photoapp-seed/kenobi2.jpg",
  "kenobi3.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568711/photoapp-seed/kenobi3.jpg",
  "kenobi4.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568712/photoapp-seed/kenobi4.jpg",
  "ludgate1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568712/photoapp-seed/ludgate1.jpg",
  "malcolm1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568713/photoapp-seed/malcolm1.jpg",
  "malcolm2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568713/photoapp-seed/malcolm2.jpg",
  "ouster.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568714/photoapp-seed/ouster.jpg",
  "ripley1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568714/photoapp-seed/ripley1.jpg",
  "ripley2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568715/photoapp-seed/ripley2.jpg",
  "took1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568715/photoapp-seed/took1.jpg",
  "took2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568716/photoapp-seed/took2.jpg",
};

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required in environment variables.");
}

console.log("Connecting to MongoDB...");

await mongoose.connect(mongoUri);

const seededPasswordDigest = await bcrypt.hash("password", 10);

// ---------------- CLEAN DB ----------------
await Promise.all([
  User.deleteMany({}),
  Photo.deleteMany({}),
  SchemaInfo.deleteMany({}),
]);

// ---------------- USERS ----------------
const userModels = models.userListModel();
const mapFakeId2RealId = {};

for (const user of userModels) {
  const userObj = await User.create({
    first_name: user.first_name,
    last_name: user.last_name,
    location: user.location,
    description: user.description,
    occupation: user.occupation,
    login_name:
      user.login_name ||
      user.last_name.toLowerCase(),
    password_digest: seededPasswordDigest,
  });

  mapFakeId2RealId[user._id] = userObj._id;

  console.log(
    "Adding user:",
    user.first_name,
    user.last_name,
    "ID:",
    userObj._id
  );
}

// ---------------- PHOTOS ----------------
const photoModels = [];

Object.keys(mapFakeId2RealId).forEach((id) => {
  photoModels.push(...models.photoOfUserModel(id));
});

for (const photo of photoModels) {
  const seededPhotoUrl = cloudinaryUrls[photo.file_name];

  if (!seededPhotoUrl) {
    throw new Error(`Missing URL mapping for ${photo.file_name}`);
  }

  const photoObj = await Photo.create({
    file_name: seededPhotoUrl,
    date_time: photo.date_time,
    user_id: mapFakeId2RealId[photo.user_id],
  });

  // comments
  if (photo.comments && photo.comments.length > 0) {
    for (const comment of photo.comments) {
      photoObj.comments.push({
        comment: comment.comment,
        date_time: comment.date_time,
        user_id: mapFakeId2RealId[comment.user._id] || comment.user.objectID,
      });
    }

    await photoObj.save();
  }

  console.log("Adding photo:", photo.file_name);
}

// ---------------- SCHEMA INFO ----------------
await SchemaInfo.create(models.schemaInfo2());

console.log("SchemaInfo object created");

// ---------------- CLEAN EXIT ----------------
await mongoose.disconnect();

console.log("Database load complete");