'use client';

import { useState } from 'react';
import { migrateLocalToCloud, getUser } from '@/lib/sync';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  async function handleMigrate() {
    setLoading(true);
    try {
      const user = await getUser();
      if (!user) { router.push('/login'); return; }
      const output = await migrateLocalToCloud();
      setResults(output);
      setDone(true);
    } catch (err: any) {
      setResults([`❌ Error: ${err.message}`]);
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-cyan-900 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Import Existing Data</h2>
        <p className="text-gray-400 text-sm mb-6">Move your existing streaks, history, and profile from this device into your cloud account.</p>
        {!done ? (
          <button onClick={handleMigrate} disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold py-3 rounded-lg">
            {loading ? 'Importing...' : '⬆️ Import My Local Data'}
          </button>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {results.map((r, i) => <div key={i} className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-white">{r}</div>)}
            </div>
            <button onClick={() => router.push('/dashboard')} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg">Go to Dashboard →</button>
          </>
        )}
        <button onClick={() => router.push('/dashboard')} className="w-full mt-3 text-gray-600 hover:text-gray-400 text-sm py-2">Skip — I don&apos;t have existing data</button>
      </div>
    </div>
  );
}
