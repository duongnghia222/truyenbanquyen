import { redirect } from 'next/navigation';

// Redirect old signin route to new auth/signin route
export default function SignInPage() {
  redirect('/auth/signin');
} 