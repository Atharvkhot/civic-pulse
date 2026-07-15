import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const verifyComplaint = async (id) => {
    try {
      // Logic to run AI check 
      await axios.patch(`http://localhost:5000/api/complaints/${id}/status`, { status: 'Verified' });
      fetchComplaints();
    } catch (err) {
      alert("Error verifying");
    }
  };

  const assignTask = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${id}/status`, { status: 'Assigned' });
      fetchComplaints();
    } catch (err) {
      alert("Error assigning");
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 mt-1">Manage all civic issues and verify resolutions.</p>
        </div>
      </header>

      <div className="glass p-6 rounded-2xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-slate-600 font-semibold">Photo</th>
              <th className="pb-3 text-slate-600 font-semibold">Title</th>
              <th className="pb-3 text-slate-600 font-semibold">Category</th>
              <th className="pb-3 text-slate-600 font-semibold">Status</th>
              <th className="pb-3 text-slate-600 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                <td className="py-4">
                  {c.images?.before ? (
                    <img src={`http://localhost:5000/${c.images.before}`} alt="Proof" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center p-1">No Image</div>
                  )}
                </td>
                <td className="py-4 font-medium text-slate-800">{c.title}</td>
                <td className="py-4 text-slate-600">{c.category}</td>
                <td className="py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700 font-bold">
                    {c.status}
                  </span>
                </td>
                <td className="py-4 text-right space-x-2">
                  {c.status === 'Submitted' && (
                    <button onClick={() => assignTask(c._id)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold hover:bg-blue-200">Assign Worker</button>
                  )}
                  {c.status === 'Completed' && (
                    <button onClick={() => verifyComplaint(c._id)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200">Verify & Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
