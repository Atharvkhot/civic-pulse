import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      // filter tasks assigned to this worker or just unassigned
      const relevant = res.data.filter(t => t.status === 'Assigned' || t.status === 'In Progress');
      setTasks(relevant);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${id}/status`, { status });
      fetchTasks();
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Worker Dashboard</h1>
        <p className="text-slate-500 mt-1">Hello, {user?.username}. Here are your tasks to resolve.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map(task => (
          <div key={task._id} className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:shadow-xl transition shadow-sm">
            {task.images?.before && (
              <img src={`http://localhost:5000/${task.images.before}`} alt="Issue location" className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-800">{task.title}</h3>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${task.status === 'In Progress' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                {task.status}
              </span>
            </div>
            <p className="text-slate-600 mb-4">{task.description}</p>
            <div className="text-sm text-slate-500 mb-4 bg-slate-100 p-2 rounded">Category: <b>{task.category}</b></div>
            
            <div className="flex space-x-2">
              {task.status === 'Assigned' && (
                <button 
                  onClick={() => updateStatus(task._id, 'In Progress')}
                  className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 transition"
                >
                  Start Work
                </button>
              )}
              {task.status === 'In Progress' && (
                <button 
                  onClick={() => updateStatus(task._id, 'Completed')}
                  className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No active tasks. Good job!
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
