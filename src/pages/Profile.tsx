
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  User as UserIcon, 
  MapPin, 
  Sprout, 
  Settings, 
  Bell, 
  HelpCircle, 
  ChevronRight,
  Shield,
  Edit,
  Check,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  district: string;
  landSize: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isTamil, language, setLanguage } = useLanguage();
  const { profile: authProfile, updateProfile, signOut } = useAuth();
  
  // Profile State
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const saved = localStorage.getItem('vivasayi_profile');
      return saved ? JSON.parse(saved) : { name: 'Muthu Kumar', district: 'Thanjavur', landSize: '5' };
    } catch {
      return { name: 'Muthu Kumar', district: 'Thanjavur', landSize: '5' };
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempDistrict, setTempDistrict] = useState(profile.district);
  const [tempLandSize, setTempLandSize] = useState(profile.landSize);

  useEffect(() => {
    if (authProfile) {
      setProfile({
        name: authProfile.name || 'Muthu Kumar',
        district: authProfile.district || 'Thanjavur',
        landSize: String(authProfile.land_size || '5'),
      });
      setTempName(authProfile.name || 'Muthu Kumar');
      setTempDistrict(authProfile.district || 'Thanjavur');
      setTempLandSize(String(authProfile.land_size || '5'));
    }
  }, [authProfile]);

  const saveProfile = async () => {
    const updated = {
      name: tempName.trim() || 'Muthu Kumar',
      district: tempDistrict.trim() || 'Thanjavur',
      landSize: tempLandSize.trim() || '5'
    };
    setProfile(updated);
    localStorage.setItem('vivasayi_profile', JSON.stringify(updated));
    setIsEditing(false);

    await updateProfile({
      name: updated.name,
      district: updated.district,
      land_size: parseFloat(updated.landSize) || 5,
    });

    toast.success(isTamil ? 'சுயவிவரம் சேமிக்கப்பட்டது!' : 'Profile updated successfully!');
  };

  const handleLanguageSelect = async (lang: 'en' | 'ta') => {
    setLanguage(lang);
    await updateProfile({ preferred_language: lang });
    toast.success(lang === 'ta' ? 'மொழி தமிழுக்கு மாற்றப்பட்டது' : 'Language changed to English');
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(isTamil ? 'வெற்றிகரமாக வெளியேறிவிட்டீர்கள்' : 'Logged out successfully');
    navigate('/signin');
  };

  const menuItems = [
    {
      icon: Bell,
      labelEn: 'Notifications',
      labelTa: 'அறிவிப்புகள்',
      color: 'text-sky',
      bg: 'bg-sky-light',
    },
    {
      icon: Settings,
      labelEn: 'Settings',
      labelTa: 'அமைப்புகள்',
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
    {
      icon: Shield,
      labelEn: 'Privacy & Security',
      labelTa: 'தனியுரிமை & பாதுகாப்பு',
      color: 'text-success',
      bg: 'bg-success-light',
    },
    {
      icon: HelpCircle,
      labelEn: 'Help & Support',
      labelTa: 'உதவி & ஆதரவு',
      color: 'text-harvest',
      bg: 'bg-harvest-light',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Profile Card */}
        <div className="bg-gradient-primary rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2 text-foreground">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-2.5 py-1 text-sm bg-background border border-border text-foreground rounded-lg"
                    placeholder="Name"
                  />
                </div>
              ) : (
                <>
                  <h2 className={cn('text-lg font-bold truncate', isTamil && 'font-tamil')}>
                    {profile.name}
                  </h2>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isTamil ? 'உறுதிசெய்யப்பட்ட விவசாயி 🌾' : 'Verified Farmer 🌾'}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  saveProfile();
                } else {
                  setTempName(profile.name);
                  setTempDistrict(profile.district);
                  setTempLandSize(profile.landSize);
                  setIsEditing(true);
                }
              }}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-primary-foreground flex-shrink-0 touch-feedback"
            >
              {isEditing ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Profile Editing Inputs (Additional) */}
        {isEditing && (
          <div className="bg-card rounded-2xl p-4 border border-border shadow-card space-y-3 animate-fade-in">
            <h3 className={cn('text-sm font-bold text-foreground', isTamil && 'font-tamil')}>
              {isTamil ? 'சுயவிவரத்தைத் திருத்தவும்' : 'Edit Profile Details'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={cn('text-xs text-muted-foreground block mb-1', isTamil && 'font-tamil')}>
                  {isTamil ? 'மாவட்டம்' : 'District'}
                </label>
                <input
                  type="text"
                  value={tempDistrict}
                  onChange={(e) => setTempDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none"
                  placeholder="e.g. Thanjavur"
                />
              </div>
              <div>
                <label className={cn('text-xs text-muted-foreground block mb-1', isTamil && 'font-tamil')}>
                  {isTamil ? 'நில அளவு (ஏக்கர்)' : 'Land Size (Acres)'}
                </label>
                <input
                  type="number"
                  value={tempLandSize}
                  onChange={(e) => setTempLandSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none"
                  placeholder="e.g. 5"
                />
              </div>
            </div>
            <button
              onClick={saveProfile}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-xs transition-opacity hover:opacity-95"
            >
              {isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Language Toggle */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <span className="text-lg">🌐</span>
              </div>
              <div>
                <h3 className={cn(
                  'text-sm font-semibold text-foreground',
                  isTamil && 'font-tamil'
                )}>
                  {isTamil ? 'மொழி' : 'Language'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'ta' ? 'தமிழ்' : 'English'}
                </p>
              </div>
            </div>
            <div className="flex rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => handleLanguageSelect('en')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                )}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageSelect('ta')}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors font-tamil',
                  language === 'ta'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                )}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        {!isEditing && (
          <div className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <h3 className={cn(
              'text-sm font-semibold text-foreground mb-3',
              isTamil && 'font-tamil'
            )}>
              {isTamil ? 'பண்ணை விவரங்கள்' : 'Farm Details'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className={cn(
                    'text-xs text-muted-foreground',
                    isTamil && 'font-tamil'
                  )}>
                    {isTamil ? 'மாவட்டம்' : 'District'}
                  </p>
                  <p className={cn(
                    'text-sm font-medium text-foreground',
                    isTamil && 'font-tamil'
                  )}>
                    {profile.district}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Sprout className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className={cn(
                    'text-xs text-muted-foreground',
                    isTamil && 'font-tamil'
                  )}>
                    {isTamil ? 'நில அளவு' : 'Land Size'}
                  </p>
                  <p className={cn(
                    'text-sm font-medium text-foreground',
                    isTamil && 'font-tamil'
                  )}>
                    {profile.landSize} {isTamil ? 'ஏக்கர்' : 'Acres'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={cn(
                  'w-full flex items-center gap-3 p-4 touch-feedback text-left',
                  index !== menuItems.length - 1 && 'border-b border-border'
                )}
              >
                <div className={cn('p-2 rounded-xl', item.bg)}>
                  <Icon className={cn('w-5 h-5', item.color)} />
                </div>
                <span className={cn(
                  'flex-1 text-sm font-medium text-foreground',
                  isTamil && 'font-tamil'
                )}>
                  {language === 'ta' ? item.labelTa : item.labelEn}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="pt-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15 transition-all text-sm font-semibold touch-feedback shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className={cn(isTamil && 'font-tamil')}>
              {isTamil ? 'வெளியேறுக' : 'Logout'}
            </span>
          </button>
        </div>

        {/* Version */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            AgriMate v1.0.0
          </p>
          <p className={cn(
            'text-xs text-muted-foreground mt-1',
            isTamil && 'font-tamil'
          )}>
            {isTamil ? '💚 விவசாயிகளுக்காக உருவாக்கப்பட்டது' : '💚 Made for Farmers'}
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
