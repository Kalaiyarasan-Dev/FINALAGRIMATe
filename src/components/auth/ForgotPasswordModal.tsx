import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, KeyRound, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onOpenChange,
  initialIdentifier = '',
}) => {
  const { isTamil, t } = useLanguage();
  const { resetPassword } = useAuth();

  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync initial identifier when dialog opens
  React.useEffect(() => {
    if (open) {
      setIdentifier(initialIdentifier);
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(false);
    }
  }, [open, initialIdentifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error(t('valIdentifierRequired'));
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error(t('valPasswordMin'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('valPasswordMismatch'));
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(identifier.trim(), newPassword);
    setLoading(false);

    if (error) {
      toast.error(
        isTamil
          ? 'இந்த கைபேசி எண் அல்லது மின்னஞ்சலில் எந்தக் கணக்கும் கிடைக்கவில்லை'
          : error.message || 'Failed to reset password. Please check your details.'
      );
      return;
    }

    setSuccess(true);
    toast.success(t('passwordResetSuccess'));
    setTimeout(() => {
      onOpenChange(false);
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-6 rounded-2xl shadow-card">
        <DialogHeader className="space-y-2 text-left">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <DialogTitle className={cn('text-xl font-bold font-heading text-foreground', isTamil && 'font-tamil')}>
            {t('resetPasswordTitle')}
          </DialogTitle>
          <DialogDescription className={cn('text-xs text-muted-foreground', isTamil && 'font-tamil')}>
            {t('resetPasswordSubtitle')}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
            <p className={cn('text-sm font-semibold text-foreground', isTamil && 'font-tamil')}>
              {t('passwordResetSuccess')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Identifier */}
            <div className="space-y-1.5">
              <Label htmlFor="reset-identifier" className={cn('text-xs font-semibold', isTamil && 'font-tamil')}>
                {t('emailOrMobile')}
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-identifier"
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

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reset-new-password" className={cn('text-xs font-semibold', isTamil && 'font-tamil')}>
                {t('newPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('newPasswordPlaceholder')}
                  className="pr-10 text-sm rounded-xl"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reset-confirm-password" className={cn('text-xs font-semibold', isTamil && 'font-tamil')}>
                {t('confirmNewPassword')}
              </Label>
              <Input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                className="text-sm rounded-xl"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" className="w-full rounded-xl py-2.5 font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className={cn(isTamil && 'font-tamil')}>{t('resettingPassword')}</span>
                  </>
                ) : (
                  <span className={cn(isTamil && 'font-tamil')}>{t('resetPasswordButton')}</span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={cn('text-xs text-muted-foreground hover:text-foreground', isTamil && 'font-tamil')}
                onClick={() => onOpenChange(false)}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;
