# HaatOnline Developer Setup Guide

## 📋 Prerequisites

- **Node.js**: v18 or higher
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm**: Comes with Node.js
  - Check: `npm --version`

- **Git**: Version control
  - Download: https://git-scm.com/

- **MongoDB Atlas Account**: Free database
  - Sign up: https://www.mongodb.com/cloud/atlas

- **Code Editor**: VS Code recommended
  - Download: https://code.visualstudio.com/

---

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository

```bash
git clone https://github.com/KuxH/HaatOnline.git
cd HaatOnline
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your MongoDB Atlas credentials
# See "MongoDB Atlas Setup" section below
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Frontend will automatically use http://localhost:5000/api in development
```

### 4. Start Development

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔧 Detailed Setup

### MongoDB Atlas Setup

1. **Create Account**:
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account
   - Verify email

2. **Create Project**:
   - Click "New Project"
   - Name: `HaatOnline`
   - Create project

3. **Create Cluster**:
   - Click "Create deployment"
   - Choose "M0 Free" tier
   - Cloud provider: AWS or your choice
   - Region: Choose closest to you
   - Click "Create deployment"

4. **Add User**:
   - Click "Database Access" (left menu)
   - Click "Add new database user"
   - Username: `haatonline_user`
   - Password: Generate strong password (save it!)
   - Click "Add user"

5. **Add Network Access**:
   - Click "Network Access" (left menu)
   - Click "Add IP address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String**:
   - Go to "Deployment" → "Databases"
   - Click "Connect" on your cluster
   - Choose "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials
   - Replace `myFirstDatabase` with `haatonline`

7. **Backend .env**:
   ```bash
   # backend/.env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGO_URI=mongodb+srv://haatonline_user:your-password@cluster.mongodb.net/haatonline?retryWrites=true&w=majority
   JWT_SECRET=change-this-to-random-32-chars-locally
   ```

### JWT Secret Generation

```bash
# Generate a random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and put in backend/.env
```

### Environment Variables Reference

**Backend (.env)**:
```bash
# Environment
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/haatonline?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-random-secret-here

# CORS (optional, auto-detected for localhost)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Frontend (.env)**:
```bash
# Backend API endpoint
VITE_API_URL=http://localhost:5000/api

# Optional: Debug mode
VITE_ENABLE_DEBUG=true
```

---

## 📂 Project Structure

```
grocery-shop/
├── backend/                    # Node.js + Express API
│   ├── config/                 # Configuration files
│   │   ├── constants.js       # Environment-aware constants
│   │   ├── cors.js            # CORS configuration
│   │   ├── limiters.js        # Rate limiting setup
│   │   └── db.js              # MongoDB connection
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Middleware functions
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── server.js              # Main entry point
│   ├── .env                   # Environment variables (don't commit!)
│   └── package.json
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React context (Auth)
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Environment variables (don't commit!)
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── DEPLOYMENT_CHECKLIST.md     # Production deployment guide
└── DEVELOPER_SETUP.md          # This file
```

---

## 🔑 Available Commands

### Backend

```bash
cd backend

# Development (with hot reload)
npm run dev

# Production start
npm start

# Production with env
npm run start:prod

# Test database connection
npm run test

# Lint check
npm run lint
```

### Frontend

```bash
cd frontend

# Development server (http://localhost:5173)
npm run dev

# Development with external access
npm run dev:host

# Production build
npm run build

# Preview production build
npm run preview

# Lint check
npm run lint

# Build & analyze
npm run build:analyze

# Tailwind CSS watch
npm run tailwindcss
```

---

## 🧪 Testing Development Setup

### Test Backend

```bash
# Check backend is running
curl http://localhost:5000/healthz

# Expected response:
# {"success":true,"message":"OK","env":"development"}

# Check routes available
curl http://localhost:5000/debug/routes
```

### Test Frontend

```bash
# Visit in browser
http://localhost:5173

# Try registering a new account
# Login with that account
# Browse products
# Add to cart
# Checkout (test flow)
```

### Test Database Connection

```bash
cd backend
npm run test

# Should output:
# "✅ MongoDB connected successfully"
```

---

## 🐛 Common Issues & Solutions

### Issue: "ECONNREFUSED 127.0.0.1:27017"

**Problem**: Can't connect to MongoDB

**Solution**:
1. Check MongoDB Atlas connection string in `.env`
2. Verify credentials are correct
3. Check IP whitelist on MongoDB Atlas (0.0.0.0/0 for dev)
4. Verify database name is in URL

### Issue: "Port 5000 already in use"

**Problem**: Another app is using port 5000

**Solution**:
```bash
# Kill existing process on port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: "VITE_API_URL is not defined"

**Problem**: Frontend can't find backend URL

**Solution**:
1. Create `frontend/.env` file
2. Add: `VITE_API_URL=http://localhost:5000/api`
3. Restart frontend dev server

### Issue: CORS errors in browser console

**Problem**: Frontend can't access backend API

**Solution**:
1. Verify backend is running on port 5000
2. Check `VITE_API_URL` in frontend `.env` is correct
3. Verify `CLIENT_URL` in backend `.env` matches frontend URL
4. Check browser console for exact error message

### Issue: "Too many requests (429)"

**Problem**: Rate limiting activated

**Solution**:
1. This shouldn't happen in development (rates are relaxed)
2. Wait 15 minutes for rate limit window to reset
3. Check that `NODE_ENV=development` in backend `.env`

---

## 🛠️ Development Workflow

### Making Code Changes

1. **Backend Changes**:
   - Edit files in `backend/`
   - Nodemon auto-restarts server
   - Refresh browser to see changes

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Vite auto-refreshes (HMR)
   - Browser updates automatically

3. **Database Schema Changes**:
   - Edit models in `backend/models/`
   - Mongoose auto-creates/updates collections
   - May need to restart backend

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Test locally

# Commit changes
git add .
git commit -m "Add my feature"

# Push to GitHub
git push origin feature/my-feature

# Create pull request on GitHub
```

---

## 📚 Useful Resources

- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Mongoose Docs**: https://mongoosejs.com/

---

## ✅ Setup Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] GitHub account and repo cloned
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and user added
- [ ] Backend `.env` configured with MONGO_URI
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Can access frontend at http://localhost:5173
- [ ] Can register/login
- [ ] Can browse products
- [ ] No console errors or warnings

---

## 🎯 Next Steps

1. **Explore the Code**:
   - Read through `backend/server.js` to understand structure
   - Check `frontend/src/App.jsx` for page routing
   - Review `backend/middleware/auth.js` for JWT logic

2. **Make Your First Change**:
   - Edit `backend/routes/productRoutes.js`
   - Add a new endpoint
   - Test with curl or Postman

3. **Deploy to Production**:
   - Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - Deploy backend to Render or Railway
   - Deploy frontend to Vercel or Netlify

---

## 💬 Need Help?

1. **Check logs**: Look at terminal output for error messages
2. **Debug**: Use browser DevTools (F12) and Network tab
3. **Ask**: File an issue on GitHub or check existing issues
4. **Docs**: See links in "Useful Resources" section

Happy coding! 🚀
