import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { LogOut, Activity, User, ShieldPlus } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
          <ShieldPlus size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">MedVault</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
