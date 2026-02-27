# Setup Guide - Integrated Health Care Portal

## Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
3. **PostgreSQL** - [Download](https://www.postgresql.org/download/)
4. **npm** or **yarn** package manager

## Installation Steps

### 1. Database Setup

#### MongoDB Setup
1. Install MongoDB and start the MongoDB service
2. MongoDB will run on `mongodb://localhost:27017` by default
3. No additional configuration needed for development

#### PostgreSQL Setup
1. Install PostgreSQL and start the PostgreSQL service
2. Create a new database:
   ```sql
   CREATE DATABASE healthcare_portal;
   ```
3. Note your PostgreSQL credentials (username, password, port - default is 5432)

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development

   MONGODB_URI=mongodb://localhost:27017/healthcare_portal

   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=healthcare_portal
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_postgres_password

   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d

   FRONTEND_URL=http://localhost:3000
   ```

4. Initialize the database (run once):
   ```bash
   node src/utils/initDatabase.js
   ```
   Or the tables will be created automatically on first run.

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend` directory (optional):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## Default Admin Credentials

After running the database initialization, you can login with:

- **Email**: `admin@healthcare.com`
- **Password**: `admin123`

**⚠️ Important**: Change these credentials in production!

## Testing the Application

1. **Register a Patient**:
   - Go to `/register`
   - Fill in the form with role "Patient"
   - Register and login

2. **Register a Doctor**:
   - Go to `/register`
   - Fill in the form with role "Doctor"
   - Add specialization
   - Register and login

3. **Test Features**:
   - Patient can browse doctors and book appointments
   - Doctor can view and manage appointments
   - Admin can view analytics dashboard
   - Real-time notifications work via Socket.IO

## Project Structure

```
Integrated Health Care Portal/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configurations
│   │   ├── controllers/     # Business logic (if needed)
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   └── App.jsx          # Main App
│   └── package.json
└── README.md
```

## Features Implemented

### ✅ INT252 Requirements (React.js)
- [x] Advanced JavaScript (ES6+, async/await, destructuring)
- [x] JSX components with props
- [x] State management with hooks (useState, useEffect, useContext, useReducer)
- [x] Forms with validation and error handling
- [x] HTTP methods (GET, POST, PUT, DELETE) with Axios
- [x] Routing with React Router
- [x] Redux for state management
- [x] TailwindCSS for styling

### ✅ INT222 Requirements (Node.js)
- [x] Node.js modules and async I/O operations
- [x] HTTP services and routing with Express
- [x] Socket.IO for real-time communication
- [x] Middleware (authentication, validation, error handling)
- [x] MongoDB CRUD operations with Mongoose
- [x] PostgreSQL SQL operations
- [x] Testing setup ready

## Unique Features

1. **Real-time Notifications**: Socket.IO integration for live updates
2. **Multi-Database Architecture**: MongoDB + PostgreSQL
3. **Role-based Access Control**: Patient, Doctor, Admin roles
4. **Advanced State Management**: Redux + Context API
5. **Comprehensive Form Validation**: React Hook Form with custom validation
6. **Analytics Dashboard**: Charts and statistics for admin
7. **Modern UI/UX**: TailwindCSS with responsive design
8. **Protected Routes**: Route guards based on authentication and roles

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check `MONGODB_URI` in `.env` file

### PostgreSQL Connection Error
- Ensure PostgreSQL service is running
- Verify database credentials in `.env`
- Check if database exists: `CREATE DATABASE healthcare_portal;`

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `VITE_API_URL` in frontend `.env` accordingly

### Socket.IO Connection Issues
- Ensure backend is running before frontend
- Check CORS settings in `server.js`
- Verify `FRONTEND_URL` in backend `.env`

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update `JWT_SECRET` to a strong random string
3. Update database connection strings
4. Build frontend: `npm run build` in frontend directory
5. Serve frontend build files with a web server (nginx, Apache, etc.)
6. Use PM2 or similar for Node.js process management
7. Enable HTTPS
8. Set up proper CORS origins

## Support

For issues or questions, refer to the main README.md file.

