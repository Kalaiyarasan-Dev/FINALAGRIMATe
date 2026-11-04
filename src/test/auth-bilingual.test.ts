import { describe, it, expect, beforeEach } from 'vitest';
import { en } from '@/lib/translations/en';
import { ta } from '@/lib/translations/ta';
import { getTranslation } from '@/lib/translations';
import {
  hashPassword,
  generateSalt,
  registerFarmer,
  authenticateFarmer,
  resetFarmerPassword,
  destroySession,
  getActiveSession,
  getStoredUsers,
} from '@/services/authService';

describe('Bilingual Internationalization (English & Tamil)', () => {
  it('contains all required Login labels in English', () => {
    expect(en.welcomeToAgrimate).toBe('Welcome to Agrimate');
    expect(en.loginToAccount).toBe('Login to Your Account');
    expect(en.emailOrMobile).toBe('Email Address / Mobile Number');
    expect(en.password).toBe('Password');
    expect(en.showHidePassword).toBe('Show / Hide Password');
    expect(en.rememberMe).toBe('Remember Me');
    expect(en.forgotPassword).toBe('Forgot Password?');
    expect(en.login).toBe('Login');
    expect(en.dontHaveAccount).toBe("Don't have an account?");
    expect(en.signUp).toBe('Sign Up');
  });

  it('contains all required Login labels in Tamil', () => {
    expect(ta.welcomeToAgrimate).toBe('Agrimate-க்கு உங்களை வரவேற்கிறோம்');
    expect(ta.loginToAccount).toBe('உங்கள் கணக்கில் உள்நுழையவும்');
    expect(ta.emailOrMobile).toBe('மின்னஞ்சல் முகவரி / கைபேசி எண்');
    expect(ta.password).toBe('கடவுச்சொல்');
    expect(ta.showHidePassword).toBe('கடவுச்சொல்லைக் காண்பிக்கவும் / மறைக்கவும்');
    expect(ta.rememberMe).toBe('என்னை நினைவில் வைத்திருக்கவும்');
    expect(ta.forgotPassword).toBe('கடவுச்சொல்லை மறந்துவிட்டீர்களா?');
    expect(ta.login).toBe('உள்நுழைக');
    expect(ta.dontHaveAccount).toBe('கணக்கு இல்லையா?');
    expect(ta.signUp).toBe('பதிவு செய்யவும்');
  });

  it('contains all required Signup labels in English', () => {
    expect(en.fullName).toBe('Full Name');
    expect(en.mobileNumber).toBe('Mobile Number');
    expect(en.emailAddress).toBe('Email Address');
    expect(en.password).toBe('Password');
    expect(en.confirmPassword).toBe('Confirm Password');
    expect(en.state).toBe('State');
    expect(en.district).toBe('District');
    expect(en.village).toBe('Village');
    expect(en.mainCrop).toBe('Main Crop');
    expect(en.preferredLanguage).toBe('Preferred Language');
    expect(en.createAccount).toBe('Create Account');
  });

  it('contains all required Signup labels in Tamil', () => {
    expect(ta.fullName).toBe('முழுப் பெயர்');
    expect(ta.mobileNumber).toBe('கைபேசி எண்');
    expect(ta.emailAddress).toBe('மின்னஞ்சல் முகவரி');
    expect(ta.password).toBe('கடவுச்சொல்');
    expect(ta.confirmPassword).toBe('கடவுச்சொல்லை உறுதிப்படுத்தவும்');
    expect(ta.state).toBe('மாநிலம்');
    expect(ta.district).toBe('மாவட்டம்');
    expect(ta.village).toBe('கிராமம்');
    expect(ta.mainCrop).toBe('முக்கியப் பயிர்');
    expect(ta.preferredLanguage).toBe('விருப்பமான மொழி');
    expect(ta.createAccount).toBe('கணக்கை உருவாக்கவும்');
  });

  it('correctly resolves translations via getTranslation helper', () => {
    expect(getTranslation('en', 'welcomeToAgrimate')).toBe('Welcome to Agrimate');
    expect(getTranslation('ta', 'welcomeToAgrimate')).toBe('Agrimate-க்கு உங்களை வரவேற்கிறோம்');
    expect(getTranslation('en', 'paddy')).toBe('Paddy');
    expect(getTranslation('ta', 'paddy')).toBe('நெல்');
  });
});

describe('Authentication & Security System', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('securely hashes passwords with salt without storing plain text', async () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    const hash1 = await hashPassword('Secret@123', salt1);
    const hash2 = await hashPassword('Secret@123', salt2);

    expect(hash1).not.toBe('Secret@123');
    expect(hash1).not.toBe(hash2); // Different salts must yield different hashes
    expect(hash1.length).toBeGreaterThan(16);
  });

  it('seeds demo account successfully for instantaneous testing', async () => {
    const users = await getStoredUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);

    const demo = users.find((u) => u.phone === '9876543210');
    expect(demo).toBeDefined();
    expect(demo?.name).toBe('Muthu Kumar');
    expect(demo?.district).toBe('Thanjavur');
  });

  it('authenticates demo user with correct password', async () => {
    await getStoredUsers(); // seed
    const { user, session } = await authenticateFarmer('9876543210', 'Farmer@123', true);

    expect(user).toBeDefined();
    expect(user.name).toBe('Muthu Kumar');
    expect(session.token).toBeDefined();
    expect(getActiveSession()?.userId).toBe(user.id);
  });

  it('rejects authentication with invalid password', async () => {
    await getStoredUsers();
    await expect(authenticateFarmer('9876543210', 'WrongPassword')).rejects.toThrow();
  });

  it('registers a new farmer with bilingual fields and auto-creates session', async () => {
    const result = await registerFarmer({
      name: 'Selvan Ram',
      phone: '9840123456',
      email: 'selvan@example.com',
      password: 'StrongPassword1',
      state: 'Tamil Nadu',
      district: 'Madurai',
      village: 'Alanganallur',
      mainCrop: 'Sugarcane',
      preferredLanguage: 'ta',
    });

    expect(result.user.name).toBe('Selvan Ram');
    expect(result.user.phone).toBe('9840123456');
    expect(result.user.district).toBe('Madurai');
    expect(result.user.main_crop).toBe('Sugarcane');
    expect(result.user.preferred_language).toBe('ta');

    // Can log in with registered credentials
    const loginResult = await authenticateFarmer('9840123456', 'StrongPassword1', true);
    expect(loginResult.user.id).toBe(result.user.id);

    // Can also log in with registered email
    const loginEmailResult = await authenticateFarmer('selvan@example.com', 'StrongPassword1', true);
    expect(loginEmailResult.user.id).toBe(result.user.id);
  });

  it('prevents duplicate registration with the same phone number', async () => {
    await registerFarmer({
      name: 'Farmer One',
      phone: '9123456789',
      password: 'Password123',
      district: 'Salem',
    });

    await expect(
      registerFarmer({
        name: 'Farmer Two',
        phone: '9123456789',
        password: 'Password456',
        district: 'Salem',
      })
    ).rejects.toThrow();
  });

  it('resets farmer password successfully', async () => {
    await registerFarmer({
      name: 'Karthik',
      phone: '9003112233',
      password: 'OldPassword123',
      district: 'Coimbatore',
    });

    await resetFarmerPassword('9003112233', 'NewSecretPassword999');

    // Old password should fail
    await expect(authenticateFarmer('9003112233', 'OldPassword123')).rejects.toThrow();

    // New password should succeed
    const auth = await authenticateFarmer('9003112233', 'NewSecretPassword999');
    expect(auth.user.name).toBe('Karthik');
  });

  it('destroys session on logout', async () => {
    await authenticateFarmer('9876543210', 'Farmer@123', true);
    expect(getActiveSession()).not.toBeNull();

    destroySession();
    expect(getActiveSession()).toBeNull();
  });
});

