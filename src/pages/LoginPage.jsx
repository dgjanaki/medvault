import React, { useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ShieldPlus, User, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Store the intended role in session storage for the onboarding page to pick up
      sessionStorage.setItem('intended_role', role);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed before completion. Please try again.");
      } else if (error.code === 'auth/blocked-at-request-time') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError("An unexpected error occurred during sign-in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
          <ShieldPlus size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MedVault</h1>
        <p className="text-gray-500 mb-8">Secure digital health records for everyone.</p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setRole('patient')}
            disabled={loading}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
              role === 'patient' 
                ? "border-blue-600 bg-blue-50/50" 
                : "border-gray-100 bg-white hover:border-gray-200",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl",
              role === 'patient' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            )}>
              <User size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">I am a Patient</p>
              <p className="text-sm text-gray-500">Access your medical history securely.</p>
            </div>
          </button>

          <button
            onClick={() => setRole('doctor')}
            disabled={loading}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
              role === 'doctor' 
                ? "border-blue-600 bg-blue-50/50" 
                : "border-gray-100 bg-white hover:border-gray-200",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl",
              role === 'doctor' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
            )}>
              <Stethoscope size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">I am a Doctor</p>
              <p className="text-sm text-gray-500">View patient records with permission.</p>
            </div>
          </button>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
