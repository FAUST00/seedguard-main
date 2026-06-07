'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Copy, Check, LogOut, Edit2, Ghost } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_SEEDGUARD_API_URL || 'http://localhost:3001';

interface Account {
  id: string;
  username: string;
  email?: string;
  createdAt: string;
  color?: string;
}

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<'loading' | 'create' | 'login' | 'profile'>('loading');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Create form
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Profile
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('seedguard_token');
    const savedAccount = localStorage.getItem('seedguard_account');

    if (savedToken && savedAccount) {
      setToken(savedToken);
      setAccount(JSON.parse(savedAccount));
      setStep('profile');
      fetchProfile(savedToken);
    } else {
      setStep('create');
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile || data.user;
        setAccount(profile);
        localStorage.setItem('seedguard_account', JSON.stringify(profile));
      }
    } catch (e) {
      console.log("Backend fetch failed, using local");
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createUsername,
          username: createUsername,
          email: createEmail,
          password: createPassword,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');

      localStorage.setItem('seedguard_token', data.token);
      localStorage.setItem('seedguard_account', JSON.stringify(data.user || data.profile));
      
      setAccount(data.user || data.profile);
      setToken(data.token);
      setStep('profile');
    } catch (err: any) {
      setError(err.message);
      // Fallback to local
      // ... (keep old local create logic if you want)
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
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('seedguard_token', data.token);
      localStorage.setItem('seedguard_account', JSON.stringify(data.user));

      setAccount(data.user);
      setToken(data.token);
      setStep('profile');
      await fetchProfile(data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your profile UI code stays the same for now

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-lg page-entry">
      <h1 className="text-4xl font-extrabold ...">ACCOUNT</h1>

      {step === 'create' && (
        <div>
          {/* Your existing create form + new email + password fields */}
          <input placeholder="Username" value={createUsername} onChange={e => setCreateUsername(e.target.value)} />
          <input placeholder="Email" value={createEmail} onChange={e => setCreateEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={createPassword} onChange={e => setCreatePassword(e.target.value)} />
          <button onClick={handleCreate} disabled={loading}>CREATE ACCOUNT</button>
          <button onClick={() => setStep('login')}>Already have an account? Login</button>
        </div>
      )}

      {step === 'login' && (
        <div>
          <input placeholder="Username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
          <button onClick={handleLogin} disabled={loading}>LOGIN</button>
          <button onClick={() => setStep('create')}>Create new account</button>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      {/* Profile view - keep your existing profile card here */}
      {step === 'profile' && account && (
        <div>
          {/* Your profile card code */}
          <p>Logged in as {account.username}</p>
        </div>
      )}
    </div>
  );
}
