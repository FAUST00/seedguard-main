'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/sync';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        await signUp(email, password, username);
        setMessage('✅ Account created! Check your email to confirm, then log in.');
      } else {
        await signIn(email, password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 tracking-widest">SEEDGUARD</h1>
          <p className="text-gray-500 mt-2 text-sm">Your data. Everywhere. Always.</p>
        </div>
        <div className="bg-gray-900 border border-cyan-900 rounded-2xl p-8 shadow-2xl">
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}>Log In</button>
            <button onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'signup' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}>Sign Up</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500" placeholder="YourUsername" />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500" placeholder="••••••••" />
            </div>
            {error && <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
            {message && <div className="bg-green-950 border border-green-800 rounded-lg px-4 py-3 text-green-400 text-sm">{message}</div>}
            <button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-lg transition-all">
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
