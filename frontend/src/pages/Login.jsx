import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { setUser, setToken, clearError } from '../store/slices/authSlice'

import { authService } from '../services/api'
import { initializeSocket } from '../services/socketService'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiChevronRight, FiAlertCircle } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

import { useGoogleLogin } from '@react-oauth/google'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onChange' })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await authService.login(data)

      localStorage.setItem("token", response.data.token)

      dispatch(setToken(response.data.token))
      dispatch(setUser(response.data.user))
      dispatch(clearError())

      initializeSocket(response.data.token)

      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      const msg = error?.response?.data?.message
      toast.error(msg || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await authService.googleLogin(tokenResponse.access_token);

        localStorage.setItem("token", response.data.token)

        dispatch(setToken(response.data.token))
        dispatch(setUser(response.data.user))
        dispatch(clearError())

        initializeSocket(response.data.token)

        toast.success('Welcome back!')
        navigate('/dashboard')
      } catch (error) {
        console.error(error);
        const msg = error?.response?.data?.message
        toast.error(msg || 'Google Login failed')
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google Login Failed');
    },
  });

  return (
    <div className="min-h-screen bg-gradient-animate flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl glass-premium rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col md:flex-row min-h-[600px]">

        {/* LEFT COLUMN: Branding & Welcome */}
        <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-600/30 to-purple-600/30 md:border-r border-white/10 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

          <div className="relative z-10">
            <div className="group relative inline-flex items-center justify-center w-32 h-32 mb-8 transition-transform duration-500 hover:scale-105">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full blur-xl opacity-100 animate-pulse-slow"></div>
              <div className="relative z-10 w-full h-full bg-white rounded-full p-6 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-white/10">
                <img
                  src="/src/assets/logo.png"
                  alt="Healthcare Portal Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              Welcome Back
            </h1>
            <p className="text-blue-100/90 text-lg font-medium max-w-xs mx-auto leading-relaxed drop-shadow-md animate-fade-in-slow">
              Access your professional healthcare dashboard with secure, seamless login.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-900/40 backdrop-blur-md flex flex-col justify-center">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-slate-400 text-sm">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="group">
              <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2 group-focus-within:text-blue-400 transition-colors">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5 font-medium animate-slide-in-left"><FiAlertCircle className="w-3.5 h-3.5" />{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="group">
              <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2 group-focus-within:text-blue-400 transition-colors">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="glass-input w-full pl-12 pr-12 py-3.5 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5 font-medium animate-slide-in-left"><FiAlertCircle className="w-3.5 h-3.5" />{errors.password.message}</p>}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-blue-300 hover:text-white font-semibold transition-colors hover:underline decoration-blue-400 decoration-2 underline-offset-4">
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="opacity-90">Signing in...</span>
                </>
              ) : (
                <>
                  Sign In
                  <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-blue-200/50 font-medium uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <FcGoogle className="w-6 h-6" />
            Continue with Google
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-blue-200/60 text-sm">
              New here?{' '}
              <Link to="/register" className="text-white hover:text-blue-300 font-bold transition-colors hover:underline decoration-blue-400 decoration-2 underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
