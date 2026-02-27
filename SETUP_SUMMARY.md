# 📋 Setup Summary - Copy This to New Laptop

## Quick Checklist

### ✅ Step 1: Prerequisites
- [ ] Node.js installed (v16+)
- [ ] Project files copied to new laptop

### ✅ Step 2: Database Setup
- [ ] MongoDB Atlas account created OR MongoDB installed locally
- [ ] MongoDB connection string ready

### ✅ Step 3: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### ✅ Step 4: Environment Configuration

**Create `backend/.env`:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=any_random_string_12345
FRONTEND_URL=http://localhost:5173
```

**Create `frontend/.env` (optional):**
```env
VITE_API_URL=http://localhost:5000/api
```

### ✅ Step 5: Initialize Database (Optional)
```bash
cd backend
npm run init-db
```
This creates a default admin user:
- Email: `admin@healthcare.com`
- Password: `admin123`

### ✅ Step 6: Start Application

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

### ✅ Step 7: Access Application
Open browser: **http://localhost:5173**

---

## 🎯 MongoDB Connection Strings

### MongoDB Atlas (Cloud):
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/healthcare_portal?retryWrites=true&w=majority
```

### Local MongoDB:
```
mongodb://localhost:27017/healthcare_portal
```

---

## 📝 Important Notes

1. **MongoDB is Required** - App won't work without it
2. **PostgreSQL is Optional** - App works fine without PostgreSQL
3. **Default Admin** - Run `npm run init-db` to create admin account
4. **Ports** - Backend: 5000, Frontend: 5173

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection error | Check connection string in `.env` |
| Port 5000 in use | Change PORT in backend `.env` |
| Module not found | Delete `node_modules`, run `npm install` |
| Frontend can't connect | Check `VITE_API_URL` in frontend `.env` |

---

## 📚 More Help

- **Quick Setup**: See `QUICK_SETUP_GUIDE.md`
- **Detailed Setup**: See `SETUP.md`
- **Start Here**: See `START_HERE.md`

---

## ✨ You're Ready!

Once both servers are running, you can:
- Register users
- Login as admin
- Send notifications
- Book appointments
- View analytics

**Happy Coding! 🚀**

