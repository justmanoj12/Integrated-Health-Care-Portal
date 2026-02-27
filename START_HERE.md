# 🚀 START HERE - Quick Setup for New Laptop

## ⚡ Fast Setup (5 minutes)

### 1. Install Node.js
Download and install from: https://nodejs.org/ (v16 or higher)

### 2. Get MongoDB (Choose ONE):

**Option A: MongoDB Atlas (Cloud - Easiest) ⭐ RECOMMENDED**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create cluster → Get connection string
4. Copy the connection string

**Option B: Install MongoDB Locally**
- Windows: https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: Follow MongoDB installation guide

### 3. Install Dependencies

Open terminal in project folder:

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 4. Create Environment Files

**Create `backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_portal
# OR for Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/healthcare_portal
JWT_SECRET=your_secret_key_12345
FRONTEND_URL=http://localhost:5173
```

**Create `frontend/.env` (optional):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the App

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

### 6. Open Browser
Go to: **http://localhost:5173**

---

## ✅ That's It!

The app will work with just MongoDB. PostgreSQL is optional.

---

## 📖 Need More Details?

See `QUICK_SETUP_GUIDE.md` for detailed instructions.

---

## 🆘 Common Issues

**"MongoDB connection error"**
- Make sure MongoDB is running (local) or connection string is correct (Atlas)

**"Port already in use"**
- Change PORT in backend/.env to 5001

**"Cannot find module"**
- Delete node_modules and run `npm install` again
