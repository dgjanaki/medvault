import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, FileText, User, Share2, MapPin, Droplets, Calendar, Bell, Plus, CheckCircle2, Trash2, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardCard from '../components/DashboardCard';
import ToggleSwitch from '../components/ToggleSwitch';

export default function PatientDashboard({ userData }) {
  const [sharing, setSharing] = useState(userData?.sharingEnabled ?? true);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'reminders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.trim() || !reminderTime) return;

    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'reminders'), {
        id: crypto.randomUUID(),
        title: newReminder,
        time: reminderTime,
        completed: false,
        createdAt: serverTimestamp()
      });
      setNewReminder('');
      setReminderTime('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reminders');
    }
  };

  const toggleReminderStatus = async (id, current) => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'reminders', id), {
        completed: !current
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'reminders');
    }
  };

  const deleteReminder = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'reminders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'reminders');
    }
  };

  const handleToggleSharing = async (val) => {
    setSharing(val);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        sharingEnabled: val
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header Profile */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-blue-100/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
          <Heart size={80} className="text-blue-600 fill-blue-600" />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg border-2 border-white">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{userData?.name}</h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-flex mt-1">
              <ShieldCheck size={12} />
              Verified Profile
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-50">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Blood</p>
            <p className="font-bold text-red-600 text-lg uppercase">{userData?.bloodGroup}</p>
          </div>
          <div className="text-center border-x border-gray-50">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Age</p>
            <p className="font-bold text-gray-900 text-lg">{userData?.age}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Gender</p>
            <p className="font-bold text-gray-900 text-lg capitalize">{userData?.gender?.[0]}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Tabs */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload" 
          className="flex flex-col items-center justify-center gap-3 p-8 bg-blue-600 text-white rounded-[32px] shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <span className="font-bold tracking-wide">Upload</span>
        </Link>
        <Link 
          to="/patient/timeline" 
          className="flex flex-col items-center justify-center gap-3 p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:scale-[1.02] transition-all active:scale-95 group"
        >
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={24} className="text-blue-600" />
          </div>
          <span className="font-bold tracking-wide text-gray-900">Timeline</span>
        </Link>
      </div>

      {/* QR Code Pass */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Medical Pass</h2>
          <Share2 size={16} className="text-gray-300" />
        </div>
        <div className="inline-block p-4 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mb-6 group cursor-pointer hover:border-blue-400 transition-colors">
          <QRCodeSVG 
            value={`${window.location.origin}/doctor/patient/${auth.currentUser.uid}`} 
            size={160}
            level="H"
            className="group-hover:opacity-80 transition-opacity"
          />
        </div>
        <p className="text-xs text-gray-400 max-w-[200px] mx-auto mb-8 font-medium">
          Show this QR code to medical professionals for instant profile sharing.
        </p>

        <div className="bg-gray-50 rounded-3xl p-4">
          <ToggleSwitch 
            label="Share Medical Data" 
            description="Doctors can view your timeline"
            checked={sharing}
            onChange={handleToggleSharing}
          />
        </div>
      </div>

      {/* Reminders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Bell size={16} className="text-blue-600" /> Daily Reminders
          </h2>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddReminder}
              className="bg-white p-4 rounded-3xl border border-blue-100 shadow-lg shadow-blue-50 overflow-hidden"
            >
              <div className="space-y-3">
                <input 
                  required
                  placeholder="Drink water, Take Vitamin..."
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <div className="flex gap-2">
                  <input 
                    required
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="flex-1 bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm">Save</button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {reminders.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-xs italic">No active reminders. Add one to stay healthy!</p>
          ) : (
            reminders.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-[24px] border transition-all",
                  r.completed ? "bg-green-50/50 border-green-100 opacity-60" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleReminderStatus(r.id, r.completed)}
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                      r.completed ? "bg-green-600 text-white" : "bg-gray-50 text-gray-300 hover:text-blue-600"
                    )}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <div>
                    <p className={cn("font-bold text-sm", r.completed ? "line-through text-gray-400" : "text-gray-900")}>
                      {r.title}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500">{r.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteReminder(r.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
