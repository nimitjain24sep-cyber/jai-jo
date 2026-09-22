'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, Key, ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingMins, setRemainingMins] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, twoFactorCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        if (data.isLocked) {
          setIsLocked(true);
          setRemainingMins(data.remainingMinutes || 60);
        }
        return;
      }

      // Store in localStorage for client auth state
      localStorage.setItem('jjm_admin_user', JSON.stringify(data.user));
      localStorage.setItem('jjm_admin_token', data.token);

      router.push('/admin');
    } catch (err: any) {
      setError('Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center mx-auto text-white shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Admin Management Portal</h1>
          <p className="text-xs text-slate-400">
            Jai Jinendra Grocery Mart • Jaora, Madhya Pradesh
          </p>
        </div>

        {/* Security Policy Info */}
        <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-white text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Lock className="w-3.5 h-3.5" /> Protected Portal Access
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 font-medium leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            Security Policy: Maximum 5 failed attempts. Exceeding 5 attempts activates a 1-hour security lockout.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 leading-relaxed ${
              isLocked
                ? 'bg-red-950 border-red-500 text-red-200 font-bold'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span>{error}</span>
              {isLocked && remainingMins && (
                <p className="mt-1 text-red-300 font-mono text-[11px]">
                  Lockout active: ~{remainingMins} minute(s) remaining.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Email or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                disabled={isLocked}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500 transition disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                disabled={isLocked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-emerald-500 transition font-mono disabled:opacity-40"
              />
            </div>
          </div>

          {/* Optional 2FA Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShow2FA(!show2FA)}
              className="text-slate-400 hover:text-emerald-400 text-[11px] underline flex items-center gap-1"
            >
              <Key className="w-3 h-3" />
              <span>{show2FA ? 'Hide 2FA Code field' : 'Enter Two-Factor Auth (2FA) Code (Optional)'}</span>
            </button>

            {show2FA && (
              <div className="mt-2">
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 2FA code"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none font-mono text-xs focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-40"
          >
            <span>{isLocked ? 'Dashboard Locked (1 Hour)' : loading ? 'Authenticating...' : 'Sign in to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-xs">
            ← Return to Jaora Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
