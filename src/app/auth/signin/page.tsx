import { SignIn } from '@/components/features/auth/SignIn';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - TruyenLight',
  description: 'Sign in to your account',
};

export default function SignInPage() {
  return <SignIn />;
} 