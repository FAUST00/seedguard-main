'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function UserCountBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count: c }) => { if (c != null) setCount(c); }, () => {});
  }, []);

  if (!count || count < 2) return null;

  return (
    <p className="text-xs text-muted-foreground/70 mt-3 text-center">
      🔥{' '}
      <strong className="text-primary neon-text-pink">
        {count.toLocaleString()}
      </strong>{' '}
      men tracking their freedom
    </p>
  );
}
