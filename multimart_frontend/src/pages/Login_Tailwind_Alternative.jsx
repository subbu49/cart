import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login, selectUser, selectAuthLoading, selectAuthError, clearError } from '../features/auth/authSlice'

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  captcha: yup.string().required('Please verify the CAPTCHA'),
})

// Generate random CAPTCHA
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let captcha = ''
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return captcha
}

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  
  const [showPassword, setShowPassword] = useState(false)
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha())
  const [captchaInput, setCaptchaInput] = useState('')
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { captcha: '' }
  })

  const captchaValue = watch('captcha')

  useEffect(() => { dispatch(clearError()) }, [dispatch])
  
  useEffect(() => {
    if (user) navigate(user.role === 'seller' ? '/seller' : user.role === 'admin' ? '/admin' : '/')
  }, [user, navigate])

  const onSubmit = (data) => {
    // Verify CAPTCHA
    if (data.captcha.toUpperCase() !== captchaCode) {
      alert('Incorrect CAPTCHA. Please try again.')
      refreshCaptcha()
      return
    }
    dispatch(login({ username: data.username, password: data.password }))
  }

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha()
    setCaptchaCode(newCaptcha)
    setCaptchaInput('')
    setValue('captcha', '')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {/* Lock Icon SVG */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-white mb-1">Welcome Back</h1>
            <p className="text-center text-blue-100 text-sm">Sign in to your MultiMart account</p>
          </div>

          {/* Form Container */}
          <div className="px-8 py-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                {/* Alert Icon SVG */}
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-900">Authentication Failed</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    {typeof error === 'string' ? error : error.detail || 'Login failed. Please try again.'}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    {/* Mail Icon SVG */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    {...register('username')}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.username ? 'border-red-400 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    {/* Lock Icon SVG */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className={`w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                      errors.password ? 'border-red-400 focus:ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      // Eye Off Icon SVG
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17a2 2 0 002 2h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    ) : (
                      // Eye Icon SVG
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CAPTCHA Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Verify CAPTCHA
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {/* CAPTCHA Display */}
                  <div className="col-span-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-slate-300 rounded-lg p-4 flex items-center justify-center">
                    <div className="font-mono text-2xl font-bold text-slate-700 tracking-widest select-none" style={{letterSpacing: '0.5em'}}>
                      {captchaCode}
                    </div>
                  </div>
                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition duration-200 flex items-center justify-center"
                    aria-label="Refresh CAPTCHA"
                  >
                    {/* Refresh Icon SVG */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                {/* CAPTCHA Input */}
                <input
                  id="captcha"
                  type="text"
                  placeholder="Enter the code above"
                  {...register('captcha')}
                  maxLength="6"
                  className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 uppercase tracking-wider ${
                    errors.captcha ? 'border-red-400 focus:ring-red-500' : ''
                  } ${
                    captchaValue.toUpperCase() === captchaCode && captchaValue ? 'border-green-400 focus:ring-green-500' : ''
                  }`}
                />
                {errors.captcha && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.captcha.message}
                  </p>
                )}
                {captchaValue.toUpperCase() === captchaCode && captchaValue && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    {/* Check Icon SVG */}
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    CAPTCHA verified
                  </p>
                )}
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    {/* Spinner Icon SVG */}
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    {/* Lock Icon SVG */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z" />
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Register Link */}
            <p className="text-center text-slate-600 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition duration-200 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 text-center">
            <p className="text-xs text-slate-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
