import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, ClipboardList, MapPin, Hash, Users, GraduationCap } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(sessionStorage.getItem('intended_role') || 'patient');
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    degree: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        id: user.uid,
        role: role,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        createdAt: new Date().toISOString(),
      };

      if (role === 'patient') {
        Object.assign(userData, {
          age: formData.age,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          sharingEnabled: true, // Default to true as per requirements normally
        });
      } else {
        Object.assign(userData, {
          degree: formData.degree,
        });
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      window.location.reload(); // Trigger re-auth state in App.jsx
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Profile</h1>
          <p className="text-gray-500">Tell us a bit more about you as a {role}.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Full Name
              </label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} /> Address
              </label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                placeholder="123 Street, City"
              />
            </div>

            {role === 'patient' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Hash size={14} /> Age
                    </label>
                    <input
                      required
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} /> Gender
                    </label>
                    <select
                      required
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList size={14} /> Blood Group
                  </label>
                  <select
                    required
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap size={14} /> Degree / Specialization
                </label>
                <input
                  required
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all"
                  placeholder="MBBS, Cardiology"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Saving...' : 'Finish Onboarding'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
