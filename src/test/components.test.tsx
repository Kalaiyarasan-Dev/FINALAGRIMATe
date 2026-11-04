import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';

const renderWithProviders = (ui: React.ReactElement, initialLang: 'en' | 'ta' = 'en') => {
  localStorage.setItem('agrimate_language', initialLang);

  return render(
    <MemoryRouter>
      <LanguageProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
};

describe('SignIn Component UI & Language Switching', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders all required English labels on Login page', () => {
    renderWithProviders(<SignIn />, 'en');

    expect(screen.getByText('Welcome to Agrimate')).toBeInTheDocument();
    expect(screen.getByText('Login to Your Account')).toBeInTheDocument();
    expect(screen.getByText('Email Address / Mobile Number')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember Me')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('renders all required Tamil labels on Login page', () => {
    renderWithProviders(<SignIn />, 'ta');

    expect(screen.getByText('Agrimate-க்கு உங்களை வரவேற்கிறோம்')).toBeInTheDocument();
    expect(screen.getByText('உங்கள் கணக்கில் உள்நுழையவும்')).toBeInTheDocument();
    expect(screen.getByText('மின்னஞ்சல் முகவரி / கைபேசி எண்')).toBeInTheDocument();
    expect(screen.getByText('கடவுச்சொல்')).toBeInTheDocument();
    expect(screen.getByText('என்னை நினைவில் வைத்திருக்கவும்')).toBeInTheDocument();
    expect(screen.getByText('கடவுச்சொல்லை மறந்துவிட்டீர்களா?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /உள்நுழைக/i })).toBeInTheDocument();
    expect(screen.getByText('கணக்கு இல்லையா?')).toBeInTheDocument();
    expect(screen.getByText('பதிவு செய்யவும்')).toBeInTheDocument();
  });

  it('switches from English to Tamil immediately when clicking language switcher', async () => {
    renderWithProviders(<SignIn />, 'en');

    // Initially in English
    expect(screen.getByText('Welcome to Agrimate')).toBeInTheDocument();

    // Click Tamil switcher
    const tamilBtn = screen.getByRole('button', { name: 'தமிழ்' });
    fireEvent.click(tamilBtn);

    // Immediately changes to Tamil
    await waitFor(() => {
      expect(screen.getByText('Agrimate-க்கு உங்களை வரவேற்கிறோம்')).toBeInTheDocument();
    });

    // Check localStorage saved language
    expect(localStorage.getItem('agrimate_language')).toBe('ta');
  });
});

describe('SignUp Component UI & Language Switching', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders all required English fields on Signup page', () => {
    renderWithProviders(<SignUp />, 'en');

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText(/District/i)).toBeInTheDocument();
    expect(screen.getByText('Village')).toBeInTheDocument();
    expect(screen.getByText(/Main Crop/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferred Language/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('renders all required Tamil fields on Signup page', () => {
    renderWithProviders(<SignUp />, 'ta');

    expect(screen.getByRole('heading', { name: 'கணக்கை உருவாக்கவும்' })).toBeInTheDocument();
    expect(screen.getByText(/முழுப் பெயர்/i)).toBeInTheDocument();
    expect(screen.getByText(/கைபேசி எண்/i)).toBeInTheDocument();
    expect(screen.getByText('மின்னஞ்சல் முகவரி')).toBeInTheDocument();
    expect(screen.getByText(/கடவுச்சொல்லை உறுதிப்படுத்தவும்/i)).toBeInTheDocument();
    expect(screen.getByText('மாநிலம்')).toBeInTheDocument();
    expect(screen.getByText(/மாவட்டம்/i)).toBeInTheDocument();
    expect(screen.getByText('கிராமம்')).toBeInTheDocument();
    expect(screen.getByText(/முக்கியப் பயிர்/i)).toBeInTheDocument();
    expect(screen.getByText(/விருப்பமான மொழி/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /கணக்கை உருவாக்கவும்/i })).toBeInTheDocument();
  });
});
