'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Copy, Check, LogOut } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_SEEDGUARD_API_URL || 'http://localhost:3001';

interface Account {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  color?: string;
  streak?: number;
}

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [step, setStep] = useState<'loading' | 'create' | 'login' | 'profile'>('loading');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('seedguard_account');
    if (saved) {
      setAccount(JSON.parse(saved));
      setStep('profile');
    } else {
      setStep('create');
    }
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: createUsername, email: createEmail, password: createPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      localStorage.setItem('seedguard_account', JSON.stringify(data.user));
      setAccount(data.user);
      setStep('profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      localStorage.setItem('seedguard_account', JSON.stringify(data.user));
      setAccount(data.user);
      setStep('profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('seedguard_account');
    setAccount(null);
    setStep('create');
  };

  if (step === 'loading') return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">Account</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {step === 'create' && (
          <div className="space-y-4">
            <h2 className="text-2xl text-center">Create Account</h2>
            <input type="text" placeholder="Username" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} className="w-full p-3 bg-zinc-900 rounded" />
            <input type="email" placeholder="Email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className="w-full p-3 bg-zinc-900 rounded" />
            <input type="password" placeholder="Password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} className="w-full p-3 bg-zinc-900 rounded" />
            <button onClick={handleCreate} disabled={loading} className="w-full py-3 bg-green-600 rounded">Create Account</button>
            <button onClick={() => setStep('login')} className="w-full text-gray-400">Already have account? Login</button>
          </div>
        )}

        {step === 'login' && (
          <div className="space-y-4">
            <h2 className="text-2xl text-center">Login</h2>
            <input type="text" placeholder="Username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full p-3 bg-zinc-900 rounded" />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-3 bg-zinc-900 rounded" />
            <button onClick={handleLogin} disabled={loading} className="w-full py-3 bg-blue-600 rounded">Login</button>
            <button onClick={() => setStep('create')} className="w-full text-gray-400">Create new account</button>
          </div>
        )}

        {step === 'profile' && account && (
          <div className="text-center">
            <h2>Welcome back, {account.username}</h2>
            <button onClick={logout} className="mt-8 text-red-500">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
