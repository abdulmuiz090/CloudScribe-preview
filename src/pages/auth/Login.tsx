
import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 hidden lg:block bg-brand">
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6">Welcome Back!</h1>
            <p className="text-xl text-white/80">
              Sign in to access your account and continue your journey with CloudScribe.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold">CloudScribe</Link>
            <h1 className="text-3xl font-bold mt-6">Sign in to your account</h1>
            <p className="text-muted-foreground mt-2">
              Enter your email below to sign in to your account
            </p>
          </div>
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{' '}
            <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
