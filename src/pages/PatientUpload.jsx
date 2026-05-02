import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth, OperationType, handleFirestoreError } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle2, ChevronLeft, Image as ImageIcon, FileSearch } from 'lucide-react';

export default function PatientUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [type, setType] = useState('prescription');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const timestamp = Date.now();
      const storageRef = ref(storage, `records/${auth.currentUser.uid}/${timestamp}_${file.name}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'records'), {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        patientId: auth.currentUser.uid,
        fileURL,
        type,
        fileName: file.name,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 h-full">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Record</h1>
        <p className="text-gray-500">Add a prescription or medical report.</p>
      </div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleUpload} 
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType('prescription')}
                  className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    type === 'prescription' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 bg-white'
                  }`}
                >
                  <FileText size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Prescription</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('report')}
                  className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    type === 'report' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 bg-white'
                  }`}
                >
                  <FileSearch size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">Report</span>
                </button>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                    file ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-blue-400 bg-white'
                  }`}
                >
                  {file ? (
                    <div className="text-center">
                      <ImageIcon size={48} className="text-green-500 mx-auto mb-4" />
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Tap to change file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={48} className="text-gray-300 mx-auto mb-4 group-hover:text-blue-400" />
                      <p className="text-sm font-semibold text-gray-900">Choose file</p>
                      <p className="text-xs text-gray-500 mt-1">PDF or image files only</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-[0.98] disabled:active:scale-100"
            >
              {loading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful</h2>
            <p className="text-gray-500">Your record has been securely stored.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
