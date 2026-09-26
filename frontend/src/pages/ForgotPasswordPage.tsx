import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles,
  UserPlus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export const ForgotPasswordPage: React.FC = () => {
  const location = useLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const prefillEmail = (location.state as { email?: string })?.email;
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [location.state]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      const data = response.data?.data;
      setReceivedCode(data?.recovery_code || null);
      setUserName(data?.user_name || null);
      if (data?.recovery_code) {
        setRecoveryCode(data.recovery_code); // Auto fill for convenience
      }
      setStep(2);
    } catch (err: any) {
      const resp = err.response?.data;
      setErrorCode(resp?.code || null);
      setError(resp?.message || 'Gagal meminta kode pemulihan. Pastikan email terdaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        code: recoveryCode,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setStep(3);
    } catch (err: any) {
      const resp = err.response?.data;
      setErrorCode(resp?.code || null);
      setError(resp?.message || 'Gagal memperbarui password. Periksa kode pemulihan Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (receivedCode) {
      navigator.clipboard.writeText(receivedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">RENSTORE</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === 3 ? 'Password Berhasil Diubah' : 'Pemulihan Password'}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Masukkan email terdaftar Anda untuk menerima kode verifikasi 6 digit'}
            {step === 2 && 'Masukkan kode pemulihan dan atur kata sandi baru untuk akun Anda'}
            {step === 3 && 'Akun Anda telah diamankan dengan password baru'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 font-semibold leading-relaxed">{error}</div>
            </div>

            {/* Quick Action when Email is Not Found */}
            {errorCode === 'EMAIL_NOT_FOUND' && (
              <div className="pt-2 border-t border-red-200/70 flex items-center justify-between gap-2">
                <span className="text-[11px] text-red-600 font-medium">Belum memiliki akun?</span>
                <Link
                  to="/register"
                  state={{ email }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-2xs transition-colors shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Daftar Akun Baru
                </Link>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Input Email */}
          {step === 1 && (
            <motion.form
              key="step1"
              onSubmit={handleRequestCode}
              className="space-y-4"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Kirim Kode Pemulihan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* STEP 2: Input Code and New Password */}
          {step === 2 && (
            <motion.form
              key="step2"
              onSubmit={handleResetPassword}
              className="space-y-4"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              {/* Simulated OTP Notification Banner */}
              {receivedCode && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Kode Pemulihan Akun {userName ? `(${userName})` : ''}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-800">
                      Berlaku 15 Menit
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-blue-200 rounded-xl px-3 py-2">
                    <span className="font-mono text-lg font-black tracking-widest text-blue-600">
                      {receivedCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kode Pemulihan 6 Digit</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="Contoh: 123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Password Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ulangi Password Baru</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Simpan Password Baru
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: Success State */}
          {step === 3 && (
            <motion.div
              key="step3"
              className="text-center py-4 space-y-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Kata Sandi Berhasil Diperbarui!</h3>
                <p className="text-xs text-slate-500">
                  Password akun <strong className="text-slate-700">{email}</strong> telah diubah. Silakan masuk menggunakan kata sandi baru Anda.
                </p>
              </div>

              <Link
                to="/login"
                state={{ email }}
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all"
              >
                Masuk Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Halaman Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
