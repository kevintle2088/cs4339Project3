

---

## Part 5: Backend Deployment (Render)

### 5.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up (recommend GitHub login for easy integration)

### 5.2 Create Web Service

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your photo-share repository
4. Fill in service details:
   - **Name**: `photo-app-backend` (or any name)
   - **Runtime**: Select "Docker"
   - **Branch**: `main`
5. Click "Create Web Service"

### 5.3 Configure Environment Variables

1. In Render service dashboard, go to "Environment"
2. Add the following environment variables:

```
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLIENT_ORIGIN=https://your-vercel-frontend-url.vercel.app
NODE_ENV=production
```

**Important**: 
- Use the exact same values from your `.env` file
- CLIENT_ORIGIN will be your Vercel frontend URL (you'll set this after deploying frontend)

### 5.4 Create Deploy Hook

1. In Render service, scroll down to "Deploy Hook"
2. Click "Create Deploy Hook"
3. Name: `GitHub` (or any name)
4. Copy the generated URL
5. Save this URL as `RENDER_DEPLOY_HOOK` GitHub Secret

### 5.5 Verify Initial Deployment

1. Wait for Render to build and deploy (usually 2-5 minutes)
2. Check build logs for errors
3. Once deployed, you'll get a URL like `https://photo-app-backend.onrender.com`
4. Test it: `curl https://photo-app-backend.onrender.com/user/list`
   - Should return 401 (expected - not logged in)
5. Save this URL - you'll need it for frontend setup

---

## Part 6: Frontend Deployment (Vercel)

### 6.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select your photo-share repository
5. Vercel should auto-detect it as a Vite project
6. Click "Deploy"

### 6.2 Configure Environment Variables

1. After project is created, go to Settings → Environment Variables
2. Add the following variables:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_PRESET=your_upload_preset
```

**Replace values with your actual credentials**

3. Redeploy by going to Deployments → Latest → Redeploy

### 6.3 Copy Frontend URL

1. After deployment succeeds, you'll get a URL like:
   `https://photo-app.vercel.app`
2. Go back to Render backend environment variables
3. Update `CLIENT_ORIGIN` to your Vercel URL
4. Render will auto-redeploy with the new variable

### 6.4 Verify Frontend Deployment

1. Visit your Vercel URL
2. Register and log in
3. Try uploading a photo
4. Like/unlike a photo
5. All features should work

---

## Part 7: Continuous Deployment Setup

### 7.1 Update GitHub Secrets (Complete List)

Ensure all secrets are in GitHub:

```
MONGODB_URI          = mongodb+srv://...
SESSION_SECRET       = random_hex_string
VERCEL_TOKEN         = vercel_xxx...
VERCEL_ORG_ID        = team_xxx...
VERCEL_PROJECT_ID    = project_xxx...
RENDER_DEPLOY_HOOK   = https://api.render.com/deploy/...
```