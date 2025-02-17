'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Đăng nhập vào tài khoản
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Tên đăng nhập
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                  border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 
                  text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-blue-500 
                  focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                  focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Tên đăng nhập"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                  border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 
                  text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-blue-500 
                  focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 
                  focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
                placeholder="Mật khẩu"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 