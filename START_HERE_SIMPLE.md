# 🚀 START HERE - Simple Setup (MongoDB Only)

## ✅ What You Need

- ✅ Node.js installed
- ✅ MongoDB installed and running
- ✅ VS Code (or any editor)

**No PostgreSQL needed!** 🎉

---

## 📋 Step-by-Step Setup

### STEP 1: Install Dependencies

**Open 2 terminals in VS Code:**

**Terminal 1:**
```bash
cd backend
npm install
```

**Terminal 2:**
```bash
cd frontend
npm install
```

---

### STEP 2: Start MongoDB

- Start MongoDB service (port 27017)
- That's it! No other database needed.

---

### STEP 3: Create .env Files

**Create `backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_portal
JWT_SECRET=my_secret_key_12345
FRONTEND_URL=http://localhost:3000
```

**Create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000
```

---

### STEP 4: Initialize Database

In Terminal 1 (backend):
```bash
cd backend
node src/utils/initDatabase.js
```

You should see:
- ✅ Connected to MongoDB
- ✅ Admin user created

---

### STEP 5: Start Backend

In Terminal 1:
```bash
cd backend
npm run dev
```

You should see:
- ✅ MongoDB connected successfully
- 🚀 Server running on port 5000

---

### STEP 6: Start Frontend

In Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
- VITE ready
- Local: http://localhost:3000

---

### STEP 7: Open Browser

Go to: **http://localhost:3000**

**Login:**
- Email: `admin@healthcare.com`
- Password: `admin123`

---

## ✅ Done!

Everything works with **MongoDB only** - much simpler! 🎉

---

## 🆘 Troubleshooting

**MongoDB not connecting?**
- Make sure MongoDB service is running
- Check `MONGODB_URI` in `backend/.env`

**Port already in use?**
- Change `PORT=5000` to `PORT=5001` in `backend/.env`
- Update `VITE_API_URL` in `frontend/.env` to match

**Module not found?**
- Run `npm install` again in that folder

---

## 📝 Summary

1. ✅ Install dependencies (both folders)
2. ✅ Start MongoDB
3. ✅ Create `.env` files
4. ✅ Initialize database
5. ✅ Start backend (`npm run dev`)
6. ✅ Start frontend (`npm run dev`)
7. ✅ Open http://localhost:3000

**That's it! Much simpler now!** 🚀

