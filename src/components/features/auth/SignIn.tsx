'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'

// Export as a named component for the new page structure
export function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const res = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
        callbackUrl
      })

      if (res?.error) {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/auth-bg-pattern.svg')] opacity-5 pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center">
          <Link 
            href="/" 
            className="group relative mb-4"
          >
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
              transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600"
            >
              TruyenLight
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600
              transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Hoặc{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              đăng ký tài khoản mới
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
            <span>Đăng nhập với Google</span>
          </button>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <div className="px-3 text-xs text-gray-500 dark:text-gray-400">hoặc</div>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link 
              href="/auth/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 
                dark:hover:text-blue-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Also export as default for backward compatibility
export default SignIn; 