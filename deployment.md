# 🚀 HaatOnline - Production Deployment Guide

This guide contains step-by-step instructions for deploying the **HaatOnline** application to a production environment. The application is fully production-ready, featuring environment-aware security, rate limiting, and performance optimizations.

---

## 📐 System Architecture

The application is structured as a decoupled architecture:

```
┌────────────────────────────────┐
│         FRONTEND LAYER         │
│        (React 19 + Vite)       │
│  Deployed on: Vercel / Netlify │
└───────────────┬────────────────┘
                │
          HTTPS │ /api/*
                │
┌───────────────▼────────────────┐
│         BACKEND LAYER          │
│       (Node.js + Express)      │
│  Deployed on: Render / Railway │
└───────────────┬────────────────┘
                │
   Secure TLS   │ (mongodb+srv://)
   Connection   │
┌───────────────▼────────────────┐
│         DATABASE LAYER         │
│       (MongoDB Atlas Cloud)    │
│  Multi-Region Replica Cluster  │
└────────────────────────────────┘
```

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

Before deploying the frontend or backend, establish a production-ready database:

1. **Sign In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create Project**: Click **New Project** and name it `HaatOnline-Prod`.
3. **Deploy Database**:
   - Choose the **M0 Shared Free Tier** (or upgrade as needed).
   - Select your preferred cloud provider (e.g., AWS) and a region closest to your target users.
   - Click **Create**.
4. **Configure Database Access**:
   - Navigate to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Configure **Password-based authentication**.
   - Create a username (e.g., `haatonline_prod_user`) and generate a strong password. **(Save this password securely!)**
   - Under **Database User Privileges**, select **Read and Write to any database**.
5. **Configure Network Access**:
   - Navigate to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) or enter the static IP of your backend server for maximum security.
   - Click **Confirm**.
6. **Obtain Connection String**:
   - Navigate to **Deployment** → **Database**.
   - Click **Connect** on your cluster.
   - Click **Drivers** under *Connect to your application*.
   - Copy the connection string. It will look like this:
     ```
     mongodb+srv://haatonline_prod_user:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<password>` with your database user's password and insert `haatonline-prod` before the `?` query parameter to name the production database.

---

## 🧠 Step 2: Backend Deployment (Render)

Render is recommended for hosting the Node.js backend.

1. **Push Code**: Ensure your latest code is pushed to your GitHub repository.
2. **Create Web Service**:
   - Go to the [Render Dashboard](https://dashboard.render.com/) and click **New** → **Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings**:
   - **Name**: `haatonline-backend`
   - **Environment**: `Node`
   - **Region**: Select the same region as your MongoDB cluster.
   - **Branch**: `main` (or your active production branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod` (Runs the backend with `NODE_ENV=production`)
4. **Environment Variables**:
   Click **Advanced** and add the following variables:

   | Key | Value | Notes |
   |:---|:---|:---|
   | `NODE_ENV` | `production` | Enforces production-grade security, rate-limiting, and compression |
   | `PORT` | `5000` | Port for the backend server |
   | `CLIENT_URL` | `https://your-frontend-domain.vercel.app` | URL of your deployed frontend |
   | `MONGO_URI` | `mongodb+srv://.../haatonline-prod?ssl=true` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | *[Generate Secure Key]* | A 32+ character random hex string |

   > [!TIP]
   > Generate a highly secure `JWT_SECRET` locally in your terminal using:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   > ```

5. **Deploy**: Click **Create Web Service**. Once deployed, copy your backend service URL (e.g., `https://haatonline-backend.onrender.com`).

---

## 🎨 Step 3: Frontend Deployment (Vercel)

Vercel is optimized for building and hosting static and React-based SPAs.

1. **Install Vercel CLI (Optional)**:
   ```bash
   npm install -g vercel
   ```
2. **Deploy via Vercel Dashboard**:
   - Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** → **Project**.
   - Import your GitHub repository.
   - **Framework Preset**: `Vite` (Vercel automatically detects this)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   Add the following variables in the **Environment Variables** section:

   | Key | Value | Notes |
   |:---|:---|:---|
   | `VITE_API_URL` | `https://haatonline-backend.onrender.com/api` | The exact URL of your deployed backend + `/api` |
   | `VITE_ENABLE_DEBUG` | `false` | Disables verbose client debugging statements |

4. **Deploy**: Click **Deploy**. Vercel will build the frontend and provide your production URL.

---

## 🛡️ Production Security & Optimizations (Automatic)

Once the backend detects `NODE_ENV=production`, it automatically enables:

* 🔒 **Helmet.js Headers**: Enforces strict security configurations to defend against Cross-Site Scripting (XSS), clickjacking, and MIME sniffing.
* 🛡️ **Aggressive Rate Limiting**:
  * **Global**: Max 100 requests per 15 minutes per IP.
  * **Auth Routes**: Max 20 requests per 15 minutes per IP (blocks brute-force logins).
  * **Checkout Routes**: Max 5 requests per minute per IP (prevents double charging and transaction spam).
* 🍪 **Secure Cookie Handling**: Elevates cookies to HTTPS-only, securing sessions with `SameSite=Strict`.
* 🌐 **Strict CORS Boundaries**: Blocks request origins that do not match the specified `CLIENT_URL`.
* ⚡ **Gzip Payload Compression**: Shrinks HTTP response sizes, delivering rapid page loads to users.
* 👁️ **Error Stack Redaction**: Prevents sensitive database schemas or file paths from showing up in frontend console errors.

---

## 🧪 Post-Deployment Verification

### 1. Verify Backend Health
Open a browser or run a cURL command to check the backend health endpoint:
```bash
curl https://your-backend-url.onrender.com/healthz
```
**Expected Response**:
```json
{ "success": true, "message": "OK", "env": "production" }
```

### 2. Verify CORS and Database Writes
1. Visit your deployed frontend website.
2. Navigate to the **Register** page.
3. Fill out the form and submit it.
4. If successful, you will be automatically logged in and redirected to the home screen.
5. Connect your **MongoDB Compass** using the Atlas connection string to confirm the new user is recorded under the `users` collection.
