import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Retrieve stored user role
      const saved = localStorage.getItem('bloodbridge_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'DONOR') navigate('/donor');
        else if (u.role === 'HOSPITAL') navigate('/hospital');
        else if (u.role === 'BLOOD_BANK') navigate('/blood-bank');
        else if (u.role === 'ADMIN') navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
  };

  return (
    <div className="min-w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl shadow-lg shadow-rose-600/30 text-white mb-3">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to BloodBridge</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in with your role-authorized credentials</p>
        </div>

        {/* Quick Demo Account Selector */}
        <div className="bg-slate-800/80 p-3 rounded-2xl mb-6 border border-slate-700/60">
          <span className="text-[11px] font-bold text-slate-300 block mb-2 text-center uppercase tracking-wider">
            Quick Demo Login (Password: demo1234)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleQuickDemo('hospital@demo.com')}
              className="py-1.5 px-2 bg-slate-700/60 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 rounded-lg transition border border-slate-600/40"
            >
              🏥 Hospital Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('donor@demo.com')}
              className="py-1.5 px-2 bg-slate-700/60 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 rounded-lg transition border border-slate-600/40"
            >
              🩸 Donor Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('bloodbank@demo.com')}
              className="py-1.5 px-2 bg-slate-700/60 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 rounded-lg transition border border-slate-600/40"
            >
              🏢 Blood Bank
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@demo.com')}
              className="py-1.5 px-2 bg-slate-700/60 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 rounded-lg transition border border-slate-600/40"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@demo.com"
                className="w-full bg-slate-800 text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 text-white pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
