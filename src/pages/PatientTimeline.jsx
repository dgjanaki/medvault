import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { FileText, FileSearch, ChevronLeft, Eye, Calendar, Clock, Download } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function PatientTimeline() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'records'),
      where('patientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'records');
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="px-6 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical Timeline</h1>
        <p className="text-gray-500">Your health journey, recorded.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 flex flex-col items-center">
          <FileSearch size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500">No records found yet.</p>
          <button 
            onClick={() => navigate('/patient/upload')}
            className="mt-4 text-blue-600 font-semibold"
          >
            Upload your first record
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  {record.type === 'prescription' ? <FileText size={20} /> : <FileSearch size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">{record.type}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <Calendar size={12} />
                    <span>{record.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={record.fileURL} 
                target="_blank" 
                rel="no-referrer"
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Eye size={20} />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
