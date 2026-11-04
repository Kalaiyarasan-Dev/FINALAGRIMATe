import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, Sprout, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

const SignIn: React.FC = () => {
  const { isTamil, t } = useLanguage();
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // If already logged in, redirect to dashboard or redirect destination
  useEffect(() => {
    if (!authLoading && user) {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error(t('valIdentifierRequired'));
      return;
    }

    if (!password) {
      toast.error(t('valPasswordRequired'));
      return;
    }

    setLoading(true);
    const { error } = await login(identifier.trim(), password, rememberMe);
    setLoading(false);

    if (error) {
      toast.error(t('loginError'));
      return;
    }

    toast.success(t('loginSuccess'));
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect') || '/';
    navigate(redirect, { replace: true });
  };

  const handleFillDemo = () => {
    setIdentifier('9876543210');
    setPassword('Farmer@123');
    toast.info(isTamil ? 'மாதிரி விவரங்கள் நிரப்பப்பட்டன' : 'Demo credentials applied');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative safe-top safe-bottom">
      {/* Top Bar: Back to Home & Prominent Bilingual Language Switcher */}
      <div className="w-full max-w-md flex items-center justify-between mb-2 px-1">
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

      <div className="w-full max-w-md space-y-5 animate-fade-in">
        {/* Header Section */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="mx-auto w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-primary mb-3">
            <Sprout className="w-7 h-7 text-primary-foreground" />
          </div>

          {/* Welcome to Agrimate / Agrimate-க்கு உங்களை வரவேற்கிறோம் */}
          <h1 className={cn('text-2xl sm:text-3xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
            {t('welcomeToAgrimate')}
          </h1>

          {/* Login to Your Account / உங்கள் கணக்கில் உள்நுழையவும் */}
          <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
            {t('loginToAccount')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-card relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address / Mobile Number */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                {t('emailOrMobile')}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder={t('emailOrMobilePlaceholder')}
                  className="pl-9 text-sm rounded-xl"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password with Show / Hide Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={cn('text-xs font-semibold text-foreground', isTamil && 'font-tamil')}>
                  {t('password')}
                </Label>
                {/* Forgot Password? / கடவுச்சொல்லை மறந்துவிட்டீர்களா? */}
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className={cn(
                    'text-xs text-primary font-medium hover:underline touch-feedback',
                    isTamil && 'font-tamil'
                  )}
                >
                  {t('forgotPassword')}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  className="pl-9 pr-10 text-sm rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            {/* Remember Me / என்னை நினைவில் வைத்திருக்கவும் */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                />
                <Label
                  htmlFor="rememberMe"
                  className={cn('text-xs font-medium text-muted-foreground cursor-pointer select-none', isTamil && 'font-tamil')}
                >
                  {t('rememberMe')}
                </Label>
              </div>

              {/* Quick Demo Credentials Helper */}
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-muted-foreground/80 hover:text-primary flex items-center gap-1 transition-colors"
                title="Fill demo credentials"
              >
                <Sparkles className="w-3 h-3 text-harvest" />
                <span className={isTamil ? 'font-tamil' : ''}>{t('fillDemoCredentials')}</span>
              </button>
            </div>

            {/* Login Button / உள்நுழைக */}
            <Button
              type="submit"
              className="w-full rounded-xl py-2.5 font-semibold text-sm shadow-primary hover:opacity-95 transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className={cn(isTamil && 'font-tamil')}>{t('loggingIn')}</span>
                </>
              ) : (
                <>
                  <span className={cn(isTamil && 'font-tamil')}>{t('login')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo account banner hint */}
          <div className="mt-4 pt-3 border-t border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/80">
                {isTamil ? 'மாதிரி கணக்கு: ' : 'Demo Account: '}
              </span>
              <span className="font-mono text-primary font-medium">9876543210</span> / <span className="font-mono text-primary font-medium">Farmer@123</span>
            </p>
          </div>
        </div>

        {/* Footer: Don't have an account? Sign Up / கணக்கு இல்லையா? பதிவு செய்யவும் */}
        <div className="text-center">
          <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
            {t('dontHaveAccount')}{' '}
            <Link
              to="/signup"
              className={cn(
                'text-primary font-semibold hover:underline inline-flex items-center gap-0.5',
                isTamil && 'font-tamil'
              )}
            >
              {t('signUp')}
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotModalOpen}
        onOpenChange={setForgotModalOpen}
        initialIdentifier={identifier}
      />
    </div>
  );
};

export default SignIn;
