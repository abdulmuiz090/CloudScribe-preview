
import { SignupForm } from '@/components/auth/SignupForm';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 hidden lg:block bg-brand">
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6">Join CloudScribe</h1>
            <p className="text-xl text-white/80">
              Create an account to start publishing content, selling products, and connecting with the community.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold">CloudScribe</Link>
            <h1 className="text-3xl font-bold mt-6">Create your account</h1>
            <p className="text-muted-foreground mt-2">
              Enter your information below to create your account
            </p>
          </div>
          <SignupForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
