import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let res;
    if (isLogin) {
      res = await login(username, password);
    } else {
      res = await register(username, password, role);
    }
    
    if (res.success) {
      if (res.role === 'admin' || res.role === 'verifier') navigate('/admin');
      else if (res.role === 'worker') navigate('/worker');
      else navigate('/citizen');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full glass p-8 rounded-3xl animate-fade-in shadow-2xl relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
        
        <div className="relative z-10">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Join Civic Pulse'}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              {isLogin ? 'Sign in to your account' : 'Be a part of a smart community'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">{error}</div>}
            
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="sr-only">Username</label>
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition shadow-sm bg-white/60 focus:bg-white"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="sr-only">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition shadow-sm bg-white/60 focus:bg-white"
                  placeholder="Password"
                />
              </div>
              
              {!isLogin && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                   <select 
                     value={role} 
                     onChange={(e) => setRole(e.target.value)}
                     className="w-full border-slate-300 rounded-lg shadow-sm p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                     <option value="citizen">Citizen</option>
                     <option value="worker">Worker</option>
                     <option value="verifier">Verifier (Nagar Sevak)</option>
                     <option value="admin">Admin</option>
                   </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                 <label className="text-sm text-slate-600">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
