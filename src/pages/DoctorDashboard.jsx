import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserSearch, Stethoscope, History, ArrowRight, Camera, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardCard from '../components/DashboardCard';
import QRScanner from '../components/QRScanner';

export default function DoctorDashboard({ userData }) {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  return (
    <div className="px-6 py-8 space-y-8">
      <AnimatePresence>
        {isScanning && (
          <QRScanner 
            onScan={(id) => navigate(`/doctor/patient/${id}`)} 
            onClose={() => setIsScanning(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white border-2 border-blue-400 shadow-lg shadow-blue-100">
            <Stethoscope size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">Dr. {userData?.name}</h1>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{userData?.degree}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setIsScanning(true)}
          className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-100 flex flex-col items-center gap-3 active:scale-95 transition-all group"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform text-white">
            <Camera size={24} />
          </div>
          <span className="font-bold text-sm">Scan QR Code</span>
        </button>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
            <UserSearch size={24} />
          </div>
          <span className="font-bold text-sm text-gray-900">Manual Entry</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Patient Search</h2>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter Patient ID"
            className="w-full h-16 p-6 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-3xl outline-none transition-all pr-12 text-gray-900 font-semibold"
          />
          <button 
            type="submit" 
            disabled={!patientId.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Recently Viewed</h2>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
            <History size={32} />
          </div>
          <p className="text-gray-400 text-sm">Once you view patients, they'll appear here for quick access.</p>
        </div>
      </div>
    </div>
  );
}
