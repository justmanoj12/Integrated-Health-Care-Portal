# Environment Variables Setup Guide

## ⚠️ Important: Variable Name Differences

Your instructions mention some variable names that differ from the actual code. Here are the **correct** variable names to use:

### Backend `.env` File

**Create:** `backend/.env`

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# ⚠️ Note: Code uses MONGODB_URI (not MONGO_URI)
MONGODB_URI=mongodb://localhost:27017/healthcare_portal

# PostgreSQL Configuration
# ⚠️ Note: Code uses separate variables (not POSTGRES_URL)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=healthcare_portal
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` File

**Create:** `frontend/.env`

```env
# ⚠️ Note: Using Vite, so it's VITE_API_URL (not REACT_APP_BACKEND_URL)
VITE_API_URL=http://localhost:5000
```

## 📝 Quick Setup Steps

1. **Create `backend/.env`** with the variables above
2. **Create `frontend/.env`** with the variable above
3. **Update** `POSTGRES_PASSWORD` with your actual PostgreSQL password
4. **Update** `JWT_SECRET` with a random secret string

## ✅ That's it! The rest of your setup steps are correct.

