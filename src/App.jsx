import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientView from './pages/DoctorPatientView';

// Components
import Navbar from './components/Navbar';
import HealthuChat from './components/HealthuChat';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect logic
  const isPatient = userData?.role === 'patient';
  const isDoctor = userData?.role === 'doctor';
  const needsOnboarding = user && !userData;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="max-w-md mx-auto min-h-[calc(100vh-73px)] pb-12">
          <Routes>
            <Route path="/login" element={
              user ? (
                needsOnboarding ? <Navigate to="/onboarding" /> : 
                isPatient ? <Navigate to="/patient/dashboard" /> : <Navigate to="/doctor/dashboard" />
              ) : <LoginPage />
            } />
            
            <Route path="/onboarding" element={
              user ? (userData ? <Navigate to="/" /> : <OnboardingPage />) : <Navigate to="/login" />
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              isPatient ? <PatientDashboard userData={userData} /> : <Navigate to="/login" />
            } />
            <Route path="/patient/upload" element={
              isPatient ? <PatientUpload /> : <Navigate to="/login" />
            } />
            <Route path="/patient/timeline" element={
              isPatient ? <PatientTimeline /> : <Navigate to="/login" />
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              isDoctor ? <DoctorDashboard userData={userData} /> : <Navigate to="/login" />
            } />
            <Route path="/doctor/patient/:id" element={
              isDoctor ? <DoctorPatientView /> : <Navigate to="/login" />
            } />

            {/* Default Route */}
            <Route path="/" element={
              user ? (
                needsOnboarding ? <Navigate to="/onboarding" /> :
                isPatient ? <Navigate to="/patient/dashboard" /> : <Navigate to="/doctor/dashboard" />
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </main>
        {user && !needsOnboarding && <HealthuChat />}
      </div>
    </BrowserRouter>
  );
}
