import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, User, MapPin, ArrowRight, Loader2, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SignUp = () => {
    const { isTamil } = useLanguage();
    const { signUpWithPhone } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        district: ''
    });

    const districts = [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
        "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram",
        "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
        "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai",
        "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
    ];

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.phone.length < 10 || !formData.district) {
            toast.error(isTamil ? 'தயவுசெய்து அனைத்து விவரங்களையும் பூர்த்தி செய்யவும்' : 'Please fill in all details');
            return;
        }
        setLoading(true);
        const { error } = await signUpWithPhone(formData.phone, formData.name, formData.district);
        setLoading(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success(isTamil ? 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Account created successfully!');
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
                        {isTamil ? 'அக்ரிமேட்டில் சேரவும்' : 'Join AgriMate'}
                    </h1>
                    <p className={cn('text-muted-foreground', isTamil && 'font-tamil')}>
                        {isTamil ? 'உங்கள் விவசாய பயணத்தை இன்றே தொடங்குங்கள்' : 'Start your smart farming journey today'}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className={isTamil ? 'font-tamil' : ''}>
                                {isTamil ? 'பெயர்' : 'Name'}
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder={isTamil ? 'உங்கள் பெயர்' : 'Your Name'}
                                    className="pl-9"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

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
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="district" className={isTamil ? 'font-tamil' : ''}>
                                {isTamil ? 'மாவட்டம்' : 'District'}
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                <Select
                                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                                >
                                    <SelectTrigger className="pl-9 w-full">
                                        <SelectValue placeholder={isTamil ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Select District'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {districts.map((district) => (
                                            <SelectItem key={district} value={district}>
                                                {district}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <span className={isTamil ? 'font-tamil' : ''}>{isTamil ? 'பதிவு செய்யவும்' : 'Sign Up'}</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <div className="text-center">
                    <p className={cn('text-sm text-muted-foreground', isTamil && 'font-tamil')}>
                        {isTamil ? 'ஏற்கனவே கணக்கு வைத்திருக்கிறீர்களா?' : "Already have an account?"}{' '}
                        <Link to="/signin" className="text-primary font-medium hover:underline">
                            {isTamil ? 'உள்நுழையவும்' : 'Sign In'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
