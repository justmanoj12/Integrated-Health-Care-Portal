# 🚀 Quick Setup Guide - Run on New Laptop

This guide will help you set up the Integrated Health Care Portal on a new laptop.

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Git** (to clone/copy the project)

## 🗄️ Database Setup Options

You have **2 options** for databases:

### Option 1: Cloud Databases (Recommended - Easiest) ⭐

**MongoDB Atlas (Free Cloud MongoDB)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Create a new cluster (Free tier M0)
4. Create a database user (username/password)
5. Whitelist your IP (or use `0.0.0.0/0` for all IPs - development only)
6. Get your connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/healthcare_portal?retryWrites=true&w=majority`)

**PostgreSQL Cloud (Optional - App works without it)**
- Use [Supabase](https://supabase.com) (free tier) or
- Use [ElephantSQL](https://www.elephantsql.com) (free tier) or
- Skip PostgreSQL - the app works fine without it (SQL analytics will be disabled)

### Option 2: Local Installation

**MongoDB Local Installation**
1. Download MongoDB Community Server: [Download](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017/healthcare_portal`

**PostgreSQL Local Installation (Optional)**
1. Download PostgreSQL: [Download](https://www.postgresql.org/download/)
2. Install and create database:
   ```sql
   CREATE DATABASE healthcare_portal;
   ```
3. Note your username and password

---

## 🛠️ Step-by-Step Setup

### Step 1: Copy Project Files

Copy the entire `Integrated Health Care` folder to your new laptop.

### Step 2: Install Backend Dependencies

Open terminal/command prompt in the project folder:

```bash
cd "Integrated Health Care/backend"
npm install
```

### Step 3: Install Frontend Dependencies

Open a new terminal:

```bash
cd "Integrated Health Care/frontend"
npm install
```

### Step 4: Configure Backend Environment

Create a file named `.env` in the `backend` folder:

**For Cloud MongoDB (Recommended):**
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/healthcare_portal?retryWrites=true&w=majority

# PostgreSQL (Optional - leave empty if not using)
POSTGRES_HOST=
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_portal
POSTGRES_USER=
POSTGRES_PASSWORD=
# OR use connection string:
# POSTGRES_URL=postgresql://user:password@host:port/database

# JWT Secret (change this to any random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**For Local MongoDB:**
```env
PORT=5000
NODE_ENV=development

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/healthcare_portal

# PostgreSQL (Optional)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
```

### Step 5: Configure Frontend Environment (Optional)

Create a file named `.env` in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

If you skip this, it will default to `http://localhost:5000/api`

### Step 6: Start MongoDB (If using local)

**Windows:**
- MongoDB should start automatically as a service
- Or run: `mongod` in terminal

**Mac/Linux:**
```bash
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

### Step 7: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd "Integrated Health Care/backend"
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📡 Socket.IO server ready
```

**Terminal 2 - Start Frontend:**
```bash
cd "Integrated Health Care/frontend"
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 8: Access the Application

Open your browser and go to: **http://localhost:5173**

---

## 👤 Default Admin Account

After first run, you can create an admin account by:

1. Register a new user with role "admin" OR
2. Use the registration page to create an admin account

**Note:** There's no default admin account. You need to register one first.

---

## ✅ Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can register a new user
- [ ] Can login
- [ ] Can see dashboard

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- **Cloud:** Check your MongoDB Atlas connection string
- **Local:** Make sure MongoDB service is running
- **Windows:** Check Services app → MongoDB should be running

### "Port 5000 already in use"
- Change `PORT=5001` in backend `.env`
- Update `VITE_API_URL=http://localhost:5001` in frontend `.env`

### "Cannot find module" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

### PostgreSQL warnings
- **This is normal!** The app works without PostgreSQL
- PostgreSQL is only for SQL analytics (optional feature)
- You can ignore PostgreSQL connection warnings

---

## 📝 Important Notes

1. **MongoDB is Required** - The app won't work without MongoDB
2. **PostgreSQL is Optional** - App works fine without it
3. **JWT_SECRET** - Change this to a random string in production
4. **Ports** - Backend: 5000, Frontend: 5173 (Vite default)

---

## 🎉 You're All Set!

Once both servers are running, you can:
- Register new users (Patient, Doctor, Admin)
- Book appointments
- Send notifications (as admin)
- View analytics
- And much more!

---

## 💡 Pro Tips

1. **Use MongoDB Atlas** - It's free and easier than local installation
2. **Skip PostgreSQL** - Unless you specifically need SQL analytics
3. **Keep terminals open** - Both backend and frontend need to run
4. **Check console logs** - They show helpful error messages

---

## 📞 Need Help?

Check the main `SETUP.md` file for more detailed information.

