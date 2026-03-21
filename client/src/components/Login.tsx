import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, authState } = useAuth();
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
  });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form data:', { studentId: formData.studentId, password: formData.password, role: isAdminMode ? 'admin' : undefined });
    
    try {
      // Call login with appropriate role
      await login(formData.studentId, formData.password);
      
      // Navigation will be handled by useEffect based on authState.user.role
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  // Handle navigation after successful login based on user role
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const userRole = authState.user.role;
      console.log('Login successful, user role:', userRole);
      
      if (userRole === 'admin') {
        console.log('Navigating to admin dashboard...');
        navigate('/admin-dashboard');
      } else if (userRole === 'student') {
        console.log('Navigating to student dashboard...');
        navigate('/dashboard');
      } else {
        console.log('Unknown role, redirecting to dashboard...');
        navigate('/dashboard');
      }
    }
  }, [authState.isAuthenticated, authState.user, navigate]);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Campus Desk</h1>
          <p className="text-gray-600">
            {isAdminMode ? 'Admin Login' : 'Student Login'}
          </p>
        </div>
        
        {/* Admin/Student Mode Toggle */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isAdminMode 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isAdminMode ? '👨‍💼 Admin Mode' : '👤 Student Mode'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter your student ID"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={authState.loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authState.loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Sign up
            </button>
          </p>
          <p className="text-gray-600 mt-4">
            <button
              onClick={handleForgotPassword}
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              Forgot Password?
            </button>
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Demo Accounts:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <span className="font-medium">Student:</span> ST001 / PASS@123
              </div>
              <div>
                <span className="font-medium">Admin:</span> Only one Admin exists for the entire Campus Desk system
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
