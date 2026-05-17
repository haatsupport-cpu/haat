# HaatOnline Deployment Checklist

## 1. Environment configuration

### Backend
- `MONGODB_URI` required for MongoDB Atlas / cluster connection.
- `JWT_SECRET` required for signing authentication tokens.
- `FRONTEND_URL` should match the deployed frontend origin.

Example `backend/.env`:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/haatonline?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-jwt-secret-min-32-chars
```

### Frontend
- `VITE_API_URL` should point to the backend API root.
- Keep Firebase variables if your app uses Firebase services.

Example `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## 2. Backend startup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```
3. Confirm health endpoint:
   ```bash
   curl http://localhost:5000/healthz
   ```

## 3. Frontend startup
1. Install frontend dependencies if not installed:
   ```bash
   cd frontend
   npm install
   ```
2. Start Vite:
   ```bash
   npm run dev
   ```

## 4. Deployment validation
- Confirm backend responds on `/api/products` and `/api/auth/login`.
- Confirm JWT auth works with the frontend login/register flow.
- Confirm MongoDB is used instead of any Supabase or PostgreSQL service.

## 5. Cleanup notes
- Legacy service-specific files and docs have been removed.
- `backend/package-lock.json` will be regenerated to remove stale lock entries.
