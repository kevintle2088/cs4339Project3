# Project 4: Cloudinary Upload + Likes + Atlas

## Prerequisites
- Node.js LTS (>= 18), npm (>= 9)
- MongoDB Atlas cluster
- Cloudinary account with unsigned upload preset

## Overview
- TanStack Query for server state (`useQuery` / `useMutation`)
- Express sessions + **bcrypt** (`password_digest` on `User`; never store plain passwords)
- Login, logout, registration, and commenting on photos
- Direct browser-to-Cloudinary photo uploads, persisted in MongoDB Atlas
- Photo like/unlike toggle with persistent like counts
- Git/GitHub workflow per course spec (feature branches, PRs)

## Setup
```bash
npm install
cd test && npm install && cd ../..
```

Create a `.env` file in the repository root:

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
`loadDatabase.js` stores a fixed bcrypt digest for every demo user.

## Run
```bash
npm run server   # Express, port 3001
npm run client   # Vite, port 3000
# or
npm run dev
```

## API (course contract)
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

Optional for the UI: `GET /admin/me` returning the session user (not required by the bundled tests).

## Testing
Reset DB, start the server on port 3001, then:
```bash
cd test
npm install
npm test
```

Includes the original Project 3 tests.

## Lint
```bash
npm run lint
```

## Style (course)
- MVC-style split (routes/controllers/models), thin `webServer.js`
- Central frontend API module (e.g. `api.js`)
- Cloudinary upload is direct from frontend to Cloudinary
- ESLint clean; remove or disable React Query Devtools before submit
