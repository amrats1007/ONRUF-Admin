"use client";
import { useEffect, useState } from 'react';

interface Org { id: string; name: string }

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setError('Not authenticated. Login first.');
      setLoading(false);
      return;
    }
    fetch('http://localhost:4000/organizations', { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setOrgs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h2>Organizations</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      <ul>
        {orgs.map(o => <li key={o.id}>{o.name}</li>)}
      </ul>
    </main>
  );
}
