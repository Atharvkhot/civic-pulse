import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="text-6xl mb-6">🔒</div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Access Denied</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        You don't have permission to access this page. Please log in with the correct account role.
      </p>
      <Link to="/" className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
        Return Home
      </Link>
    </div>
  );
};

export default Unauthorized;
