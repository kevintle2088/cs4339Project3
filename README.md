# Project 4:

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
VITE_API_BASE_URL=http://localhost:3001
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

``` bash
docker stop backend-docker
```

Restart Container 

``` bash
docker rm -f backend-docker
docker run -d -p 3001:3001 --env-file .env --name backend-docker photo-app-backend
```

## GitHub Actions CI/CD

The workflow lives at [.github/workflows/main.yml](.github/workflows/main.yml) and runs on every push to `main`.

### GitHub secrets to add

Add these in GitHub under Settings > Secrets and variables > Actions:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RENDER_DEPLOY_HOOK`

### GitHub setup checklist

1. Push the workflow file to the repository.
2. Add the secrets above in GitHub Actions.
3. Make sure the Vercel project is already created and linked to this repo.
4. Make sure the Render backend has a deploy hook URL and its environment variables set in the Render dashboard.
5. Set the frontend production API URL in Vercel so it points to the deployed backend.
6. Push to `main`; GitHub Actions should lint, test, then trigger both deployments.

### Notes

- The CI test job uses a MongoDB service container, so it does not need your Atlas connection string in GitHub Actions.
- GitHub should store only the deployment credentials; app runtime env vars still belong in Vercel and Render.
- Render should have `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_ORIGIN`, and `NODE_ENV=production`.
- Vercel should have `VITE_API_BASE_URL` set to the deployed Render backend URL.
- Vercel uses [vercel.json](vercel.json) to rewrite client-side routes to `index.html`.

## Deployed URLs

After deployment, replace these placeholders with your live URLs:

- Frontend: https://your-frontend.vercel.app
- Backend: https://your-backend.onrender.com

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