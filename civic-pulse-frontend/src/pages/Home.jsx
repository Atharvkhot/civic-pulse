import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
        Building Better Cities, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">Together.</span>
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl px-4">
        Report civic issues, track resolution in real-time, and earn rewards for active participation in your community utilizing AI-powered verification.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <Link to="/login" className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 text-lg">
          Report an Issue
        </Link>
        <Link to="/citizen" className="px-8 py-4 bg-white text-slate-800 font-semibold rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm text-lg">
          Explore Live Feed
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {[
          { title: "Real-time Tracking", desc: "Follow the lifecycle of your complaint live." },
          { title: "AI Verification", desc: "Automated fraud detection using advanced computer vision." },
          { title: "Civic Rewards", desc: "Earn Civic Points and become a verified neighborhood hero." }
        ].map((feature, i) => (
          <div key={i} className="glass p-6 rounded-2xl text-left hover:-translate-y-1 transition duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
            <p className="text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
