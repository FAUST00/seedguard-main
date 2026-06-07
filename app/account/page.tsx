'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Copy, Check, LogOut, Edit2, Ghost } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_SEEDGUARD_API_URL || 'http://localhost:3001';

interface Account {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  color?: string;
  streak?: number;
}

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<'loading' | 'create' | 'login' | 'profile'>('loading');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Create form
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Listen for Supabase auth changes (this makes login work across devices)
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSupabaseLogin(session.user);
      } else {
        setStep('login');
      }
    });

    // Listen for login/logout across tabs/devices
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        handleSupabaseLogin(session.user);
      } else {
        setAccount(null);
        setStep('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSupabaseLogin = async (user: any) => {
    setLoading(true);
    try {
      // You can fetch more user data from your backend or Supabase DB here later
      setAccount({
        id: user.id,
        username: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        createdAt: new Date().toISOString(),
      });
      setStep('profile');
      setMessage('Logged in successfully with Google!');
    } catch (err) {
      setError('Failed to load account');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/seedguard-main/account`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccount(null);
    setStep('login');
    setMessage('Logged out successfully');
  };

  // Keep your old login/create logic below if you still want email/password
  // ... (your existing code for create and login can stay here)

  if (step === 'loading') {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Account</h1>

        {error && <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6">{error}</div>}
        {message && <div className="bg-green-500/20 text-green-400 p-4 rounded-xl mb-6">{message}</div>}

        {step === 'login' && (
          <div className="space-y-8">
            {/* Your existing login form can go here if you want */}

            {/* Google Sign In Button */}
            <div className="border border-green-500/30 rounded-2xl p-8 bg-black/50">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                <img 
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                  alt="Google" 
                  className="w-6 h-6"
                />
                Sign in with Google
              </button>
              <p className="text-center text-sm text-gray-400 mt-4">
                This is the easiest way — your data will sync across all devices
              </p>
            </div>
          </div>
        )}

        {step === 'profile' && account && (
          <div className="bg-zinc-900 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Welcome, {account.username}</h2>
                <p className="text-green-400">{account.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-500"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>

            <p className="text-green-400 text-center py-12">
              ✅ Your account is now connected to Supabase.<br />
              Data will sync across all devices.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
