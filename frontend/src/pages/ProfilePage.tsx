import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Camera, 
  Trash2, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Calendar, 
  Globe, 
  Coins, 
  Package, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import AnimatedPage from '../components/AnimatedPage';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const { language, currency, setLanguage, setCurrency, t } = useLocale();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  
  // Password states
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage(language === 'en' ? 'Image size must be less than 2MB.' : 'Ukuran foto maksimal 2MB.');
        return;
      }
      setAvatarFile(file);
      setRemoveAvatar(false);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validate password confirmation
    if (password && password !== passwordConfirmation) {
      setErrorMessage(language === 'en' ? 'Password confirmation does not match.' : 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password && password.length < 8) {
      setErrorMessage(language === 'en' ? 'Password must be at least 8 characters.' : 'Kata sandi minimal 8 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (phone) formData.append('phone', phone);
      if (address) formData.append('address', address);
      if (password) {
        formData.append('password', password);
        formData.append('password_confirmation', passwordConfirmation);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (removeAvatar) {
        formData.append('avatar', '');
      }

      await updateProfile(formData);
      setSuccessMessage(t('profile_updated'));
      setPassword('');
      setPasswordConfirmation('');
      setAvatarFile(null);
      setRemoveAvatar(false);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || (language === 'en' ? 'Failed to update profile. Please check your data.' : 'Gagal memperbarui profil. Periksa kembali data Anda.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedJoinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header Title */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <UserIcon className="w-7 h-7 text-blue-600" />
                {t('profile_title')}
              </h1>
            </div>

            {/* Quick Status / Role Pill */}
            <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{user?.role === 'admin' ? t('role_admin') : t('role_customer')}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Account Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Photo Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 text-center space-y-5 shadow-xs">
              <div className="relative inline-block mx-auto">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-slate-900/10 bg-blue-600 flex items-center justify-center text-white text-4xl font-black mx-auto relative group">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt={user?.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300';
                      }}
                    />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}

                  {/* Hover Overlay trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>

                {/* Quick Edit Camera Badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 transition-all"
                  title={t('upload_photo')}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-900 truncate">{user?.name}</h2>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="pt-2 text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('member_since')} {formattedJoinDate}</span>
                </div>
              </div>

              {/* Avatar Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  {t('upload_photo')}
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="w-full py-2 px-3 rounded-xl hover:bg-red-50 text-red-600 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('remove_photo')}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Menu Cepat</h3>
              <div className="space-y-1">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-blue-600 text-xs font-bold transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      {t('admin_dashboard')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                <Link
                  to="/orders"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    {t('orders_history')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Personal Information */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{t('personal_info')}</h3>
                  <p className="text-[11px] text-slate-500">Perbarui identitas dan kontak akun Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">{t('full_name')}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('phone_number')}</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('shipping_address')}</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={language === 'en' ? 'Street name, house number, district, city, postal code...' : 'Nama jalan, nomor rumah, RT/RW, kecamatan, kota, kode pos...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Account Security (Password) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{t('security_settings')}</h3>
                  <p className="text-[11px] text-slate-500">{t('password_hint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('new_password')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('confirm_password')}</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Preferences (Language & Currency) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Preferensi Bahasa &amp; Mata Uang</h3>
                  <p className="text-[11px] text-slate-500">Sesuaikan bahasa antarmuka dan konversi harga belanja</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language Switcher */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Bahasa / Language
                  </span>
                  <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setLanguage('id')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'id' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Bahasa Indonesia
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Currency Switcher */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    Mata Uang / Currency
                  </span>
                  <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCurrency('IDR')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currency === 'IDR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      IDR (Rupiah)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currency === 'USD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      USD (Dollar)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t('save_changes')}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AnimatedPage>
  );
};

export default ProfilePage;
