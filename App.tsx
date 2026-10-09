import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { AIAssistant } from './components/AIAssistant';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InventoryPage } from './pages/InventoryPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { BloodBankDashboard } from './pages/BloodBankDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CertificatePage } from './pages/CertificatePage';
import DonorMap from "./components/DonorMap";

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route
  path="/donor-map"
  element={
    <ProtectedRoute allowedRoles={["HOSPITAL", "ADMIN"]}>
      <DonorMap />
    </ProtectedRoute>
  }
/>
                <Route path="/certificates/:id" element={<CertificatePage />} />

                {/* Role Protected Dashboards */}
                <Route 
                  path="/donor" 
                  element={
                    <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/hospital" 
                  element={
                    <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                      <HospitalDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/blood-bank" 
                  element={
                    <ProtectedRoute allowedRoles={['BLOOD_BANK', 'ADMIN']}>
                      <BloodBankDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>

            {/* Global Floating AI Health Assistant */}
            <AIAssistant />

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
              <p>© 2026 BloodBridge — AI-Powered Real-Time Blood Donor Matching Platform.</p>
              <p className="mt-1 text-[11px] text-slate-600">Built for CODEASTRA Hackathon • All seed & demo data simulated for presentation.</p>
            </footer>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
