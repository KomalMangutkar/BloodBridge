import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartHandshake, 
  Droplet, 
  Bell, 
  LogOut, 
  User, 
  Activity, 
  MapPin, 
  Layers, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'DONOR': return '/donor';
      case 'HOSPITAL': return '/hospital';
      case 'BLOOD_BANK': return '/blood-bank';
      case 'ADMIN': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-rose-900/30 text-white sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-rose-500 font-extrabold text-xl tracking-tight hover:opacity-90 transition">
              <span className="p-2 bg-gradient-to-tr from-rose-600 to-red-500 text-white rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-current" />
              </span>
              <span>Blood<span className="text-white">Bridge</span></span>
            </Link>
            <span className="hidden sm:inline-block text-xs bg-rose-950 text-rose-300 font-medium px-2 py-0.5 rounded-full border border-rose-800/40">
              Emergency Response AI
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="text-slate-300 hover:text-white transition">Home</Link>
            <Link to="/inventory" className="text-slate-300 hover:text-white transition flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" /> City Blood Stock
            </Link>
            {user && (
              <Link to={getDashboardLink()} className="text-rose-400 hover:text-rose-300 font-semibold transition flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> My Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition relative focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                      <div className="p-3.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-rose-400" /> Notifications
                        </span>
                        <span className="text-xs text-rose-400 font-medium">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.actionUrl) navigate(n.actionUrl);
                                setShowNotifs(false);
                              }}
                              className={`p-3.5 hover:bg-slate-800/70 transition cursor-pointer text-xs ${!n.isRead ? 'bg-rose-950/20' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <p className="font-bold text-slate-200 mb-1">{n.title}</p>
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                              </div>
                              <p className="text-slate-400">{n.message}</p>
                              <span className="text-[10px] text-slate-500 mt-2 block">
                                {new Date(n.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-300">{user.role}</span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/30 hover:opacity-95 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
