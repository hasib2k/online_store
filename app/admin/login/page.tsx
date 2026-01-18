"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../Admin.module.css';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        // allow receiving HttpOnly cookie set by the server
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || 'Login failed');
      } else {
        // store password locally to preserve existing behavior (legacy fallback)
        try { localStorage.setItem('admin_password', password); } catch (e) {}
        router.push('/admin/orders');
      }
    } catch (e) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className={styles.adminLoginCard}>
      <div className={styles.adminLoginTitle}>Admin Login</div>
      <div className={styles.adminLoginDesc}>Sign in to manage orders and view live activity.</div>

      <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
        <input
          className={styles.adminLoginInput}
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Admin password"
        />

        <div className={styles.adminLoginActions}>
          <button className={styles.adminLoginBtn} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>
      </form>

      {error && <div style={{ color: '#ef4444', marginTop: 12 }}>{error}</div>}
      <div className={styles.adminLoginNote}>Only authorized users should access this area.</div>
    </div>
  );
}
