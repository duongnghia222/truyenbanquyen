import { Metadata } from 'next';
import SignUp from '@/components/features/auth/SignUp';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';

export const metadata: Metadata = {
  title: 'Đăng Ký - TruyenBanQuyen',
  description: 'Tạo tài khoản mới để trải nghiệm đầy đủ các tính năng của TruyenBanQuyen',
};

export default async function SignUpPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  // If already authenticated, redirect to home page
  if (session) {
    redirect('/');
  }
  
  return <SignUp />;
}