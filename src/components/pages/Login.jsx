import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  useEffect(() => {
    const { ApperUI } = window.ApperSDK;
    ApperUI.showLogin("#authentication");
  }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-r from-primary to-blue-600 text-white text-2xl font-bold">
            G
          </div>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="text-center text-lg font-bold">
              Sign in to Grandview Suite
            </div>
            <div className="text-center text-sm text-gray-500">
              Welcome back, please sign in to continue
            </div>
          </div>
        </div>
        <div id="authentication" />
        <div className="text-center mt-4">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;