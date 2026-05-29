# HaatOnline Architecture & Technical Reference

## 📐 System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│                    (React 19 + Vite)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Browser - http://localhost:5173 (dev)                 │ │
│  │ Pages: Home, Products, Cart, Checkout, Admin, Login   │ │
│  │ Auth: JWT tokens in localStorage                      │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────┘
                            │
                    HTTP/HTTPS API calls
                   /api/auth, /api/products
                            │
┌───────────────────────────▼────────────────────────────────┐
│                   API LAYER                                │
│              (Node.js + Express 5)                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Server: localhost:5000 (dev) or https://... (prod)  │ │
│  │ Middleware Stack:                                    │ │
│  │   - CORS (environment-aware)                        │ │
│  │   - Helmet (security headers)                       │ │
│  │   - Rate Limiting (dev/prod mode)                   │ │
│  │   - JWT Auth (optional session attach)              │ │
│  │ Routes:                                              │ │
│  │   - /api/auth (login, register, me, logout)        │ │
│  │   - /api/products (list, get)                       │ │
│  │   - /api/categories (list)                          │ │
│  │   - /api/cart (add, remove, update)                │ │
│  │   - /api/orders (create, list)                      │ │
│  │   - /api/checkout (process payment)                │ │
│  │   - /api/admin (dashboard, manage items)           │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────┘
                            │
                   MongoDB Protocol
                   Connection Pool
                            │
┌───────────────────────────▼────────────────────────────────┐
│                  DATA LAYER                                │
│           (MongoDB Atlas or Local MongoDB)                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Collections:                                         │ │
│  │   - users (auth, profiles)                         │ │
│  │   - products (catalog)                             │ │
│  │   - categories                                      │ │
│  │   - carts (temporary shopping carts)               │ │
│  │   - orders (purchase history)                      │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   User      │
│  (Frontend) │
└──────┬──────┘
       │
       │ 1. POST /api/auth/register
       │    { name, email, password }
       ▼
┌─────────────────────────┐
│  Backend /auth/register │
│  - Validate input       │
│  - Hash password (bcrypt)
│  - Create user doc      │
│  - Generate JWT         │
└──────┬──────────────────┘
       │
       │ Response: { token, user }
       │
       ▼
┌──────────────────┐
│  Frontend        │
│  - Store token   │
│  - Set auth user │
│  - Redirect      │
└──────────────────┘
       │
       │ 2. GET /api/auth/me
       │    Headers: Authorization: Bearer <token>
       ▼
┌────────────────┐
│ Backend        │
│ - Verify JWT   │
│ - Fetch user   │
│ - Return user  │
└────────────────┘
```

### JWT Structure

```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (signed)
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1234567890,
  "exp": 1234654290
}

// Signature
HMAC_SHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

---

## 🌍 Environment-Based Configuration

### Development (NODE_ENV=development)

```javascript
{
  "rateLimiting": {
    "global": 10000,        // Very relaxed
    "auth": 10000,          // No blocking
    "checkout": 100
  },
  "cors": "localhost:*",    // All localhost ports
  "security": {
    "helmet": false,
    "https": false,
    "trust_proxy": false
  },
  "logging": "verbose",     // Debug output
  "errors": "full_stack"    // Client sees stack traces
}
```

### Production (NODE_ENV=production)

```javascript
{
  "rateLimiting": {
    "global": 100,          // Strict
    "auth": 20,             // Prevent brute force
    "checkout": 5           // Prevent accidental double-charge
  },
  "cors": "configured_domain_only",  // Frontend domain only
  "security": {
    "helmet": true,         // Full security headers
    "https": true,          // HTTPS required
    "trust_proxy": true     // Behind reverse proxy
  },
  "logging": "errors_only", // Minimal output
  "errors": "generic"       // Don't leak details
}
```

---

## 📁 Directory Structure & Responsibilities

### Backend

```
backend/
├── config/
│   ├── constants.js        # Environment-aware config
│   ├── cors.js             # CORS setup
│   ├── limiters.js         # Rate limiter instances
│   └── db.js               # MongoDB connection
│
├── middleware/
│   ├── auth.js             # JWT middleware (attachJwtSession, requireAuth)
│   ├── validateBody.js     # Request body validation
│   └── requestLogger.js    # Request/response logging
│
├── models/
│   ├── User.js             # User schema (auth, profile)
│   ├── Product.js          # Product schema
│   ├── Category.js         # Category schema
│   ├── Cart.js             # Shopping cart schema
│   └── Order.js            # Order history schema
│
├── controllers/
│   ├── authController.js   # register, login, me, logout
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── adminController.js
│   └── checkoutController.js
│
├── routes/
│   ├── authRoutes.js       # POST /api/auth/*
│   ├── productRoutes.js    # GET /api/products/*
│   ├── cartRoutes.js       # POST /api/cart/*
│   ├── orderRoutes.js      # POST /api/orders/*
│   ├── adminRoutes.js      # POST /api/admin/*
│   └── checkoutRoutes.js   # POST /api/checkout/*
│
├── utils/                  # Helper functions
├── server.js               # Express app setup & startup
├── env.js                  # Load .env file
├── .env                    # Environment variables (dev)
├── .env.example            # Example .env
└── .env.production.example # Example production .env
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── LoginToOrderModal.jsx
│   │   └── Footer.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.js        # Context definition
│   │   ├── AuthProvider.jsx      # Context provider
│   │   └── useAuth.js            # Hook to use auth
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   │
│   ├── utils/
│   │   ├── axiosClient.js        # Axios with interceptors
│   │   ├── auth.js               # Auth helper functions
│   │   └── checkoutCalculator.js
│   │
│   ├── App.jsx                   # Main component with routing
│   └── main.jsx                  # React DOM render
│
├── .env                    # Environment variables (dev)
├── .env.example            # Example .env
├── .env.production         # Production config
├── vite.config.js          # Vite build config
└── package.json            # Dependencies
```

---

## 🔄 Request/Response Flow Example

### User Registration Flow

```
1. User fills registration form
   ├─ name: "John Doe"
   ├─ email: "john@example.com"
   └─ password: "secret123"

2. POST /api/auth/register
   ├─ Headers: Content-Type: application/json
   └─ Body: { name, email, password }

3. Backend: authController.registerUser()
   ├─ Validate input (name, email, password)
   ├─ Check if user exists
   ├─ Hash password: bcrypt.hash(password, 10)
   ├─ Create user in MongoDB
   ├─ Generate JWT: jwt.sign({ id, email, role }, JWT_SECRET)
   └─ Response: { success: true, token, user }

4. Response (200 OK)
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "name": "John Doe",
       "email": "john@example.com",
       "role": "customer"
     }
   }

5. Frontend
   ├─ Save token to localStorage
   ├─ Update auth context
   └─ Redirect to dashboard

6. Subsequent requests
   ├─ Axios interceptor adds: Authorization: Bearer <token>
   ├─ Backend middleware (attachJwtSession) verifies token
   ├─ req.user populated
   └─ Protected routes accessible
```

---

## 📊 Data Models

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,              // "John Doe"
  email: String,             // "john@example.com" (unique)
  password: String,          // bcrypt hash
  phoneno: String,             // Optional
  role: String,              // "customer" | "vendor" | "admin"
  authProvider: String,      // "local" | "google" | "firebase"
  googleId: String,          // Optional (for Google OAuth)
  photo: String,             // Profile picture URL
  isActive: Boolean,         // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema

```javascript
{
  _id: ObjectId,
  name: String,              // "Organic Tomatoes"
  description: String,       // Product description
  price: Number,             // 4.99
  quantity: Number,          // Stock quantity
  category: ObjectId,        // Reference to Category
  image: String,             // Image URL
  ratings: Number,           // Average rating (0-5)
  reviews: [{                // Customer reviews
    userId: ObjectId,
    rating: Number,
    comment: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to User
  items: [{                   // Cart items
    productId: ObjectId,
    quantity: Number,
    price: Number              // Price at time of purchase
  }],
  totalAmount: Number,       // Total cost
  status: String,            // "pending" | "confirmed" | "shipped" | "delivered"
  shippingAddress: String,
  paymentMethod: String,     // "card" | "paypal" | "bank"
  createdAt: Date,
  deliveredAt: Date
}
```

---

## 🚀 Performance Optimization

### Frontend Optimizations

1. **Code Splitting**: Vite automatically splits vendor code
2. **Lazy Loading**: React Router lazy-loads pages
3. **Image Optimization**: Consider using next/image-like solutions
4. **Compression**: Gzip enabled in production
5. **Caching**: Browser caches static assets

### Backend Optimizations

1. **Database Indexing**: Indexes on frequently queried fields
2. **Connection Pooling**: MongoDB connection pool management
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Compression**: Gzip middleware enabled in production
5. **JWT Caching**: Decoded JWT cached in request object

### MongoDB Optimization

```javascript
// Recommended indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ name: "text" });
db.orders.createIndex({ userId: 1 });
db.carts.createIndex({ userId: 1 });
```

---

## 🔒 Security Best Practices Implemented

### Password Security
- ✅ bcryptjs with salt rounds (10)
- ✅ Never return password in responses
- ✅ Strong password requirements

### JWT Security
- ✅ Secure random secret (32+ chars)
- ✅ 7-day expiration
- ✅ Signature verification on every request
- ✅ Stored in localStorage (not cookies for SPA)

### API Security
- ✅ CORS whitelist (production only)
- ✅ Rate limiting (aggressive in prod)
- ✅ Helmet.js security headers
- ✅ Input validation on all endpoints

### HTTPS Security
- ✅ HTTPS-only cookies in production
- ✅ Trust proxy headers
- ✅ SameSite=Strict cookie policy

---

## 🧪 Testing Checklist

```bash
# Backend Tests
✅ Register new user
✅ Login with correct credentials
✅ Login fails with wrong password
✅ Get current user (requires JWT)
✅ Get products list
✅ Add to cart
✅ Create order
✅ Rate limiting blocks on excessive requests

# Frontend Tests
✅ Can navigate between pages
✅ Register page works
✅ Login redirects to dashboard
✅ Cart functionality
✅ Checkout process
✅ Admin dashboard (if admin)
✅ Logout clears token
✅ 401 redirects to login

# Integration Tests
✅ Full registration → login → dashboard flow
✅ Add product to cart → checkout
✅ Order history displays
✅ Admin can manage products
```

---

## 📈 Scaling Considerations

### Horizontal Scaling

```
Load Balancer (nginx)
├── Backend Instance 1 (port 5000)
├── Backend Instance 2 (port 5000)
└── Backend Instance 3 (port 5000)
        ↓
    MongoDB Atlas (shared)
```

### Caching Strategy

```
Frontend
├── HTTP Cache (static assets)
├── LocalStorage (JWT token)
└── Service Worker (optional)

Backend
├── MongoDB indexes
├── Connection pooling
└── In-memory cache (Redis - optional)
```

### Database Optimization

```
MongoDB Atlas
├── Sharding (for large collections)
├── Replication (3-node cluster)
├── Automated backups
└── Point-in-time recovery
```

---

## 🔗 API Endpoints Reference

### Authentication

```
POST   /api/auth/register     - Create new account
POST   /api/auth/login        - Login with email/password
GET    /api/auth/me           - Get current user (protected)
POST   /api/auth/logout       - Logout (optional, JWT not revoked)
POST   /api/auth/google       - Google OAuth login
```

### Products

```
GET    /api/products          - List all products
GET    /api/products/:id      - Get product details
POST   /api/products          - Create product (admin only)
PUT    /api/products/:id      - Update product (admin only)
DELETE /api/products/:id      - Delete product (admin only)
```

### Cart

```
GET    /api/cart              - Get user's cart
POST   /api/cart              - Add item to cart
PUT    /api/cart/:itemId      - Update cart item
DELETE /api/cart/:itemId      - Remove item from cart
```

### Orders

```
GET    /api/orders            - Get user's orders
POST   /api/orders            - Create new order
GET    /api/orders/:id        - Get order details
```

### Checkout

```
POST   /api/checkout/process  - Process payment & create order
GET    /api/checkout/status/:orderId - Check order status
```

### Admin

```
GET    /api/admin/dashboard   - Admin dashboard data
GET    /api/admin/users       - List users (admin only)
GET    /api/admin/orders      - List all orders (admin only)
POST   /api/admin/products    - Bulk upload products
```

---

## 🎯 Future Enhancements

1. **Email Notifications**: Send confirmation emails
2. **Payment Gateway**: Stripe/PayPal integration
3. **Search**: Full-text search on products
4. **Recommendations**: ML-based product suggestions
5. **Analytics**: Track user behavior and sales
6. **Social Features**: Wishlist, sharing, reviews
7. **Mobile App**: React Native version
8. **PWA**: Progressive Web App features
9. **API Documentation**: Swagger/OpenAPI docs
10. **GraphQL**: Alternative to REST API

---

## 📞 Support & Debugging

### Enable Debug Mode

**Frontend**:
```javascript
// In browser console
localStorage.setItem('DEBUG', 'haatonline:*');
location.reload();
```

**Backend**:
```bash
DEBUG=haatonline:* npm run dev
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| CORS error | Frontend URL not in whitelist | Add to `ALLOWED_ORIGINS` |
| 401 Unauthorized | Invalid/expired JWT | Re-login, check token |
| 429 Too Many Requests | Rate limit exceeded | Wait 15 minutes, check dev env |
| ECONNREFUSED | Can't reach MongoDB | Check Atlas cluster, IP whitelist |
| VALIDATION_ERROR | Missing required fields | Check request payload |

---

This document is a living reference. Update as architecture evolves.
