import axios from 'axios'

// Prefer relative `/api` so Vite proxy (port 3000 → 5000) works in dev.
// Allow override via VITE_API_URL for production / custom setups.
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // If data is FormData, let browser set Content-Type (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login'

      // ✅ Only redirect if NOT already on login page
      if (!isLoginPage) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  registerOtp: (data) => api.post('/auth/register-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (accessToken) => api.post('/auth/google', { accessToken }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}

export const appointmentService = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
}

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getDoctorReviews: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
}

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getByAppointment: (appointmentId) =>
    api.get(`/prescriptions/appointment/${appointmentId}`),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getAll: () => api.get('/prescriptions'),
  getMyPrescriptions: () => api.get('/prescriptions/my-prescriptions'),
}

export const patientService = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getMedicalRecords: () => api.get('/patients/medical-records'),
  addMedicalRecord: (data) => api.post('/patients/medical-records', data),
}

export const doctorService = {
  getList: (params) => api.get('/doctors/list', { params }),
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  getAppointments: (params) => api.get('/doctors/appointments', { params }),
  getAvailability: (doctorId, params) => api.get(`/doctors/${doctorId}/availability`, { params }),
}

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, payload) => api.patch(`/admin/users/${id}/status`, payload),
  getSqlSnapshots: () => api.get('/admin/analytics/sql'),
  getDoctors: () => api.get('/admin/doctors'),
  getPatients: () => api.get('/admin/patients'),
  sendNotification: (data) => api.post('/admin/notifications/send', data),
}

export default api

