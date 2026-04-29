## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret below

## Required Secrets

### 1. MONGODB_URI
**Purpose**: Connection string for MongoDB Atlas database

**Value**: Your MongoDB Atlas connection string

**Example**: `mongodb+srv://projectuser:password123@cluster0.abc123.mongodb.net/project4?retryWrites=true&w=majority`

**How to get**:
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Open your cluster
3. Click "Connect" → "Drivers" → "Node.js"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `project4`

---

### 2. SESSION_SECRET
**Purpose**: Secret key for securing user sessions

**Value**: A random 32-character hexadecimal string

**Example**: `a7b9c2d5e8f1g4h7i0j3k6l9m2n5o8p1`

**How to generate**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then copy and paste the output.

---

### 3. VERCEL_TOKEN
**Purpose**: Authentication token for deploying to Vercel

**Value**: Your Vercel authentication token

**How to get**:
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create"
3. Give it a name like "GitHub CI/CD"
4. Set expiration: No expiration (or choose one)
5. Click "Create Token"
6. Copy the token immediately (you won't see it again)

---

### 4. VERCEL_ORG_ID
**Purpose**: Your Vercel organization/team ID

**Value**: A unique identifier for your Vercel account

**How to get**:
1. Go to [vercel.com/account/general](https://vercel.com/account/general)
2. Look for "Team ID" in General section
3. Copy and paste it

---

### 5. VERCEL_PROJECT_ID
**Purpose**: Your specific Vercel project ID

**Value**: The project ID for this application

**How to get**:
1. Create a Vercel project first (see DEPLOYMENT_GUIDE.md Part 6)
2. Go to project Settings
3. Look for "Project ID"
4. Copy and paste it

---

### 6. RENDER_DEPLOY_HOOK
**Purpose**: Webhook URL to trigger deployments on Render

**Value**: A special deploy hook URL from Render

**How to get**:
1. Create a Render service first (see DEPLOYMENT_GUIDE.md Part 5)
2. Go to your service settings
3. Find "Deploy Hook" section at the bottom
4. Click "Create Deploy Hook"
5. Name it "GitHub" or similar
6. Copy the generated URL
7. Paste it as the secret value

---

## Summary Table

| Secret Name | Value Type | Status |
|-------------|-----------|--------|
| `MONGODB_URI` | Connection string | ⚠️ Required |
| `SESSION_SECRET` | Random hex string | ⚠️ Required |
| `VERCEL_TOKEN` | Auth token | ⚠️ Required |
| `VERCEL_ORG_ID` | Team ID | ⚠️ Required |
| `VERCEL_PROJECT_ID` | Project ID | ⚠️ Required |
| `RENDER_DEPLOY_HOOK` | Webhook URL | ⚠️ Required |

---
