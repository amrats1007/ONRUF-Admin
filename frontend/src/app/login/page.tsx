"use client";
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@onruf.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Logging in...');
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Login failed');
      } else {
        setToken(data.access);
        setMessage('Success');
        sessionStorage.setItem('accessToken', data.access);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>Login</h1>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      {token && <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{token}</pre>}
    </main>
  );
}
