import { redirect } from 'next/navigation';

export default function SignupPage() {
  // Signup is no longer available. Redirect to login.
  redirect('/auth/login');
  return null;
}
