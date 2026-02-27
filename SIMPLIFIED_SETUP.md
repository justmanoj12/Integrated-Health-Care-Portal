# ✅ SIMPLIFIED SETUP - MongoDB Only

## 🎯 What Changed?

**Removed PostgreSQL** - Now using **MongoDB only** (as per your syllabus)

Everything now uses MongoDB:
- ✅ User authentication
- ✅ User profiles
- ✅ Appointments
- ✅ Prescriptions
- ✅ Medical records
- ✅ Admin analytics

---

## 🚀 Quick Setup Steps

### STEP 1: Install Dependencies

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

### STEP 2: Start MongoDB Only

- Start MongoDB service (port 27017)
- **No PostgreSQL needed!** ✅

### STEP 3: Create .env Files

**Backend `.env`** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_portal
JWT_SECRET=my_secret_key_12345
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### STEP 4: Initialize Database

```bash
cd backend
node src/utils/initDatabase.js
```

This creates the admin user in MongoDB.

### STEP 5: Run Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### STEP 6: Open Browser

Go to: **http://localhost:3000**

**Login:**
- Email: `admin@healthcare.com`
- Password: `admin123`

---

## ✅ That's It!

Much simpler now - **only MongoDB needed!**

All features still work:
- ✅ Authentication
- ✅ Appointments
- ✅ Prescriptions
- ✅ Real-time notifications
- ✅ Admin dashboard
- ✅ Everything!

---

## 📝 What Was Removed?

- ❌ PostgreSQL dependency
- ❌ PostgreSQL connection code
- ❌ PostgreSQL queries
- ❌ Database initialization for PostgreSQL

## ✅ What's Still There?

- ✅ All MongoDB models
- ✅ All features working
- ✅ Real-time Socket.IO
- ✅ Redux state management
- ✅ All React components
- ✅ Everything else!

**The project is now simpler and matches your syllabus perfectly!** 🎉

