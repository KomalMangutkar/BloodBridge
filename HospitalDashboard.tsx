import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Users, 
  Send, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Radio,
  ExternalLink,
  Map as MapIcon,
  List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BloodRequest, DonorMatch } from '../types';

export const HospitalDashboard: React.FC = () => {
  const { user, profile, token } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [matches, setMatches] = useState<DonorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Modal create request
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: 'O+',
    unitsRequired: 3,
    urgency: 'CRITICAL',
    deadlineHours: 2,
    notes: 'Urgent emergency transfusion needed.',
    initialRadiusKm: 10,
    maxRadiusKm: 50,
    preferredContact: 'Phone & Direct In-App'
  });

  const [creating, setCreating] = useState(false);
  const [selectingDonorId, setSelectingDonorId] = useState<string | null>(null);
  const [confirmingMatchId, setConfirmingMatchId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const list: BloodRequest[] = await res.json();
        setRequests(list);
        if (list.length > 0 && !selectedRequest) {
          setSelectedRequest(list[0]);
          loadMatchesForRequest(list[0].id);
        } else if (selectedRequest) {
          loadMatchesForRequest(selectedRequest.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchesForRequest = async (reqId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/requests/${reqId}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMatches(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);

    try {
      const deadlineDate = new Date(Date.now() + formData.deadlineHours * 3600000).toISOString();
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bloodGroup: formData.bloodGroup,
          unitsRequired: formData.unitsRequired,
          urgency: formData.urgency,
          deadline: deadlineDate,
          notes: formData.notes,
          initialRadiusKm: formData.initialRadiusKm,
          maxRadiusKm: formData.maxRadiusKm,
          preferredContact: formData.preferredContact
        })
      });

      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        await fetchRequests();
        setSelectedRequest(data.request);
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectDonor = async (matchId: string) => {
    if (!token) return;
    setSelectingDonorId(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        if (selectedRequest) await loadMatchesForRequest(selectedRequest.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSelectingDonorId(null);
    }
  };

  const handleConfirmDonation = async (match: DonorMatch) => {
    if (!token || !selectedRequest) return;
    setConfirmingMatchId(match.id);
    try {
      const res = await fetch('/api/donations/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId: match.id,
          donorId: match.donorId,
          requestId: selectedRequest.id,
          unitsDonated: 1
        })
      });
      if (res.ok) {
        await fetchRequests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmingMatchId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hospital Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-600/30 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Verified Emergency Medical Center
            </span>
            <span className="text-xs text-slate-400">ID: {profile?.registrationNumber || 'HOSP-001'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{profile?.name || 'Hospital Dashboard'}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time donor coordination, live match dispatch, and donation verification.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Emergency Blood Request</span>
        </button>
      </div>

      {/* Main Grid: Active Requests (Left) & Matches/Candidates (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Request List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Active Requests ({requests.length})</span>
            </h3>
          </div>

          {requests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              No active blood requests created yet. Click "New Emergency Blood Request" above to initiate.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const isSelected = selectedRequest?.id === r.id;
                const hoursLeft = Math.max(0, Math.round((new Date(r.deadline).getTime() - Date.now()) / 3600000));

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRequest(r);
                      loadMatchesForRequest(r.id);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-600/10'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-white bg-rose-600 px-2.5 py-0.5 rounded-lg shadow">
                        {r.bloodGroup}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          r.urgency === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-semibold mb-1">
                      {r.unitsFulfilled} of {r.unitsRequired} Units Fulfilled
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <Clock className="w-3.5 h-3.5" /> ~{hoursLeft}h remaining
                      </span>
                      <span className="uppercase font-bold tracking-wider text-[10px] text-slate-400">
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Matches and Candidates */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRequest ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Selected Request Summary */}
              <div className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded">
                      Request: {selectedRequest.bloodGroup}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: {selectedRequest.unitsRequired} units
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">
                      Radius: up to {selectedRequest.currentRadiusKm} km
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{selectedRequest.notes}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Toggle Map / List view */}
                  <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                        viewMode === 'list' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition ${
                        viewMode === 'map' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Radar Map</span>
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block">Status</span>
                    <span className="text-sm font-black text-rose-400 uppercase">{selectedRequest.status}</span>
                  </div>
                </div>
              </div>

              {/* Matched Donors Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Matched Donors ({matches.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Filtered by RBC compatibility, platform eligibility, and Haversine distance ranking.
                  </p>
                </div>
              </div>

              {/* Interactive Radar Map View */}
              {viewMode === 'map' ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden h-80 flex items-center justify-center">
                  {/* Radar Circles */}
                  <div className="absolute w-72 h-72 rounded-full border border-rose-900/40"></div>
                  <div className="absolute w-52 h-52 rounded-full border border-rose-800/40"></div>
                  <div className="absolute w-32 h-32 rounded-full border border-rose-700/50"></div>
                  
                  {/* Center Hospital Marker */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 bg-rose-600 text-white rounded-full shadow-lg shadow-rose-600/50 animate-pulse">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700 mt-1">
                      {selectedRequest.hospitalName || 'Hospital Center'}
                    </span>
                  </div>

                  {/* Dynamic Donor Position Markers around center */}
                  {matches.map((m, idx) => {
                    const angle = (idx * (360 / Math.max(1, matches.length))) * (Math.PI / 180);
                    const radius = Math.min(120, Math.max(40, m.distanceKm * 20));
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <div
                        key={m.id}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        className="absolute z-20 group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-slate-900 transform group-hover:scale-125 transition">
                          {m.donorBloodGroup || selectedRequest.bloodGroup}
                        </div>

                        {/* Hover Popover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl text-[10px] text-slate-200 opacity-0 group-hover:opacity-100 transition pointer-events-none z-30">
                          <p className="font-bold text-white">{m.donorName}</p>
                          <p className="text-emerald-400 font-semibold">{m.distanceKm} km away • Score: {m.matchScore}%</p>
                          <p className="text-slate-400 mt-0.5">{m.status.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  Searching for donors... Expanding radius automatically.
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-850 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center font-black text-sm shadow">
                            {m.donorBloodGroup || selectedRequest.bloodGroup}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-white">{m.donorName || 'Candidate Donor'}</h4>
                            <p className="text-[11px] text-slate-400">
                              ~{m.distanceKm} km away • Compatibility Score: <strong className="text-emerald-400">{m.matchScore}%</strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <span
                          className={`self-start sm:self-auto text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            m.status === 'ACCEPTED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : m.status === 'COORDINATION_STARTED'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : m.status === 'COMPLETED'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {m.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
                        {m.matchReason}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        {m.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleSelectDonor(m.id)}
                            disabled={selectingDonorId === m.id}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                          >
                            {selectingDonorId === m.id ? 'Starting...' : 'Select & Start Coordination'}
                          </button>
                        )}

                        {m.status === 'COORDINATION_STARTED' && (
                          <button
                            onClick={() => handleConfirmDonation(m)}
                            disabled={confirmingMatchId === m.id}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm Completed Donation & Issue Certificate</span>
                          </button>
                        )}

                        {m.status === 'COMPLETED' && (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Donation Verified & Certificate Generated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
              Select a blood request from the left column to view its live matched candidates.
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Blood Request */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-2">Create Emergency Blood Request</h3>
            <p className="text-xs text-slate-400 mb-6">
              Initiates automatic compatibility filtering, Haversine distance ranking, and real-time donor notifications.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blood Group Needed</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Units Required</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.unitsRequired}
                    onChange={(e) => setFormData({ ...formData, unitsRequired: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency Priority</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate)</option>
                    <option value="URGENT">URGENT (&lt; 6 hours)</option>
                    <option value="NORMAL">NORMAL (&lt; 24 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Required Within (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={formData.deadlineHours}
                    onChange={(e) => setFormData({ ...formData, deadlineHours: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Emergency surgery or acute trauma details"
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 hover:opacity-95"
                >
                  {creating ? 'Dispatching...' : 'Dispatch Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
