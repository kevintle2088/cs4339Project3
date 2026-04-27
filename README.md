# Project 4: Part 1 and 2

## Prerequisites
- Node.js LTS (>= 18), npm (>= 9)
- MongoDB Atlas cluster
- Cloudinary account with unsigned upload preset

## Overview
- TanStack Query for server state (useQuery / useMutation)
- Express sessions + bcrypt
- Login, logout, registration, and commenting on photos
- Direct browser-to-Cloudinary photo uploads in MongoDB Atlas
- Photo like/unlike toggle with like counts

## Setup
```bash
npm install
cd test && npm install
```

Create a .env file in the root:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
VITE_API_URL=http://localhost:3001
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_PRESET=your_unsigned_upload_preset
SESSION_SECRET=your_session_secret
CLIENT_ORIGIN=http://localhost:3000
```

### Seed Atlas Database

```bash
npm run seed
```

### Seeded passwords
loadDatabase.js stores a fixed bcrypt digest for every demo user

## Run
```bash
npm run server   # Express, port 3001
npm run client   # Vite, port 3000
# or
npm run dev
```

## API
| Method | Path | Auth |
|--------|------|------|
| POST | `/admin/login` | no |
| POST | `/admin/logout` | yes (400 if not logged in) |
| POST | `/user` | no (registration) |
| GET | `/user/list` | yes |
| GET | `/user/:id` | yes |
| GET | `/photosOfUser/:id` | yes |
| POST | `/photos` | yes |
| POST | `/photos/:photoId/like` | yes |
| POST | `/commentsOfPhoto/:photoId` | yes |

`GET /admin/me` returning the session user

## Testing
Reset DB, start the server on port 3001, then:
```bash
cd test
npm test
```

## Lint
```bash
npm run lint
```