import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Droplet, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Award, 
  ArrowRight,
  Radio,
  CheckCircle2,
  Building2,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20">
        {/* Ambient radial gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-600/20 via-red-600/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs font-bold shadow-lg animate-pulse">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>AI-Powered Emergency Matching Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Every second matters. <br />
            <span className="bg-gradient-to-r from-rose-500 via-red-500 to-rose-400 bg-clip-text text-transparent">
              Find the right blood donor faster.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto font-medium">
            BloodBridge bridges hospitals, verified voluntary donors, and city blood banks in real time using Haversine distance, progressive radius expansion, and clinical ABO/Rh compatibility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 flex items-center gap-2 text-sm transition transform hover:scale-105"
            >
              <span>Hospital Emergency Dispatch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-750 text-white font-bold rounded-2xl border border-slate-700/80 text-sm transition flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>Join as a Verified Donor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl hover:border-slate-700 transition relative overflow-hidden group">
            <span className="p-3 bg-rose-600/20 text-rose-400 rounded-2xl inline-block mb-4">
              <Zap className="w-6 h-6" />
            </span>
            <h3 className="text-lg font-extrabold text-white mb-2">Automated Progressive Matching</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Filters donors strictly by RBC compatibility, platform screening intervals, and availability before progressively expanding search radius (5km → 10km → 25km → 50km → 100km).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl hover:border-slate-700 transition relative overflow-hidden group">
            <span className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl inline-block mb-4">
              <Activity className="w-6 h-6" />
            </span>
            <h3 className="text-lg font-extrabold text-white mb-2">Live City-Wide Reserves</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Dynamic visual blood bag dashboards for all 8 ABO/Rh groups with real-time stock thresholds, avoiding shortages before critical surgeries begin.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl hover:border-slate-700 transition relative overflow-hidden group">
            <span className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl inline-block mb-4">
              <Award className="w-6 h-6" />
            </span>
            <h3 className="text-lg font-extrabold text-white mb-2">Cryptographic Certificates & Badges</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Permanent digital verifiable recognition for voluntary life-savers, milestone achievements, and explainable attendance reliability tracking.
            </p>
          </div>
        </div>
      </section>

      {/* RBC Compatibility Matrix Reference */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1">
              Clinical Transfusion Guidelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ABO/Rh Red Blood Cell Compatibility Matrix
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Every match is strictly validated by our backend compatibility service before triggering emergency dispatch.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
            {[
              { r: 'O-', d: 'O-' },
              { r: 'O+', d: 'O-, O+' },
              { r: 'A-', d: 'O-, A-' },
              { r: 'A+', d: 'O-, O+, A-, A+' },
              { r: 'B-', d: 'O-, B-' },
              { r: 'B+', d: 'O-, O+, B-, B+' },
              { r: 'AB-', d: 'O-, A-, B-, AB-' },
              { r: 'AB+', d: 'Universal (All 8)' },
            ].map(item => (
              <div key={item.r} className="bg-slate-850 border border-slate-800 rounded-2xl p-4">
                <span className="text-base font-black text-white bg-rose-600 px-2 py-0.5 rounded block mb-2">
                  {item.r}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Compatible Donors:</span>
                <span className="text-xs font-bold text-emerald-400">{item.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-900/60 via-slate-900 to-rose-950/60 border border-rose-800/40 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Ready for live testing?</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Experience the complete end-to-end hackathon workflow using the pre-seeded demo accounts.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg transition text-xs sm:text-sm"
            >
              <span>Explore Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
