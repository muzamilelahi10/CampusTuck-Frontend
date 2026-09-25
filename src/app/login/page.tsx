'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-28 md:pb-16">
      {/* 2-Column Split Card on Desktop & Stacked on Mobile (Figma 17-Mobile & 07-Desktop) */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-line/70 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 items-stretch">
        {/* Left Side (Desktop) / Top Banner (Mobile): Dark Green Hero Panel */}
        <div className="md:col-span-5 bg-[#16251F] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden min-h-[220px] sm:min-h-[460px]">
          {/* Subtle Organic Background Circles */}
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#244E3B] opacity-50 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#F8A882] opacity-80 blur-xl pointer-events-none" />

          {/* Top Tag & Header */}
          <div className="relative z-10 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full border border-white/20 text-[10px] font-extrabold uppercase tracking-widest text-[#D5E3D8]">
              Welcome back
            </span>

            <h2 className="text-2xl sm:text-3xl font-[800] tracking-tight leading-tight">
              <span className="hidden sm:inline">The good stuff is closer now.</span>
              <span className="inline sm:hidden">
                A little less waiting.
                <br />
                A lot more campus.
              </span>
            </h2>

            <p className="text-xs text-[#A2B5A8] hidden sm:block">
              Snacks, study supplies, and daily essentials ready when you need them.
            </p>
          </div>

          {/* Desktop Floating Graphics in Panel */}
          <div className="hidden sm:flex items-center justify-center py-6 relative z-10">
            <div className="relative w-48 h-36">
              <Image
                src="/design/hero-art.svg"
                alt="Campus essentials artwork"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Bottom Community Pill */}
          <div className="relative z-10 pt-4 border-t border-white/10 hidden sm:block">
            <p className="text-[11px] text-[#A2B5A8]">Made for the COMSATS community</p>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-2xl font-[800] text-ink tracking-tight">Sign in to CampusTuck</h1>
            <p className="text-xs text-muted mt-1">Track orders, save details, and shop faster.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-[16px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                Campus Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@lhr.comsats.edu.pk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink placeholder:text-muted/60 focus:outline-none focus:border-leaf"
                />
                <Mail size={15} className="text-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-canvas-soft border border-line text-xs font-semibold text-ink placeholder:text-muted/60 focus:outline-none focus:border-leaf"
                />
                <Lock size={15} className="text-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-lime hover:bg-[#cfe569] text-ink font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign in'}</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </form>

          {/* Alternate Link */}
          <div className="text-center pt-2 border-t border-line/60">
            <p className="text-xs text-muted">
              New here?{' '}
              <Link
                href={`/register?redirect=${redirectPath}`}
                className="font-bold text-ink hover:text-leaf transition-colors underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="sm:hidden text-center pt-1">
            <span className="inline-block px-3 py-1 rounded-full bg-canvas-soft text-[10px] text-muted font-semibold">
              Made for the COMSATS community
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-12 text-center text-xs text-muted">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
