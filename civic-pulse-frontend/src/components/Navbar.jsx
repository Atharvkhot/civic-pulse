import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin' || user.role === 'verifier') return '/admin';
    if (user.role === 'worker') return '/worker';
    return '/citizen';
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
              Civic<span className="text-slate-900">Pulse</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-slate-600 hover:text-blue-600 transition font-medium">Dashboard</Link>
                <div className="text-sm font-semibold text-slate-500 mr-2">({user.role})</div>
                <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-full font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/30">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
