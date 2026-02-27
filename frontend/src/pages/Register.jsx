import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { setUser, setToken } from '../store/slices/authSlice'
import { authService } from '../services/api'
import { initializeSocket } from '../services/socketService'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiLock, FiHeart, FiEye, FiEyeOff, FiCheckCircle, FiClock, FiChevronRight, FiAlertCircle } from 'react-icons/fi'

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [pendingEmail, setPendingEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: 'onChange' })

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.registerOtp(data)
      setPendingEmail(data.email)
      setStep(2)
      toast.success('OTP sent to your email. Check your inbox!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (values) => {
    setLoading(true)
    try {
      const payload = { email: pendingEmail, otp: values.otp }
      const response = await authService.verifyOtp(payload)

      // Backend returns only message → no token, no user
      toast.success('Account verified! Please log in.')

      // Redirect to login instead of dashboard
      navigate('/login')

    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-animate flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl glass-premium rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col md:flex-row min-h-[700px]">

        {/* LEFT COLUMN: Branding */}
        <div className="relative w-full md:w-5/12 p-8 md:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-600/30 to-purple-600/30 md:border-r border-white/10 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>

          <div className="relative z-10">
            <div className="group relative inline-flex items-center justify-center w-28 h-28 mb-8 transition-transform duration-500 hover:scale-105">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full blur-xl opacity-100 animate-pulse-slow"></div>
              <div className="relative z-10 w-full h-full bg-white rounded-full p-6 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-white/10">
                <img
                  src="/src/assets/logo.png"
                  alt="Healthcare Portal Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              Join Our Community
            </h1>
            <p className="text-blue-100/90 text-lg font-medium max-w-xs mx-auto leading-relaxed drop-shadow-md animate-fade-in-slow">
              Create your account to access quality healthcare, book appointments, and manage your medical records securely.
            </p>

            <div className="mt-12 flex items-center justify-center gap-4 text-xs text-blue-200/80 font-bold tracking-wider uppercase">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg shadow-lg border border-white/10">🔒</div>
                <span>Secure</span>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg shadow-lg border border-white/10">⚡</div>
                <span>Fast</span>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-lg shadow-lg border border-white/10">🩺</div>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-slate-900/40 backdrop-blur-md flex flex-col justify-center">

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8 max-w-xs mx-auto w-full">
            <div className="flex items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-700 text-slate-400'}`}>1</div>
              <div className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-700 text-slate-400'}`}>2</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{step === 1 ? 'Create Account' : 'Verify Email'}</h2>
            <p className="text-slate-400 text-sm">{step === 1 ? 'Enter your details to get started' : `Check ${pendingEmail} for code`}</p>
          </div>

          <form onSubmit={handleSubmit(step === 1 ? onSubmit : handleVerify)} className="space-y-5">
            {step === 1 && (
              <div className="animate-slide-in-right space-y-5">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">First Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        className="glass-input w-full pl-12 pr-4 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.firstName.message}</p>}
                  </div>

                  <div className="group">
                    <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Last Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        className="glass-input w-full pl-12 pr-4 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.lastName.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                      className="glass-input w-full pl-12 pr-4 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                      placeholder="name@company.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      {...register('phone')}
                      className="glass-input w-full pl-12 pr-4 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="group">
                  <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Register as</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300
                        ${watch('role') === 'patient'
                        ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'}`}>
                      <input
                        type="radio"
                        value="patient"
                        {...register('role', { required: 'Please select how you want to register' })}
                        className="mt-1 accent-blue-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-100">Patient</p>
                        <p className="text-[10px] text-gray-400 mt-1">Book appointments & manage records.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-300
                        ${watch('role') === 'doctor'
                        ? 'border-purple-500 bg-purple-600/10 shadow-lg shadow-purple-500/20'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'}`}>
                      <input
                        type="radio"
                        value="doctor"
                        {...register('role', { required: 'Please select how you want to register' })}
                        className="mt-1 accent-purple-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-100">
                          Doctor
                        </p>
                        <p className="text-[10px] text-yellow-500/80 mt-1">Requires Admin Approval</p>
                      </div>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Specialization (conditional) */}
                {watch('role') === 'doctor' && (
                  <div className="animate-slide-up group">
                    <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Specialization</label>
                    <input
                      {...register('specialization')}
                      className="glass-input w-full px-4 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                      placeholder="e.g., Cardiology, Dermatology"
                    />
                  </div>
                )}

                {/* Password fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })}
                        className="glass-input w-full pl-12 pr-10 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.password.message}</p>}
                  </div>

                  <div className="group">
                    <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-2">Confirm</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', { required: 'Confirm password', validate: v => v === password || 'Passwords must match' })}
                        className="glass-input w-full pl-12 pr-10 py-3 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-blue-500"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Continue
                      <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slide-in-right space-y-6">
                {/* OTP input */}
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-4 animate-pulse-slow">
                      <FiMail className="w-10 h-10 text-blue-400" />
                    </div>
                  </div>

                  <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider block mb-4 text-center">Enter Verification Code</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50 w-6 h-6" />
                    <input
                      type="text"
                      {...register('otp', { required: 'Enter OTP', minLength: { value: 6, message: '6-digit code' }, maxLength: { value: 6, message: '6-digit code' } })}
                      maxLength="6"
                      className="glass-input w-full pl-14 pr-4 py-4 rounded-xl border-slate-700/50 bg-slate-800/50 focus:bg-slate-800 focus:border-green-500 text-center text-3xl tracking-[0.5em] font-mono shadow-inner"
                      placeholder="000000"
                    />
                  </div>
                  {errors.otp && <p className="text-xs text-red-400 mt-2 text-center flex items-center justify-center gap-1"><FiAlertCircle className="w-3 h-3" />{errors.otp.message}</p>}
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Code sent to <span className="text-blue-400">{pendingEmail}</span>. Expires in 10 minutes.
                  </p>
                </div>

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Complete
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Details
                </button>
              </div>
            )}
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-blue-200/60 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-blue-300 font-bold transition-colors hover:underline decoration-blue-400 decoration-2 underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
