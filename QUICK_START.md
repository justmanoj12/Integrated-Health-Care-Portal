# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Setup Databases

1. **Start MongoDB** (default port 27017)
2. **Start PostgreSQL** and create database:
   ```sql
   CREATE DATABASE healthcare_portal;
   ```

### Step 3: Configure Environment

**Backend `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_portal
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Admin Login

- Email: `admin@healthcare.com`
- Password: `admin123`

## 🎯 Test the Features

1. **Register as Patient** → Book appointment
2. **Register as Doctor** → View appointments
3. **Login as Admin** → View analytics dashboard
4. **Test Real-time** → Book appointment and see notification

## 📚 Full Documentation

See `SETUP.md` for detailed setup instructions and `PROJECT_FEATURES.md` for feature breakdown.

