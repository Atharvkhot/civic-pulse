import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};
const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777
};



const CitizenDashboard = () => {
  const [activeTab, setActiveTab] = useState('report');
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "" // Using mock/development mode
  });

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road');
  const [position, setPosition] = useState(null);
  const [image, setImage] = useState(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [potholeDetection, setPotholeDetection] = useState({ detected: false, confidence: 0 });
  
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      alert("Could not access camera. Please allow permissions.");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        // Create an artificial File object out of the blob
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setImage(file);
        closeCamera();
      }, 'image/jpeg');
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Could not fetch location. Please ensure location permissions are enabled.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      const audioChunks = [];
      recorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });

      recorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      });
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const socket = io('http://localhost:5000');
    socket.on('complaint_created', (newComplaint) => {
      setComplaints(prev => [newComplaint, ...prev]);
    });
    socket.on('status_updated', (updatedComplaint) => {
      setComplaints(prev => prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c));
    });
    return () => socket.disconnect();
  }, []);

  // AI Pothole Detection Live Feed Loop
  useEffect(() => {
    let interval;
    if (isCameraOpen && category === 'Road') {
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('image', blob, 'frame.jpg');
            try {
              const res = await axios.post('http://localhost:8000/detect-pothole', formData);
              setPotholeDetection(res.data);
            } catch (err) {
              // Ignore AI errors internally to not spam the user
            }
          }, 'image/jpeg', 0.8);
        }
      }, 1500);
    } else {
      setPotholeDetection({ detected: false, confidence: 0 });
    }
    return () => clearInterval(interval);
  }, [isCameraOpen, category]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) return alert("Please select a location on the map.");
    if (!image) return alert("Please upload an image.");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('lat', position.lat);
    formData.append('lng', position.lng);
    formData.append('image', image);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'voicenote.webm');
    }

    try {
      await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Report submitted successfully!');
      setTitle(''); setDescription(''); setPosition(null); setImage(null);
      setAudioBlob(null); setAudioUrl(null);
      setActiveTab('feed');
    } catch (err) {
      alert('Error submitting report.');
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.username}!</h1>
          <p className="text-slate-500 mt-1">Manage your reports and view community issues.</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-xl shadow-lg font-bold hover:scale-105 transition transform cursor-pointer">
          ⭐ {user?.points || 0} Civic Points
        </div>
      </header>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-6 max-w-sm">
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'report' ? 'bg-white shadow relative text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Report Issue
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'feed' ? 'bg-white shadow relative text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Community Feed
        </button>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl min-h-[500px]">
        {activeTab === 'report' ? (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">New Report</h2>
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-500">Pin the issue location or use auto-detect.</p>
              <button type="button" onClick={getUserLocation} className="text-sm bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-full hover:bg-blue-200 transition shadow-sm flex items-center">
                <span className="mr-1">📍</span> My Location
              </button>
            </div>
            
            <div className="bg-slate-200 rounded-xl h-64 mb-6 relative z-0 overflow-hidden shadow-inner flex items-center justify-center">
               {!isLoaded ? (
                 <span className="text-slate-500 font-medium">Loading Google Maps...</span>
               ) : loadError ? (
                 <span className="text-red-500 font-medium">Error loading maps</span>
               ) : (
                 <GoogleMap
                   mapContainerStyle={mapContainerStyle}
                   zoom={11}
                   center={position || defaultCenter}
                   onClick={(e) => setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                   options={{ streetViewControl: false, mapTypeControl: false }}
                 >
                   {position && <Marker position={position} animation={window.google.maps.Animation.DROP} />}
                 </GoogleMap>
               )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                  <input required value={title} onChange={(e)=>setTitle(e.target.value)} type="text" className="w-full border border-slate-300 rounded-lg shadow-sm p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-4" placeholder="e.g. Large pothole on main street" />
                  
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea required value={description} onChange={(e)=>setDescription(e.target.value)} rows="3" className="w-full border border-slate-300 rounded-lg shadow-sm p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Provide more details..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border border-slate-300 rounded-lg shadow-sm p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-4">
                    <option value="Road">Roads & Potholes</option>
                    <option value="Garbage">Garbage Collection</option>
                    <option value="Electricity">Streetlights/Electricity</option>
                    <option value="Water">Water Supply</option>
                    <option value="Other">Other</option>
                  </select>
                  <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Upload Image Proof</label>
                  
                  {!isCameraOpen ? (
                    <div className="flex flex-col space-y-3 mb-4">
                      <button type="button" onClick={openCamera} className="w-full bg-slate-800 text-white font-medium py-2 rounded-lg shadow-sm hover:bg-slate-700 transition flex items-center justify-center">
                        <span className="mr-2">📷</span> Open Live Camera
                      </button>
                      <div className="relative flex items-center py-1">
                         <div className="flex-grow border-t border-slate-300"></div>
                         <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wide">Or choose file</span>
                         <div className="flex-grow border-t border-slate-300"></div>
                      </div>
                      <input type="file" accept="image/*" onChange={(e)=>setImage(e.target.files[0])} className="w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" />
                      {image && <p className="text-xs text-green-600 mt-1 font-medium">Image selected: {image.name}</p>}
                    </div>
                  ) : (
                    <div className="mb-4 bg-black rounded-lg overflow-hidden relative shadow-lg">
                      {potholeDetection.detected && (
                        <div className="absolute top-4 left-0 right-0 flex justify-center animate-pulse z-10 pointer-events-none">
                           <div className="bg-red-600/90 text-white px-4 py-2 rounded-full font-bold shadow-lg border-2 border-red-400 flex items-center">
                             <span className="mr-2">🚨</span> AI: Pothole Detected ({(potholeDetection.confidence * 100).toFixed(0)}%)
                           </div>
                        </div>
                      )}
                      {/* Bounding box mock overlay */}
                      {potholeDetection.detected && potholeDetection.bounding_box && (
                        <div 
                          className="absolute border-4 border-red-500 bg-red-500/20 z-10 pointer-events-none transition-all duration-300"
                          style={{
                             left: `${potholeDetection.bounding_box[0] * 100}%`,
                             top: `${potholeDetection.bounding_box[1] * 100}%`,
                             width: `${potholeDetection.bounding_box[2] * 100}%`,
                             height: `${potholeDetection.bounding_box[3] * 100}%`
                          }}
                        ></div>
                      )}
                      
                      <video ref={videoRef} autoPlay playsInline className="w-full h-48 md:h-64 object-cover"></video>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-3 z-20">
                        <button type="button" onClick={capturePhoto} className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700">Capture</button>
                        <button type="button" onClick={closeCamera} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-700">Cancel</button>
                      </div>
                      <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-slate-700 mb-1">Voice Note (Optional)</label>
                  <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
                    {!isRecording ? (
                      <button type="button" onClick={startRecording} className="bg-slate-100 text-slate-700 font-medium px-3 py-2 rounded border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center shrink-0">
                        <span>🎤 Record</span>
                      </button>
                    ) : (
                      <button type="button" onClick={stopRecording} className="bg-red-600 text-white font-medium px-3 py-2 rounded animate-pulse shadow-sm flex items-center shrink-0">
                         <span>⏹ Stop</span>
                      </button>
                    )}
                    {audioUrl && (
                      <audio src={audioUrl} controls className="w-full h-8" />
                    )}
                  </div>
                </div>
            </div>
            <button type="submit" className="mt-8 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition">
              Submit Report
            </button>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">Civic Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((item) => (
                  <div key={item._id} className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:shadow-xl transition shadow-sm">
                    {item.images?.before && (
                      <img src={`http://localhost:5000/${item.images.before}`} alt="Issue" className="w-full h-48 object-cover" />
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-slate-800 text-lg truncate pr-2">{item.title}</h4>
                         <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                           item.status === 'Verified' ? 'bg-green-100 text-green-700' : 
                           item.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 
                           'bg-orange-100 text-orange-700'
                         }`}>
                           {item.status}
                         </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center text-xs text-slate-400">
                         <span className="bg-slate-100 px-2 py-1 rounded">{item.category}</span>
                         <span className="ml-auto">By {item.reportedBy?.username || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
