import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, User, FileText, FileSearch, Eye, Calendar, AlertCircle } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function DoctorPatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        
        if (!patientDoc.exists()) {
          setError("Patient not found.");
          setLoading(false);
          return;
        }

        const patientData = patientDoc.data();
        if (patientData.role !== 'patient') {
          setError("Invalid user ID.");
          setLoading(false);
          return;
        }

        if (!patientData.sharingEnabled) {
          setDenied(true);
          setLoading(false);
          return;
        }

        setPatient(patientData);

        // Fetch records
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecords(docs);
          setLoading(false);
        }, (error) => {
          // If security rules block this, we handle it as denied
          if (error.code === 'permission-denied') {
            setDenied(true);
          } else {
            handleFirestoreError(error, OperationType.LIST, 'records');
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        if (err.code === 'permission-denied') {
          setDenied(true);
        } else {
          setError("Something went wrong while fetching data.");
        }
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-12 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="bg-gray-100 px-6 py-2 rounded-xl font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (denied) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-6 py-20 text-center"
      >
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6 shadow-sm border border-red-100">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          The patient has restricted access to their records. Please ask them to enable sharing in their dashboard.
        </p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold"
        >
          Back to Dashboard
        </button>
      </motion.div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">
      <button 
        onClick={() => navigate('/doctor/dashboard')}
        className="flex items-center gap-2 text-gray-500 mb-2 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Dashboard</span>
      </button>

      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{patient?.name}</h1>
          <p className="text-gray-500 text-sm">Age: {patient?.age} • {patient?.gender} • {patient?.bloodGroup}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Blood Group</p>
          <p className="font-bold text-red-600 text-xl">{patient?.bloodGroup}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Age</p>
          <p className="font-bold text-gray-900 text-xl">{patient?.age}</p>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          Medical Timeline
        </h2>
        
        {records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-400">No records shared yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {record.type === 'prescription' ? <FileText size={18} /> : <FileSearch size={18} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 capitalize">{record.type}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {record.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="no-referrer"
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye size={18} />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DashboardCard title="Contact Info" icon={User} className="text-sm">
        <p className="text-gray-600 font-medium">Address:</p>
        <p className="text-gray-500 mt-1">{patient?.address}</p>
        <p className="text-gray-600 font-medium mt-3">Email:</p>
        <p className="text-gray-500 mt-1">{patient?.email}</p>
      </DashboardCard>
    </div>
  );
}
