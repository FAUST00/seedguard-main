'use client';

import { useState, useEffect } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('supabase_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleAuth = async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setError("Supabase keys not set in next.config.js");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/auth/v1/token?grant_type=password' : '/auth/v1/signup';

      const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: email || `${username.toLowerCase()}@example.com`,
          password,
          options: !isLogin ? { data: { username } } : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error_description || data.error || 'Failed');

      if (isLogin) {
        localStorage.setItem('supabase_user', JSON.stringify(data.user || data));
        setUser(data.user || data);
        setSuccess('Logged in successfully!');
      } else {
        setSuccess('Account created! You can now login.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('supabase_user');
    setUser(null);
    setSuccess('');
  };

  if (user) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Account</h1>
        <p className="mb-8">Logged in as: <strong>{user.user_metadata?.username || user.email}</strong></p>
        <button onClick={logout} className="bg-red-600 px-8 py-3 rounded text-white">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-cyan-400">ACCOUNT</h1>

      <div className="space-y-6">
        <h2 className="text-2xl text-center">{isLogin ? 'Login' : 'Create Account'}</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg"
        />

        <input
          type="email"
          placeholder="Email (optional but recommended)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg"
        />

        <button 
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
        </button>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-zinc-400 hover:text-white py-2"
        >
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
      </div>
    </div>
  );
}
