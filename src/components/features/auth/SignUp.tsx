'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'

export default function SignUp() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      setError('Mật khẩu không khớp, vui lòng kiểm tra lại')
      setIsLoading(false)
      return
    }
    
    try {
      // Register user via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: credentials.name,
          username: credentials.username,
          email: credentials.email,
          password: credentials.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Đăng ký không thành công, vui lòng thử lại')
      } else {
        // Sign in the newly created user
        await signIn('credentials', {
          username: credentials.username,
          password: credentials.password,
          redirect: false,
        })
        
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/auth-bg-pattern.svg')] opacity-5 pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 relative mb-4">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="animate-float"
            />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Đăng ký tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Hoặc{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600
              text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700
              hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300
              transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <FcGoogle className="w-5 h-5" />
            <span>Đăng ký với Google</span>
          </button>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <div className="px-3 text-xs text-gray-500 dark:text-gray-400">hoặc</div>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ tên
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                    text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent transition-all duration-200 ease-in-out
                    hover:border-blue-300 dark:hover:border-blue-500"
                  placeholder="Nhập họ tên của bạn"
                  value={credentials.name}
                  onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                    text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent transition-all duration-200 ease-in-out
                    hover:border-blue-300 dark:hover:border-blue-500"
                  placeholder="Nhập tên đăng nhập của bạn"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                    text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent transition-all duration-200 ease-in-out
                    hover:border-blue-300 dark:hover:border-blue-500"
                  placeholder="Nhập email của bạn"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                    text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent transition-all duration-200 ease-in-out
                    hover:border-blue-300 dark:hover:border-blue-500"
                  placeholder="Nhập mật khẩu của bạn"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                    text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent transition-all duration-200 ease-in-out
                    hover:border-blue-300 dark:hover:border-blue-500"
                  placeholder="Nhập lại mật khẩu của bạn"
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex justify-center py-3 px-4 border border-transparent 
                  text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 