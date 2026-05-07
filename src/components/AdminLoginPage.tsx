import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoImage from '../assets/Logo (1).webp';

type Screen = 'login' | 'forgot' | 'reset';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  const [screen, setScreen] = useState<Screen>('login');

  // login fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);

  // forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent]   = useState(false);

  // reset password fields
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Detect Supabase PASSWORD_RECOVERY event (fires when user clicks reset link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setScreen('reset');
        setError('');
        setSuccess('');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) { setError(authErr.message); return; }

      const { data: profile, error: profileErr } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profileErr) {
        await supabase.auth.signOut();
        setError('Could not verify admin access. Please try again.');
        return;
      }

      if (!profile) {
        await supabase.auth.signOut();
        setError('Access denied. No admin privileges for this account.');
        return;
      }

      onLoginSuccess();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ──────────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const redirectTo = `${window.location.origin}${window.location.pathname}#admin`;

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo,
    });

    setLoading(false);
    if (resetErr) {
      setError(resetErr.message);
    } else {
      setForgotSent(true);
    }
  };

  // ── Reset password ───────────────────────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPwd.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSuccess('Password updated successfully. You can now sign in.');
      setScreen('login');
      setNewPwd('');
      setConfirmPwd('');
      await supabase.auth.signOut();
    }
  };

  // ── Shared styles ────────────────────────────────────────────────────────────
  const inputCls = [
    'w-full py-3 text-sm font-sans text-warm-cream rounded-lg transition-colors focus:outline-none',
    'placeholder:text-warm-cream/20',
  ].join(' ');
  const inputStyle = { background: 'rgba(255,251,247,0.05)', border: '1px solid rgba(255,251,247,0.08)' };

  const focusStyle  = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'rgba(160,45,35,0.55)');
  const blurStyle   = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.target.style.borderColor = 'rgba(255,251,247,0.08)');

  const labelCls = 'block font-ui text-[10px] tracking-[0.25em] uppercase text-warm-cream/40 mb-2';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0d0806 0%, #1a0d08 40%, #0a0505 100%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A02D23 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoImage} alt="SSP" className="w-16 h-16 mx-auto mb-4 object-contain drop-shadow-lg" />
          <h1 className="font-serif text-2xl text-warm-cream tracking-wide">Sri Siddheswari Peetham</h1>
          <p className="font-ui text-[10px] tracking-[0.35em] uppercase text-spiritual-gold mt-1">Admin Portal</p>
          <div className="h-px bg-gradient-to-r from-transparent via-sacred-red/40 to-transparent mt-4" />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{ background: 'rgba(20,12,8,0.88)', borderColor: 'rgba(160,45,35,0.2)', backdropFilter: 'blur(20px)' }}
        >
          <AnimatePresence mode="wait">

            {/* ── LOGIN SCREEN ── */}
            {screen === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-2 mb-6">
                  <Shield size={15} className="text-sacred-red" />
                  <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-warm-cream/50">Secure Login</span>
                </div>

                {/* Success banner (after password reset) */}
                {success && (
                  <div className="flex items-start gap-2 rounded-lg px-4 py-3 mb-5" style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)' }}>
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-emerald-400 text-xs leading-relaxed">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-lg px-4 py-3 mb-5" style={{ background: 'rgba(180,30,20,0.15)', border: '1px solid rgba(180,30,20,0.3)' }}>
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className={labelCls}>Email</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="admin@srisiddheshwaripeetham.com"
                        className={`${inputCls} pl-9 pr-4`} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                      <input
                        type={showPwd ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                        className={`${inputCls} pl-9 pr-10`} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-cream/25 hover:text-warm-cream/50 transition-colors">
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full py-3 rounded-lg font-ui text-xs tracking-[0.25em] uppercase text-warm-cream transition-all flex items-center justify-center gap-2"
                    style={{ background: loading ? 'rgba(160,45,35,0.5)' : '#A02D23' }}
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                    {loading ? 'Signing In…' : 'Sign In'}
                  </button>

                  {/* Forgot password link */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setScreen('forgot'); setError(''); setSuccess(''); setForgotEmail(email); setForgotSent(false); }}
                      className="font-ui text-[10px] tracking-widest uppercase text-warm-cream/30 hover:text-spiritual-gold transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD SCREEN ── */}
            {screen === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <button
                  onClick={() => { setScreen('login'); setError(''); setForgotSent(false); }}
                  className="flex items-center gap-1.5 font-ui text-[10px] tracking-widest uppercase text-warm-cream/30 hover:text-warm-cream/60 transition-colors mb-6"
                >
                  <ArrowLeft size={12} /> Back to Login
                </button>

                <div className="flex items-center gap-2 mb-6">
                  <Mail size={15} className="text-sacred-red" />
                  <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-warm-cream/50">Reset Password</span>
                </div>

                {!forgotSent ? (
                  <>
                    <p className="font-sans text-xs text-warm-cream/40 leading-relaxed mb-6">
                      Enter your admin email address and we'll send you a link to reset your password.
                    </p>

                    {error && (
                      <div className="flex items-start gap-2 rounded-lg px-4 py-3 mb-5" style={{ background: 'rgba(180,30,20,0.15)', border: '1px solid rgba(180,30,20,0.3)' }}>
                        <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-400 text-xs">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleForgot} className="space-y-5">
                      <div>
                        <label className={labelCls}>Email Address</label>
                        <div className="relative">
                          <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                          <input
                            type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                            placeholder="your@email.com"
                            className={`${inputCls} pl-9 pr-4`} style={inputStyle}
                            onFocus={focusStyle} onBlur={blurStyle}
                          />
                        </div>
                      </div>

                      <button
                        type="submit" disabled={loading}
                        className="w-full py-3 rounded-lg font-ui text-xs tracking-[0.25em] uppercase text-warm-cream flex items-center justify-center gap-2 transition-all"
                        style={{ background: loading ? 'rgba(160,45,35,0.5)' : '#A02D23' }}
                      >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                        {loading ? 'Sending…' : 'Send Reset Link'}
                      </button>
                    </form>
                  </>
                ) : (
                  /* Success state */
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                    <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.25)' }}>
                      <CheckCircle2 size={24} className="text-emerald-400" />
                    </div>
                    <h3 className="font-serif text-warm-cream text-lg mb-2">Check your email</h3>
                    <p className="font-sans text-xs text-warm-cream/40 leading-relaxed mb-1">
                      A password reset link has been sent to
                    </p>
                    <p className="font-ui text-xs text-spiritual-gold mb-6">{forgotEmail}</p>
                    <p className="font-sans text-[10px] text-warm-cream/25 leading-relaxed">
                      Click the link in the email to set a new password. The link expires in 1 hour.
                    </p>
                    <button
                      onClick={() => { setScreen('login'); setForgotSent(false); setError(''); }}
                      className="mt-6 font-ui text-[10px] tracking-widest uppercase text-warm-cream/30 hover:text-warm-cream/60 transition-colors"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── RESET PASSWORD SCREEN ── */}
            {screen === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={15} className="text-sacred-red" />
                  <span className="font-ui text-[10px] tracking-[0.3em] uppercase text-warm-cream/50">Set New Password</span>
                </div>
                <p className="font-sans text-xs text-warm-cream/35 leading-relaxed mb-6">
                  Choose a strong new password for your admin account.
                </p>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg px-4 py-3 mb-5" style={{ background: 'rgba(180,30,20,0.15)', border: '1px solid rgba(180,30,20,0.3)' }}>
                    <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <form onSubmit={handleReset} className="space-y-5">
                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                      <input
                        type={showNew ? 'text' : 'password'} value={newPwd}
                        onChange={e => setNewPwd(e.target.value)} required minLength={6}
                        placeholder="Minimum 6 characters"
                        className={`${inputCls} pl-9 pr-10`} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-cream/25 hover:text-warm-cream/50 transition-colors">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {newPwd.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1,2,3,4].map(i => {
                          const strength = Math.min(
                            (newPwd.length >= 6 ? 1 : 0) +
                            (/[A-Z]/.test(newPwd) ? 1 : 0) +
                            (/[0-9]/.test(newPwd) ? 1 : 0) +
                            (/[^A-Za-z0-9]/.test(newPwd) ? 1 : 0),
                            4
                          );
                          const colors = ['#dc2626','#d97706','#2563eb','#059669'];
                          return (
                            <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-300"
                              style={{ background: i <= strength ? colors[strength - 1] : 'rgba(255,251,247,0.1)' }} />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelCls}>Confirm Password</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-cream/25" />
                      <input
                        type={showConfirm ? 'text' : 'password'} value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)} required
                        placeholder="Re-enter password"
                        className={`${inputCls} pl-9 pr-10`} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-cream/25 hover:text-warm-cream/50 transition-colors">
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirmPwd.length > 0 && newPwd !== confirmPwd && (
                      <p className="mt-1.5 font-ui text-[10px] text-red-400">Passwords do not match</p>
                    )}
                    {confirmPwd.length > 0 && newPwd === confirmPwd && (
                      <p className="mt-1.5 font-ui text-[10px] text-emerald-400">Passwords match</p>
                    )}
                  </div>

                  <button
                    type="submit" disabled={loading || newPwd !== confirmPwd || newPwd.length < 6}
                    className="w-full py-3 rounded-lg font-ui text-xs tracking-[0.25em] uppercase text-warm-cream flex items-center justify-center gap-2 transition-all"
                    style={{ background: loading ? 'rgba(160,45,35,0.5)' : '#A02D23' }}
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    {loading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="text-center font-ui text-[9px] tracking-[0.3em] uppercase text-warm-cream/15 mt-5">
          Restricted Access · Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
}
