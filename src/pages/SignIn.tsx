import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Sprout } from 'lucide-react';

const SignIn = () => {
    const { isTamil } = useLanguage();
    const { signInWithPhone } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error(isTamil ? 'செல்லுபடியாகும் தொலைபேசி எண்ணை உள்ளிடவும்' : 'Please enter a valid phone number');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
            toast.success(isTamil ? 'OTP அனுப்பப்பட்டது: 1234' : 'OTP sent: 1234');
        }, 800);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp !== '1234') {
            toast.error(isTamil ? 'தவறான OTP' : 'Invalid OTP');
            return;
        }
        setLoading(true);
        const { error } = await signInWithPhone(phone, otp);
        setLoading(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success(isTamil ? 'வெற்றிகரமாக உள்நுழைந்தது' : 'Successfully signed in');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 left-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Sprout className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className={cn('text-3xl font-bold text-foreground font-heading', isTamil && 'font-tamil')}>
                        {isTamil ? 'அக்ரிமேட்டிற்கு வரவேற்கிறோம்' : 'Welcome back to AgriMate'}
                    </h1>
                    <p className={cn('text-muted-foreground', isTamil && 'font-tamil')}>
                        {isTamil ? 'தொடர உங்கள் தொலைபேசி எண்ணைப் பயன்படுத்தி உள்நுழையவும்' : 'Sign in using your phone number to continue'}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                    {step === 'phone' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className={isTamil ? 'font-tamil' : ''}>
                                    {isTamil ? 'தொலைபேசி எண்' : 'Phone Number'}
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="98765 43210"
                                        className="pl-9"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <span className={isTamil ? 'font-tamil' : ''}>{isTamil ? 'OTP அனுப்பு' : 'Send OTP'}</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-slide-up">
                            <div className="space-y-2">
                                <Label htmlFor="otp" className={isTamil ? 'font-tamil' : ''}>
                                    {isTamil ? 'OTP ஐ உள்ளிடவும்' : 'Enter OTP'}
                                </Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="1234"
                                        className="pl-9 tracking-widest text-lg"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    {isTamil ? 'விளக்க நோக்கத்திற்காக 1234 ஐப் பயன்படுத்தவும்' : 'Use 1234 for demo purposes'}
                                </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <span className={isTamil ? 'font-tamil' : ''}>{isTamil ? 'சரிபார்த்து உள்நுழிக' : 'Verify & Login'}</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep('phone')}
                                className={cn('w-full text-sm text-muted-foreground hover:text-primary transition-colors', isTamil && 'font-tamil')}
                            >
                                {isTamil ? 'தொலைபேசி எண்ணை மாற்றவும்' : 'Change phone number'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center">
                    <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
                        {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
                        <Link to="/signup" className="text-primary font-medium hover:underline">
                            {isTamil ? 'பதிவு செய்யவும்' : 'Sign Up'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
