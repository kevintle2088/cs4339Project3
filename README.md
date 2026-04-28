# Project 4:

## Prerequisites
- Node.js LTS (>= 18), npm (>= 9)
- MongoDB Atlas cluster
- Cloudinary account with unsigned upload preset
- Vercel and Render Accounts 

## Overview

This is a photo sharing application built with React, Express, and MongoDB Atlas. Features include:
- User authentication (login, register, logout)
- Photo uploads directly to Cloudinary (unsigned preset)
- Like/unlike photos with persistent like counts
- Comments on photos with user information
- Server state management with TanStack Query
- Secure sessions with express-session and bcrypt password hashing
- Responsive UI with Material-UI components

## Deployed Application

- **Frontend (Vercel)**: cs4339-project3.vercel.app
- **Backend (Render)**: https://cs4339project3.onrender.com/

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

## Docker

Build the backend image from the project root:

```bash
docker build -t photo-app-backend .
```

Run the backend container with environment variables from .env:

```bash
docker run -p 3001:3001 --env-file .env --name backend-docker photo-app-backend
```

Stop Container 

```bash
docker stop backend-docker
docker rm backend-docker
```

## GitHub Actions CI/CD

The workflow lives at [.github/workflows/main.yml](.github/workflows/main.yml) and runs on every push to `main`.


## Project Structure

```
├── webServer.js              # Express server entry point
├── photoShare.jsx            # React app entry point
├── controllers/              # Business logic for routes
├── routes/                   # API endpoint definitions
├── schema/                   # Mongoose models
├── middleware/               # Custom middleware (e.g., requireLogin)
├── lib/                      # Utility functions (api.js, helper functions)
├── components/               # React components
├── styles/                   # CSS files
├── test/                     # Mocha test suite
├── Dockerfile                # Docker configuration
├── vercel.json               # Vercel routing configuration
├── .github/workflows/        # GitHub Actions CI/CD pipeline
├── .env                      # Local environment variables (not in git)
└── .gitignore                # Git ignore rules
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