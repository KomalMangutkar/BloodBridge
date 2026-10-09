import React, { useEffect, useState } from 'react';
import { Droplet, AlertTriangle, ShieldCheck, RefreshCw, Filter, Building2 } from 'lucide-react';
import { BloodInventory } from '../types';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let url = '/api/inventory';
      const params = new URLSearchParams();
      if (selectedCity) params.append('city', selectedCity);
      if (selectedGroup) params.append('bloodGroup', selectedGroup);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setInventory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCity, selectedGroup]);

  // Aggregate by blood group for summary cards
  const groups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const summaryByGroup = groups.map(g => {
    const items = inventory.filter(i => i.bloodGroup === g);
    const totalUnits = items.reduce((sum, item) => sum + item.unitsAvailable, 0);
    let status: 'CRITICAL' | 'LOW' | 'AVAILABLE' = 'AVAILABLE';
    if (totalUnits <= 10) status = 'CRITICAL';
    else if (totalUnits <= 25) status = 'LOW';
    return { group: g, totalUnits, status };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-950/60 text-rose-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-rose-900/40">
            <Droplet className="w-3.5 h-3.5 fill-current" /> Live City Blood Reserves
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            City-Wide Blood Availability Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time verified blood bank reserves across major medical centers. Updated automatically.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="self-start md:self-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700/60 text-xs font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stock
        </button>
      </div>

      {/* Aggregate Visual Blood Bags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-10">
        {summaryByGroup.map((item) => {
          const fillPercentage = Math.min(100, Math.max(15, (item.totalUnits / 40) * 100));
          return (
            <div
              key={item.group}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-lg group hover:border-slate-700 transition"
            >
              {/* Status Pill */}
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider ${
                  item.status === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : item.status === 'LOW'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {item.status}
              </span>

              {/* Animated Blood Bag Graphic */}
              <div className="relative w-14 h-20 bg-slate-800 rounded-b-2xl rounded-t-lg border border-slate-700/70 overflow-hidden my-1 flex items-end justify-center shadow-inner">
                {/* Simulated Tube Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-slate-600 rounded-b"></div>

                {/* Blood Fill Level */}
                <div
                  className="w-full bg-gradient-to-t from-red-700 via-rose-600 to-red-500 transition-all duration-700 rounded-b-xl"
                  style={{ height: `${fillPercentage}%` }}
                >
                  <div className="w-full h-1 bg-white/20 animate-pulse"></div>
                </div>

                {/* Center Group Label on Bag */}
                <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-white drop-shadow-md">
                  {item.group}
                </div>
              </div>

              {/* Units count */}
              <div className="mt-2">
                <span className="text-lg font-extrabold text-white">{item.totalUnits}</span>
                <span className="text-[10px] text-slate-400 ml-1">units</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-400" /> Filter By:
          </span>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="">All Cities</option>
            <option value="New Delhi">New Delhi</option>
            <option value="Gurugram">Gurugram</option>
            <option value="Noida">Noida</option>
            <option value="Chandigarh">Chandigarh</option>
          </select>

          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500"
          >
            <option value="">All Blood Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {inventory.length} verified stock records
        </span>
      </div>

      {/* Detailed Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3 px-4">Blood Bank</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-200">{item.bloodBankName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{item.city}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-sm text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/40">
                      {item.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm font-bold text-white">{item.unitsAvailable}</span> units
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.unitsAvailable <= item.criticalStockThreshold
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : item.unitsAvailable <= item.lowStockThreshold
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {item.unitsAvailable <= item.criticalStockThreshold
                        ? 'CRITICAL'
                        : item.unitsAvailable <= item.lowStockThreshold
                        ? 'LOW STOCK'
                        : 'AVAILABLE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(item.lastUpdated).toLocaleDateString()}
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
