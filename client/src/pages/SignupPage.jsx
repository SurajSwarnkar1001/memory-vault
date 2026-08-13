import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, Calendar, Mic, Sparkles } from 'lucide-react';

export default function SignupPage({ onNavigate }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);

    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      onNavigate('#/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-light select-none">

      {/* Left side: Premium Animated Showcase Panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-slate-950 via-[#062412] to-accent p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Pulsing blurred background elements */}
        <div className="absolute top-[-10%] right-[-10%] h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse duration-4000" />
        <div className="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse duration-6000" />

        {/* Header */}
        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <div className="h-6 w-6 rounded bg-white/10 flex items-center justify-center text-white font-black text-xs border border-white/20">
            I
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">memory vault</span>
        </div>

        {/* Feature List */}
        <div className="max-w-md my-auto space-y-8 relative z-10">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold text-accent-light bg-accent-light/10 uppercase tracking-widest border border-accent-light/20">
              <Sparkles className="h-3 w-3" />
              <span>Workspace Organizer</span>
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              One vault for all your project assets
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stop scattering notes, link bookmarks, voice memos, and images across multiple platforms. Track everything date-wise in customized project timelines.
            </p>
          </div>

          {/* Features cards with soft micro-animations */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:translate-x-1.5">
              <div className="h-8 w-8 rounded-lg bg-accent-light/10 border border-accent-light/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-accent-light" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Secure R2 Object Storage</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Presigned PUT/GET URLs keep your corporate documents privately encrypted.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:translate-x-1.5">
              <div className="h-8 w-8 rounded-lg bg-accent-light/10 border border-accent-light/10 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-accent-light" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Chronological Journal Timeline</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Navigate your project logs date-wise under "Today", "Yesterday", and clean headers.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 hover:translate-x-1.5">
              <div className="h-8 w-8 rounded-lg bg-accent-light/10 border border-accent-light/10 flex items-center justify-center shrink-0">
                <Mic className="h-4 w-4 text-accent-light" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">In-Browser Voice & Media</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Record audio notes or upload sound files directly inside the browser editor.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[9px] text-white/40 relative z-10 shrink-0">
          © {new Date().getFullYear()} memory vault. All rights reserved.
        </div>
      </div>

      {/* Right side: Form (Takes full-width on mobile, 40% on desktop) */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-[#ffffff]">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo Branding */}
          <div className="text-center md:text-left mb-8">
            <div className="flex justify-center md:justify-start">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white font-black text-lg shadow-xs">
                I
              </div>
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
              Create Vault Account
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Register to set up a private, secure workspace.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-xs font-semibold text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-950 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition duration-150"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Corporate Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-955 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition duration-150"
                placeholder="you@izzkitechsolution.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-955 placeholder-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition duration-150"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-1.5 rounded-lg border border-transparent bg-accent px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-accent-dark focus:outline-none disabled:opacity-50 transition duration-150 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 border-t border-slate-100 pt-4 text-center md:text-left">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('#/login')}
                className="font-semibold text-accent hover:text-accent-dark transition duration-150 cursor-pointer"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
