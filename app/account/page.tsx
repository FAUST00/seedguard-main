'use client';

import { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setError("Supabase keys not configured. Check next.config.js");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/${isLogin ? 'token' : 'signup'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          email: email || `${username.toLowerCase()}@example.com`,
          password,
          options: isLogin ? undefined : { data: { username } }
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed');

      setUser(data.user || data);
      setError(isLogin ? 'Logged in successfully!' : 'Account created! Check email if needed.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Account</h1>

      <div className="space-y-4">
        <h2 className="text-2xl text-center">{isLogin ? 'Login' : 'Create Account'}</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 bg-zinc-900 rounded"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-zinc-900 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-zinc-900 rounded"
        />

        <button 
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-purple-600 py-4 rounded font-medium"
        >
          {loading ? 'Processing...' : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
        </button>

        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-zinc-400">
          {isLogin ? "Create new account" : "Already have an account? Login"}
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}
