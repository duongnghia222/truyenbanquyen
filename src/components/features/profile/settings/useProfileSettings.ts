import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export type ProfileFormData = {
  name: string
  email: string
  username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  emailNotifications: boolean
  chapterUpdates: boolean
  systemNotifications: boolean
}

export const useProfileSettings = () => {
  const { data: session, status, update } = useSession()
  
  // Form states
  const [activeTab, setActiveTab] = useState('account') // 'account', 'password', 'notifications', 'appearance'
  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: session?.user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    chapterUpdates: true,
    systemNotifications: true
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Fetch user profile data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          setIsLoading(true)
          setError('')
          
          const response = await fetch('/api/user/profile')
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.message || 'Không thể tải thông tin người dùng')
          }
          
          // Update form data with user profile information
          setFormData(prevData => ({
            ...prevData,
            name: data.user.name || '',
            username: data.user.username || '',
            email: data.user.email || ''
          }))
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải thông tin')
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchUserProfile()
    }
  }, [status, session?.user?.id])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      setError('')
      
      if (activeTab === 'account') {
        // Save account information (name, username)
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin')
        }
        
        // Update the session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            username: data.user.username
          }
        })
        
      } else if (activeTab === 'password') {
        // Password change logic would go here
        const response = await fetch('/api/user/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật mật khẩu')
        }
        
        // Reset password fields
        setFormData(prevData => ({
          ...prevData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
        
      } else if (activeTab === 'notifications') {
        // Notification settings logic would go here
        const response = await fetch('/api/user/notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailNotifications: formData.emailNotifications,
            chapterUpdates: formData.chapterUpdates,
            systemNotifications: formData.systemNotifications,
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật cài đặt thông báo')
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    status,
    session,
    activeTab,
    setActiveTab,
    formData,
    isLoading,
    error,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit
  }
} 