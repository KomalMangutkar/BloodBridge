import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  Calendar, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  ShieldCheck, 
  Flame, 
  FileText,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DonorProfile, BloodRequest, DonorMatch, DonorBadge, Certificate } from '../types';

export const DonorDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [matches, setMatches] = useState<DonorMatch[]>([]);
  const [badges, setBadges] = useState<DonorBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  // Screening modal state
  const [showScreening, setShowScreening] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState({
    age: 26,
    weightKg: 65,
    hasRecentDonation: false,
    hasRecentIllnessOrFever: false,
    hasMajorSurgeryLast6Months: false,
    isOnRestrictedMedications: false
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      // 1. Get profile
      const profRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profRes.ok) {
        const d = await profRes.json();
        setProfile(d.profile);

        if (d.profile?.id) {
          // 2. Badges
          const bRes = await fetch(`/api/donors/${d.profile.id}/badges`);
          if (bRes.ok) setBadges(await bRes.json());
        }
      }

      // 3. Pending requests/matches
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const requests: BloodRequest[] = await reqRes.json();
        // Fetch matches for recent requests
        const allMatches: DonorMatch[] = [];
        for (const r of requests.slice(0, 5)) {
          const mRes = await fetch(`/api/requests/${r.id}/matches`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (mRes.ok) {
            const list: DonorMatch[] = await mRes.json();
            allMatches.push(...list);
          }
        }
        setMatches(allMatches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const toggleAvailability = async () => {
    if (!profile || !token) return;
    try {
      const res = await fetch('/api/donors/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !profile.isAvailable })
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const respondToMatch = async (matchId: string, action: 'ACCEPT' | 'DECLINE') => {
    if (!token) return;
    setRespondingId(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRespondingId(null);
    }
  };

  const handleScreeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/donors/screen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(screeningAnswers)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.donor);
        setShowScreening(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading donor dashboard...
      </div>
    );
  }

  // Filter matches belonging to this donor
  const myMatches = matches.filter(m => m.donorId === profile.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-600/30 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Verified Donor
            </span>
            <span className="text-xs text-slate-400">ID: {profile.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.fullName}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Blood Group: <strong className="text-rose-400 font-extrabold text-base">{profile.bloodGroup}</strong> • Location: {profile.city}
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAvailability}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition ${
              profile.isAvailable
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {profile.isAvailable ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
            <span>Status: {profile.isAvailable ? 'AVAILABLE TO DONATE' : 'OFFLINE / PAUSED'}</span>
          </button>

          <button
            onClick={() => setShowScreening(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            Update Screening
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block mb-1">Platform Eligibility</span>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-extrabold ${
              profile.platformEligibilityStatus === 'ELIGIBLE_BY_PLATFORM_RULES' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {profile.platformEligibilityStatus === 'ELIGIBLE_BY_PLATFORM_RULES' ? 'Active & Ready' : 'Deferral / Review'}
            </span>
            <ShieldCheck className="w-5 h-5 text-rose-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Next eligible date: {profile.nextEligibleDate || 'Available Now'}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block mb-1">Total Donations</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{profile.totalDonations}</span>
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            People potentially supported: ~{profile.totalDonations * 3}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block mb-1">Reliability Indicator</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">{profile.reliabilityScore}%</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Based on verified attendances
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block mb-1">Last Recorded Donation</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-200">
              {profile.lastDonationDate || 'None on record'}
            </span>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Interval tracker: 90-day safe window
          </span>
        </div>
      </div>

      {/* Emergency Requests Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-600/20 text-red-400 rounded-xl">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white">Emergency Request Inbox</h2>
              <p className="text-xs text-slate-400">Hospital requests matching your blood group & location</p>
            </div>
          </div>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-semibold">
            {myMatches.length} Active Alerts
          </span>
        </div>

        {myMatches.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <Heart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-xs">No active emergency alerts right now.</p>
            <p className="text-[11px] text-slate-500 mt-1">When hospitals near you trigger emergency matching, alerts appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myMatches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded">
                      {m.donorBloodGroup || profile.bloodGroup} Needed
                    </span>
                    <span className="text-xs text-slate-400">• Approx. {m.distanceKm} km away</span>
                    <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      Match Score: {m.matchScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{m.matchReason}</p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Notified at {new Date(m.notifiedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {m.status === 'NOTIFIED' ? (
                    <>
                      <button
                        onClick={() => respondToMatch(m.id, 'ACCEPT')}
                        disabled={respondingId === m.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => respondToMatch(m.id, 'DECLINE')}
                        disabled={respondingId === m.id}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl ${
                        m.status === 'ACCEPTED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : m.status === 'COORDINATION_STARTED'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                          : m.status === 'COMPLETED'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges & Achievements */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Milestone Badges & Recognition</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div key={b.id} className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <span className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-white">{b.badgeName}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{b.description}</p>
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Awarded {new Date(b.awardedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screening Modal */}
      {showScreening && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-2">Self-Eligibility Screening</h3>
            <p className="text-xs text-slate-400 mb-6">
              Update your health screening indicators for platform interval calculation.
            </p>

            <form onSubmit={handleScreeningSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={screeningAnswers.age}
                    onChange={(e) => setScreeningAnswers({ ...screeningAnswers, age: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={screeningAnswers.weightKg}
                    onChange={(e) => setScreeningAnswers({ ...screeningAnswers, weightKg: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screeningAnswers.hasRecentIllnessOrFever}
                    onChange={(e) => setScreeningAnswers({ ...screeningAnswers, hasRecentIllnessOrFever: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Recent illness, fever, or antibiotic treatment in past 7 days</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screeningAnswers.hasMajorSurgeryLast6Months}
                    onChange={(e) => setScreeningAnswers({ ...screeningAnswers, hasMajorSurgeryLast6Months: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Major dental or surgical procedure in past 6 months</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screeningAnswers.isOnRestrictedMedications}
                    onChange={(e) => setScreeningAnswers({ ...screeningAnswers, isOnRestrictedMedications: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>Currently taking prescription restricted medications</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScreening(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md"
                >
                  Save & Re-evaluate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
