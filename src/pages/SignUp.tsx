import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Home,
  Sprout,
  Languages,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { tamilNaduDistricts } from '@/lib/i18n';

// Crop options with bilingual names
const MAIN_CROPS = [
  { value: 'Paddy', en: 'Paddy / Rice', ta: 'நெல்' },
  { value: 'Cotton', en: 'Cotton', ta: 'பருத்தி' },
  { value: 'Tomato', en: 'Tomato', ta: 'தக்காளி' },
  { value: 'Sugarcane', en: 'Sugarcane', ta: 'கரும்பு' },
  { value: 'Banana', en: 'Banana', ta: 'வாழை' },
  { value: 'Groundnut', en: 'Groundnut', ta: 'நிலக்கடலை' },
  { value: 'Maize', en: 'Maize / Corn', ta: 'மக்காச்சோளம்' },
  { value: 'Turmeric', en: 'Turmeric', ta: 'மஞ்சள்' },
  { value: 'Chilli', en: 'Chilli', ta: 'மிளகாய்' },
  { value: 'Pulses', en: 'Pulses / Lentils', ta: 'பயறு வகைகள்' },
  { value: 'Coconut', en: 'Coconut', ta: 'தேங்காய்' },
  { value: 'Ragi', en: 'Finger Millet (Ragi)', ta: 'ராகி' },
];

const STATES = [
  { value: 'Tamil Nadu', en: 'Tamil Nadu', ta: 'தமிழ்நாடு' },
  { value: 'Puducherry', en: 'Puducherry', ta: 'புதுச்சேரி' },
  { value: 'Kerala', en: 'Kerala', ta: 'கேரளா' },
  { value: 'Karnataka', en: 'Karnataka', ta: 'கர்நாடகா' },
  { value: 'Andhra Pradesh', en: 'Andhra Pradesh', ta: 'ஆந்திரப் பிரதேசம்' },
];

const SignUp: React.FC = () => {
  const { language, setLanguage, isTamil, t } = useLanguage();
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: 'Tamil Nadu',
    district: 'Thanjavur',
    village: '',
    mainCrop: 'Paddy',
    preferredLanguage: language as 'ta' | 'en',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync formData.preferredLanguage when language context changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, preferredLanguage: language }));
  }, [language]);

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (lang: 'en' | 'ta') => {
    setFormData((prev) => ({ ...prev, preferredLanguage: lang }));
    setLanguage(lang);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('valNameRequired'));
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error(t('valMobileInvalid'));
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error(t('valPasswordMin'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('valPasswordMismatch'));
      return;
    }

    if (!formData.district) {
      toast.error(t('valDistrictRequired'));
      return;
    }

    if (!formData.mainCrop) {
      toast.error(t('valCropRequired'));
      return;
    }

    setLoading(true);
    const { error } = await register({
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim() || undefined,
      password: formData.password,
      state: formData.state,
      district: formData.district,
      village: formData.village.trim(),
      mainCrop: formData.mainCrop,
      preferredLanguage: formData.preferredLanguage,
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.message.includes('already exists')
          ? t('userExists')
          : error.message
      );
      return;
    }

    toast.success(t('signupSuccess'));
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect') || '/';
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-8 relative safe-top safe-bottom">
      {/* Top Bar: Back Button & Language Switcher */}
      <div className="w-full max-w-xl flex items-center justify-between mb-2 px-1">
        <Link
          to="/"
          className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors touch-feedback"
          title="Home"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
        </Link>

        {/* Visible Language Switcher: English | தமிழ் */}
        <LanguageSwitcher variant="segmented" size="md" />
      </div>

      <div className="w-full max-w-xl space-y-5 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="mx-auto w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary mb-3">
            <Sprout className="w-7 h-7 text-primary-foreground" />
          </div>

          {/* Create Account / கணக்கை உருவாக்கவும் */}
          <h1 className={cn('text-2xl sm:text-3xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
            {t('createAccount')}
          </h1>

          <p className={cn('text-xs sm:text-sm text-muted-foreground max-w-md mx-auto', isTamil && 'font-tamil')}>
            {t('registerSubtitle')}
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-card">
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* 1. Full Name / முழுப் பெயர் */}
            <div className="space-y-1.5">
              <Label htmlFor="signup-name" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                {t('fullName')} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder={t('fullNamePlaceholder')}
                  className="pl-9 text-sm rounded-xl"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Two Column Grid for Mobile & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 2. Mobile Number / கைபேசி எண் */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-phone" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('mobileNumber')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    className="pl-9 text-sm rounded-xl font-mono"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              {/* 3. Email Address / மின்னஞ்சல் முகவரி */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('emailAddress')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="pl-9 text-sm rounded-xl"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Two Column Grid for Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 4. Password / கடவுச்சொல் */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('password')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    minLength={6}
                    className="pl-9 pr-9 text-sm rounded-xl"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    title={t('showHidePassword')}
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password / கடவுச்சொல்லை உறுதிப்படுத்தவும் */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-confirm-password" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('confirmPassword')} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('confirmPasswordPlaceholder')}
                    minLength={6}
                    className="pl-9 text-sm rounded-xl"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Geographical Details: State, District, Village */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* 6. State / மாநிலம் */}
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('state')}
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(val) => handleInputChange('state', val)}
                >
                  <SelectTrigger className="w-full text-xs rounded-xl">
                    <SelectValue placeholder={t('state')} />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value} className={isTamil ? 'font-tamil' : ''}>
                        {isTamil ? s.ta : s.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 7. District / மாவட்டம் */}
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('district')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.district}
                  onValueChange={(val) => handleInputChange('district', val)}
                >
                  <SelectTrigger className="w-full text-xs rounded-xl">
                    <SelectValue placeholder={t('selectDistrict')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {tamilNaduDistricts.map((d) => (
                      <SelectItem key={d.en} value={d.en} className={isTamil ? 'font-tamil' : ''}>
                        {isTamil ? d.ta : d.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 8. Village / கிராமம் */}
              <div className="space-y-1.5">
                <Label htmlFor="signup-village" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('village')}
                </Label>
                <div className="relative">
                  <Home className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="signup-village"
                    type="text"
                    placeholder={t('villagePlaceholder')}
                    className="pl-8 text-xs rounded-xl"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 9. Main Crop & 10. Preferred Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Main Crop / முக்கியப் பயிர் */}
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('mainCrop')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.mainCrop}
                  onValueChange={(val) => handleInputChange('mainCrop', val)}
                >
                  <SelectTrigger className="w-full text-xs rounded-xl">
                    <SelectValue placeholder={t('mainCrop')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {MAIN_CROPS.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value} className={isTamil ? 'font-tamil' : ''}>
                        {isTamil ? crop.ta : crop.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Language / விருப்பமான மொழி */}
              <div className="space-y-1.5">
                <Label className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('preferredLanguage')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(val: 'en' | 'ta') => handleLanguageChange(val)}
                >
                  <SelectTrigger className="w-full text-xs rounded-xl">
                    <SelectValue placeholder={t('preferredLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ta" className="font-tamil font-medium">
                      தமிழ் (Tamil)
                    </SelectItem>
                    <SelectItem value="en" className="font-medium">
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 11. Create Account / கணக்கை உருவாக்கவும் Button */}
            <Button
              type="submit"
              className="w-full rounded-xl py-2.5 font-semibold text-sm shadow-primary hover:opacity-95 transition-all mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className={cn(isTamil && 'font-tamil')}>{t('creatingAccount')}</span>
                </>
              ) : (
                <>
                  <span className={cn(isTamil && 'font-tamil')}>{t('createAccount')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer: Already have an account? Login / ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும் */}
        <div className="text-center">
          <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/signin"
              className={cn(
                'text-primary font-semibold hover:underline inline-flex items-center gap-0.5',
                isTamil && 'font-tamil'
              )}
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
