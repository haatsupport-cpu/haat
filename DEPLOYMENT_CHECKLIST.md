# HaatOnline - Production Ready Deployment Guide

## Overview

HaatOnline is now production-ready with environment-aware configuration for **development** and **production** deployments.

- **Backend**: Node.js + Express 5, MongoDB, JWT Auth
- **Frontend**: React 19 + Vite
- **Database**: MongoDB Atlas
- **Environment-Aware**: Different configs, rate limits, security levels for dev vs prod

---

## 🚀 LOCAL DEVELOPMENT SETUP

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Git

### Quick Start

#### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd frontend
npm install
```

#### 2. Configure Environment

**Backend** (`backend/.env`):
```bash
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/haatonline?retryWrites=true&w=majority
JWT_SECRET=your-dev-secret-32-chars-minimum-change-in-prod
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HaatOnline
VITE_ENABLE_DEBUG=true
```

#### 3. Start Development Servers

**Backend**:
```bash
cd backend
npm run dev
```

**Frontend** (new terminal):
```bash
cd frontend
npm run dev
```

The app will be available at: `http://localhost:5173`

### Development Features

✅ **Relaxed Rate Limiting**: Dev allows 10,000 requests/15min globally, no auth blocking
✅ **Fast Refresh**: Vite hot module replacement (HMR)
✅ **Debug Logs**: Verbose console output for troubleshooting
✅ **Flexible CORS**: All localhost ports allowed
✅ **No HTTPS Required**: Simple HTTP development

---

## 🔒 PRODUCTION DEPLOYMENT

### Architecture

```
┌─────────────────────┐
│   Frontend (CDN)    │  <- Vercel, Netlify, or S3 + CloudFront
│   React 19 + Vite   │
└──────────┬──────────┘
           │
     HTTPS │ /api/*
           │
┌──────────▼──────────┐
│  Backend (Server)   │  <- Render, Railway, VPS, Docker
│  Node.js + Express  │
└──────────┬──────────┘
           │
     TLS  │
           │
┌──────────▼──────────┐
│   MongoDB Atlas     │  <- Managed MongoDB service
│   (Production DB)   │
└─────────────────────┘
```

### Step 1: Backend Deployment

#### Option A: Render (Recommended for Quick Setup)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Create new Web Service on Render**:
   - Connect your GitHub repo
   - Set runtime to Node
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm run start:prod`

3. **Add Environment Variables** (Render Dashboard):
   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-frontend-domain.com
   MONGO_URI=mongodb+srv://prod_user:strong-password@prod-cluster.mongodb.net/haatonline-prod?retryWrites=true&w=majority
   JWT_SECRET=your-production-jwt-secret-strong-random-32-chars
   ```

4. **Get Backend URL** (e.g., `https://haatonline-api.onrender.com`)

#### Option B: Railway

Similar to Render but with different UI. Same environment variables needed.

#### Option C: Self-Hosted (VPS/DigitalOcean)

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Clone repo
git clone https://github.com/yourusername/grocery-shop.git
cd grocery-shop/backend

# Install dependencies
npm install

# Create .env with production values
nano .env

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "haatonline-api"
pm2 save
pm2 startup
```

**Production Backend .env** (all servers):
```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
MONGO_URI=mongodb+srv://prod_user:strong_password@cluster.mongodb.net/haatonline-prod?retryWrites=true&w=majority
JWT_SECRET=<generate-with-node-below>
```

Generate strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Frontend Deployment

#### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Add Environment Variables** (Vercel Dashboard):
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_ENABLE_DEBUG=false
   ```

#### Option B: Netlify

1. **Connect GitHub**:
   - Go to netlify.com → New site from Git
   - Connect your GitHub repo
   - Select `frontend` directory

2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

#### Option C: Traditional Hosting (Nginx/Apache)

```bash
# Build frontend
cd frontend
npm run build

# Upload dist/ folder to your web server
# Configure web server to serve index.html for SPA routing
```

**Nginx config example**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/haatonline/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server:5000/api;
    }
}
```

### Step 3: MongoDB Atlas Setup

1. **Create Project** on MongoDB Atlas
2. **Create M0 Cluster** (free tier)
3. **Configure IP Whitelist**:
   - Add your VPS/server IP
   - Or add `0.0.0.0/0` for convenience (less secure)

4. **Create Database User**:
   - Username: `prod_user`
   - Password: (strong, 32+ chars)
   - Database: `haatonline-prod`

5. **Get Connection String**:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/haatonline-prod?retryWrites=true&w=majority`

---

## 🔐 Production Security Features (Automatic)

When `NODE_ENV=production`:

✅ **Helmet.js**: Security headers (CSP, HSTS, X-Frame-Options)
✅ **Compression**: Gzip response compression
✅ **Strict CORS**: Only configured frontend domain allowed
✅ **Aggressive Rate Limiting**:
   - Global: 100 requests/15 min per IP
   - Auth: 20 requests/15 min per IP
   - Checkout: 5 requests/min per IP
✅ **Secure Cookies**: HTTPS-only, SameSite=Strict
✅ **Trust Proxy**: Works behind reverse proxies
✅ **Error Redaction**: No stack traces sent to clients
✅ **JWT Security**: 7-day expiry, strong secret required

---

## 📊 Environment Comparison

| Feature | Development | Production |
|---------|-------------|-----------|
| Rate Limiting | Relaxed (10k/15min) | Strict (100-20/15min) |
| CORS | All localhost | Frontend domain only |
| HTTPS | No | Yes (required) |
| Compression | No | Yes |
| Security Headers | No | Yes |
| Debug Logs | Verbose | Errors only |
| Error Messages | Full stack | Generic message |
| Database Logs | Detailed | Minimal |

---

## 🧪 Testing Deployment

### Backend Health Check

```bash
curl https://your-backend-url.com/healthz
# Expected: {"success":true,"message":"OK","env":"production"}
```

### Frontend Connectivity

```bash
# From browser console
fetch('/api/auth/me')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

### Auth Flow Test

1. Visit frontend: `https://your-frontend-domain.com`
2. Click Register
3. Fill form and submit
4. Should receive JWT token and redirect to dashboard

---

## 🛠️ Troubleshooting

### "CORS not allowed" Error

**Solution**: Update `ALLOWED_ORIGINS` in backend .env:
```bash
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### "Invalid API key" or Connection Errors

**Solutions**:
1. Verify MongoDB Atlas connection string
2. Check IP whitelist on MongoDB Atlas
3. Verify `MONGO_URI` environment variable is set
4. Check backend logs for specific errors

### Rate Limit 429 Errors

**Development**: Should not happen. Rate limiter is relaxed.
**Production**: Normal if user makes >20 auth requests/15min. They'll need to wait.

### Frontend Can't Connect to Backend

**Check**:
1. Backend URL in `VITE_API_URL` is correct
2. Backend is running and healthy
3. Frontend build includes correct env variables
4. No CORS errors in browser console

---

## 📦 Deployment Checklist

Before deploying to production:

- [ ] MongoDB Atlas cluster created with strong credentials
- [ ] `JWT_SECRET` generated with crypto random (32+ chars)
- [ ] Backend `.env.production` configured
- [ ] Frontend `.env.production` configured with backend URL
- [ ] Frontend built: `npm run build`
- [ ] Backend tested locally with `NODE_ENV=production`
- [ ] HTTPS certificate configured (auto with Vercel/Render)
- [ ] Email notifications setup (if needed)
- [ ] CDN configured (optional, for frontend)
- [ ] Database backups enabled (Atlas: automatic)
- [ ] Monitoring setup (Render/Railway/VPS)

---

## 📝 Production Env Files Reference

**backend/.env.production**:
```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/db?retryWrites=true&w=majority
JWT_SECRET=your-random-32-char-secret
```

**frontend/.env.production**:
```bash
VITE_API_URL=https://your-backend-domain.com/api
VITE_ENABLE_DEBUG=false
```

---

## 🚀 Rollback Plan

If deployment has issues:

1. **Keep previous working version** in Git tag:
   ```bash
   git tag v1.0.0-stable
   git push origin v1.0.0-stable
   ```

2. **Redeploy previous version**:
   - Render/Railway/Vercel: Reselect previous deployment
   - VPS: `git checkout v1.0.0-stable && npm install && restart service`

---

## 📞 Support

- Backend logs: Check Render/Railway dashboard
- Frontend errors: Browser console → Network tab
- MongoDB issues: Atlas → Metrics → Network
- General issues: Check each layer individually (frontend → backend → database)
