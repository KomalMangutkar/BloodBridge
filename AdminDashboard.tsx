import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Droplet, 
  Activity, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    try {
      const anRes = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (anRes.ok) setAnalytics(await anRes.json());

      const logRes = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (logRes.ok) setAuditLogs(await logRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-600/30 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">System Operations & Compliance</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Platform telemetry, institution verification, active emergency dispatch monitoring, and immutable audit logs.
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-slate-400 text-[11px] font-semibold block mb-1">Total Donors</span>
            <span className="text-2xl font-black text-white">{analytics.totalDonors}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-slate-400 text-[11px] font-semibold block mb-1">Hospitals</span>
            <span className="text-2xl font-black text-rose-400">{analytics.totalHospitals}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-slate-400 text-[11px] font-semibold block mb-1">Blood Banks</span>
            <span className="text-2xl font-black text-amber-400">{analytics.totalBloodBanks}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-slate-400 text-[11px] font-semibold block mb-1">Emergencies</span>
            <span className="text-2xl font-black text-red-500">{analytics.activeEmergencies}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-slate-400 text-[11px] font-semibold block mb-1">Certificates Issued</span>
            <span className="text-2xl font-black text-emerald-400">{analytics.totalCertificates}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-slate-400 text-[11px] font-semibold block mb-1">Avg Response</span>
            <span className="text-2xl font-black text-white">{analytics.averageResponseTimeMinutes}m</span>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-400" />
          <span>Real-Time Audit & Security Event Stream</span>
        </h3>
        <p className="text-xs text-slate-400">
          Cryptographically recorded actions across institution verifications, requests, matches, and confirmations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-[11px] bg-slate-800 px-2.5 py-1 rounded text-rose-400 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{log.userRole || 'SYSTEM'}</td>
                  <td className="py-3.5 px-4 text-slate-200">{log.details}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
