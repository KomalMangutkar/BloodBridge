import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Package, 
  Send, 
  Truck, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle, 
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BloodInventory, IntercityTransfer } from '../types';

export const BloodBankDashboard: React.FC = () => {
  const { user, profile, token } = useAuth();
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [transfers, setTransfers] = useState<IntercityTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<BloodInventory | null>(null);
  const [newUnits, setNewUnits] = useState<number>(0);

  // New Intercity Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    bloodGroup: 'O-',
    units: 2,
    sourceBloodBankId: profile?.id || 'bb-1'
  });

  const fetchData = async () => {
    try {
      const invRes = await fetch('/api/inventory');
      if (invRes.ok) {
        const all: BloodInventory[] = await invRes.json();
        // If blood bank profile is known, filter or show all
        setInventory(all);
      }

      const trRes = await fetch('/api/transfers');
      if (trRes.ok) {
        setTransfers(await trRes.json());
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

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !token) return;
    try {
      const res = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ unitsAvailable: newUnits })
      });
      if (res.ok) {
        setEditingItem(null);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sourceBloodBankId: profile?.id || 'bb-1',
          bloodGroup: transferForm.bloodGroup,
          units: transferForm.units
        })
      });
      if (res.ok) {
        setShowTransferModal(false);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdvanceTransfer = async (transferId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatuses: Record<string, string> = {
      REQUESTED: 'APPROVED',
      APPROVED: 'PREPARING',
      PREPARING: 'DISPATCHED',
      DISPATCHED: 'IN_TRANSIT',
      IN_TRANSIT: 'DELIVERED',
      DELIVERED: 'COMPLETED'
    };
    const nextStatus = nextStatuses[currentStatus];
    if (!nextStatus) return;

    try {
      const res = await fetch(`/api/transfers/${transferId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-rose-600/30 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Verified Depository & Transfusion Bank
            </span>
            <span className="text-xs text-slate-400">ID: {profile?.registrationNumber || 'BB-REDCROSS-01'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{profile?.name || 'Blood Bank Center'}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Maintain blood unit thresholds, review intercity dispatch logistics, and update real-time stock levels.
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition transform hover:scale-105"
        >
          <Truck className="w-4 h-4" />
          <span>New Intercity Transfer Dispatch</span>
        </button>
      </div>

      {/* Stock Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-rose-400" />
              <span>Blood Group Stock Levels</span>
            </h3>
            <p className="text-xs text-slate-400">Click any row to adjust available unit count</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {inventory.slice(0, 8).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setEditingItem(item);
                setNewUnits(item.unitsAvailable);
              }}
              className="bg-slate-850 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-4 text-center cursor-pointer transition group"
            >
              <span className="text-xs font-black text-rose-400 block mb-1">{item.bloodGroup}</span>
              <span className="text-2xl font-black text-white group-hover:text-rose-400 transition">
                {item.unitsAvailable}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">units available</span>
            </div>
          ))}
        </div>
      </div>

      {/* Intercity Transfers Lifecycle Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400" />
          <span>Intercity Logistics & Transfer Lifecycle</span>
        </h3>
        <p className="text-xs text-slate-400">
          Deterministic tracked transit statuses: REQUESTED → APPROVED → PREPARING → DISPATCHED → IN_TRANSIT → DELIVERED → COMPLETED
        </p>

        {transfers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No intercity transfer requests recorded.
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((tr) => (
              <div
                key={tr.id}
                className="bg-slate-850 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white bg-rose-600 px-2 py-0.5 rounded">
                      {tr.units} Units of {tr.bloodGroup}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• Tracking: {tr.trackingNumber}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    From: <strong className="text-white">{tr.sourceBloodBankName}</strong> ({tr.sourceCity}) → To: <strong className="text-white">{tr.destinationHospitalName}</strong> ({tr.destinationCity})
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Distance: ~{tr.distanceKm} km • Est. Transit: {tr.estimatedTransitMinutes} mins (Simulated Logistics)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                    {tr.status}
                  </span>

                  {tr.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleAdvanceTransfer(tr.id, tr.status)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1"
                    >
                      <span>Advance Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Inventory Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-2">
              Update Stock for {editingItem.bloodGroup}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Adjust currently verified physical units in the depository.
            </p>

            <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Available Units</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={newUnits}
                  onChange={(e) => setNewUnits(Number(e.target.value))}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 font-bold text-base"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intercity Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-2">Initiate Intercity Blood Transfer</h3>
            <p className="text-xs text-slate-400 mb-6">
              Dispatch units from this blood bank to a verified hospital in another city.
            </p>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                  <select
                    value={transferForm.bloodGroup}
                    onChange={(e) => setTransferForm({ ...transferForm, bloodGroup: e.target.value })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Units</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={transferForm.units}
                    onChange={(e) => setTransferForm({ ...transferForm, units: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-bold shadow-md"
                >
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
