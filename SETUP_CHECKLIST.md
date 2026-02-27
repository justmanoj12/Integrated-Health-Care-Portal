# ✅ Setup Checklist - Integrated Health Care Portal

## 📋 Pre-Setup Checklist

- [ ] Node.js installed (v16 or higher)
- [ ] MongoDB installed and service running
- [ ] PostgreSQL installed and service running
- [ ] VS Code or your preferred editor ready

---

## ✅ STEP 1 — Open Project Folder in VS Code

Open the main folder containing:
- `backend/` folder
- `frontend/` folder
- `README.md` file

**Status:** ✅ Project structure is ready

---

## ✅ STEP 2 — Install Dependencies

### ⭐ Terminal 1 (Backend)
```bash
cd backend
npm install
```

**This installs:**
- Express, Mongoose, Socket.IO
- PostgreSQL (pg), JWT, Bcrypt
- Express Validator, Multer, etc.

### ⭐ Terminal 2 (Frontend)
```bash
cd frontend
npm install
```

**This installs:**
- React, React Router, Redux Toolkit
- Axios, Socket.IO Client
- TailwindCSS, Chart.js, React Hook Form
- Vite and plugins

**Status:** ⚠️ **YOU NEED TO RUN THIS** - Dependencies are not installed yet

---

## ✅ STEP 3 — Start Databases

### MongoDB
- ✅ MongoDB should run on default port **27017**
- Start MongoDB service on your system
- No database creation needed (Mongoose creates it automatically)

### PostgreSQL
- ✅ Start PostgreSQL service
- Create database:
  ```sql
  CREATE DATABASE healthcare_portal;
  ```

**Status:** ⚠️ **YOU NEED TO DO THIS** - Databases must be running

---

## ✅ STEP 4 — Setup Environment Variables (.env)

### Backend `.env` file

**Location:** `backend/.env`

**Copy from:** `backend/.env.example` (create this file)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/healthcare_portal

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` file

**Location:** `frontend/.env`

**Copy from:** `frontend/.env.example` (create this file)

```env
# Note: Vite uses VITE_ prefix (not REACT_APP_)
VITE_API_URL=http://localhost:5000
```

**Status:** ⚠️ **YOU NEED TO CREATE THESE FILES** - Copy `.env.example` to `.env` and update values

---

## ✅ STEP 5 — Initialize Database

Run the database initialization script:

```bash
cd backend
node src/utils/initDatabase.js
```

**This will:**
- Create PostgreSQL tables (users, analytics)
- Create indexes
- Create default admin user:
  - Email: `admin@healthcare.com`
  - Password: `admin123`

**Status:** ⚠️ **YOU NEED TO RUN THIS** - Database tables need to be created

---

## ✅ STEP 6 — Run the Application

### ⭐ Terminal 1 — Start Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
✅ PostgreSQL connected successfully
🚀 Server running on port 5000
📡 Socket.IO server ready
```

### ⭐ Terminal 2 — Start Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**Status:** ⚠️ **YOU NEED TO RUN THESE COMMANDS** - Application needs to be started

---

## 🎯 STEP 7 — Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

### Test Login Credentials

**Admin:**
- Email: `admin@healthcare.com`
- Password: `admin123`

**Or register new users:**
- Register as Patient
- Register as Doctor

---

## ⚠️ Important Notes

### Environment Variable Names

The project uses these variable names:
- ✅ `MONGODB_URI` (not `MONGO_URI`)
- ✅ `POSTGRES_HOST`, `POSTGRES_PORT`, etc. (not `POSTGRES_URL`)
- ✅ `VITE_API_URL` (not `REACT_APP_BACKEND_URL`) - because we use Vite

### If You See Errors

1. **MongoDB Connection Error:**
   - Ensure MongoDB service is running
   - Check `MONGODB_URI` in `.env`

2. **PostgreSQL Connection Error:**
   - Ensure PostgreSQL service is running
   - Verify database exists: `CREATE DATABASE healthcare_portal;`
   - Check credentials in `.env`

3. **Port Already in Use:**
   - Change `PORT` in backend `.env`
   - Update `VITE_API_URL` in frontend `.env` accordingly

4. **Module Not Found:**
   - Run `npm install` in both backend and frontend folders

---

## ✅ Summary - What You Need to Do

1. ✅ **Install dependencies** - Run `npm install` in both folders
2. ✅ **Start databases** - MongoDB and PostgreSQL services
3. ✅ **Create `.env` files** - Copy from `.env.example` and update values
4. ✅ **Initialize database** - Run `node src/utils/initDatabase.js`
5. ✅ **Start backend** - `npm run dev` in backend folder
6. ✅ **Start frontend** - `npm run dev` in frontend folder
7. ✅ **Test the application** - Open http://localhost:3000

**Everything else is already done!** 🎉

---

## 🆘 Need Help?

Check these files:
- `SETUP.md` - Detailed setup guide
- `QUICK_START.md` - Quick reference
- `PROJECT_FEATURES.md` - Feature breakdown

