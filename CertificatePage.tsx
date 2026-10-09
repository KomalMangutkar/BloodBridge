import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, ShieldCheck, Heart, Droplet, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Certificate } from '../types';

export const CertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await fetch(`/api/donations/certificate/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCert(data);
          // Trigger celebratory confetti effect
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading certificate details...</div>;
  }

  if (!cert) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Certificate record not found or verification ID invalid.</p>
        <Link to="/" className="text-rose-400 underline mt-4 inline-block">Return to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/donor" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Printable Digital Certificate Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
        {/* Watermark Motif */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Droplet className="w-96 h-96 text-rose-500 fill-current" />
        </div>

        <div className="inline-flex p-4 bg-gradient-to-tr from-amber-500 to-rose-600 rounded-3xl shadow-xl shadow-amber-500/20 text-white mb-6">
          <Award className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
          BloodBridge National Health Network
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Certificate of Lifesaving Blood Donation
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-8">
          This digital certificate formally certifies that a verified voluntary blood donation was successfully rendered.
        </p>

        <div className="border-t border-b border-slate-800 py-6 my-6 space-y-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Honouring Donor</span>
            <span className="text-2xl font-black text-white">{cert.donorName}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
            <div>
              <span className="text-[11px] text-slate-500 uppercase block">Blood Group</span>
              <span className="text-base font-extrabold text-rose-400">{cert.donorBloodGroup}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase block">Donation Date</span>
              <span className="text-base font-extrabold text-white">{cert.donationDate}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-slate-500 uppercase block">Receiving Institution</span>
            <span className="text-sm font-bold text-slate-200">{cert.institutionName}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Cryptographically Verified Record</span>
          </div>

          <div className="font-mono text-slate-500 text-[11px]">
            Code: {cert.verificationCode}
          </div>
        </div>
      </div>
    </div>
  );
};
