# 🚀 FOLLOW THESE STEPS - Complete Setup Guide

## ✅ STEP 1: Open Project in VS Code

1. Open VS Code
2. Click **File → Open Folder**
3. Select: `Integrated Health Care Portal`
4. You should see `backend/` and `frontend/` folders

---

## ✅ STEP 2: Install Backend Dependencies

1. Open **Terminal** in VS Code (View → Terminal or `Ctrl + ~`)
2. Type these commands:

```bash
cd backend
npm install
```

3. Wait for installation (you'll see "added X packages")
4. **Keep this terminal open** - you'll need it later

---

## ✅ STEP 3: Install Frontend Dependencies

1. Open a **NEW Terminal** in VS Code (click the `+` button)
2. Type these commands:

```bash
cd frontend
npm install
```

3. Wait for installation to complete
4. **Keep this terminal open** - you'll need it later

---

## ✅ STEP 4: Start MongoDB

**Windows:**
- Open Services (Win + R → type `services.msc`)
- Find "MongoDB" service
- Right-click → **Start**

**Mac/Linux:**
- Open Terminal
- Run: `mongod` (or start MongoDB service)

**Verify:** MongoDB should be running on port **27017**

---

## ✅ STEP 5: Create Backend .env File

1. In VS Code, go to `backend/` folder
2. **Create a new file** named `.env` (just `.env`, no extension)
3. **Copy and paste** this:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_portal
JWT_SECRET=my_super_secret_jwt_key_12345
FRONTEND_URL=http://localhost:3000
```

4. **Save** the file (Ctrl + S)

---

## ✅ STEP 6: Create Frontend .env File

1. In VS Code, go to `frontend/` folder
2. **Create a new file** named `.env` (just `.env`, no extension)
3. **Copy and paste** this:

```env
VITE_API_URL=http://localhost:5000
```

4. **Save** the file (Ctrl + S)

---

## ✅ STEP 7: Initialize Database

1. Go to **Terminal 1** (where you ran `npm install` in backend)
2. Make sure you're in `backend` folder (if not, type `cd backend`)
3. Run this command:

```bash
node src/utils/initDatabase.js
```

4. You should see:
   - ✅ Connected to MongoDB
   - ✅ Admin user created (email: admin@healthcare.com, password: admin123)

---

## ✅ STEP 8: Start Backend Server

1. In **Terminal 1** (backend terminal)
2. Make sure you're in `backend` folder
3. Run:

```bash
npm run dev
```

4. You should see:
   - ✅ MongoDB connected successfully
   - 🚀 Server running on port 5000
   - 📡 Socket.IO server ready

5. **Leave this terminal running** - don't close it!

---

## ✅ STEP 9: Start Frontend Server

1. Go to **Terminal 2** (where you ran `npm install` in frontend)
2. Make sure you're in `frontend` folder (if not, type `cd frontend`)
3. Run:

```bash
npm run dev
```

4. You should see:
   - VITE v5.0.8 ready
   - ➜ Local: http://localhost:3000/

5. **Leave this terminal running** - don't close it!

---

## ✅ STEP 10: Open the Application

1. Open your **web browser** (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:3000**
3. You should see the **Login page**

---

## ✅ STEP 11: Test Login

**Login as Admin:**
- Email: `admin@healthcare.com`
- Password: `admin123`

**OR Register New User:**
1. Click **"Register here"** link
2. Fill the form:
   - First Name, Last Name
   - Email, Phone
   - **Role:** Patient or Doctor
   - Password (min 6 characters)
3. Click **Register**

---

## ✅ Success Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] MongoDB service running
- [ ] Backend `.env` file created
- [ ] Frontend `.env` file created
- [ ] Database initialized
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] Website opens in browser
- [ ] Can login or register

**All checked? You're done! 🎉**

---

## 🆘 Troubleshooting

### ❌ "Cannot find module" error
**Solution:** Run `npm install` again in that folder

### ❌ "MongoDB connection error"
**Solution:** 
- Make sure MongoDB service is running
- Check `MONGODB_URI` in `backend/.env` is correct

### ❌ "Port 5000 already in use"
**Solution:** 
- Change `PORT=5000` to `PORT=5001` in `backend/.env`
- Update `VITE_API_URL=http://localhost:5001` in `frontend/.env`

### ❌ Frontend can't connect to backend
**Solution:**
- Make sure backend is running (Step 8)
- Check `VITE_API_URL` in `frontend/.env` matches backend port

### ❌ "Admin user already exists" when initializing
**Solution:** That's fine! It means admin user is already created. You can skip initialization.

---

## 📝 Quick Reference

**Backend Terminal:**
```bash
cd backend
npm run dev
```

**Frontend Terminal:**
```bash
cd frontend
npm run dev
```

**Database Init (run once):**
```bash
cd backend
node src/utils/initDatabase.js
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

---

## ✅ That's It!

Follow these steps in order, and you'll have your project running! 🚀

