import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollMasterclass, trackVisit } from '../utils/api';

const styles = {
  container: {
    display: 'flex', minHeight: '100vh', background: 'var(--background)',
  },
  // Left decorative panel
  panel: {
    display: 'flex',
    flexDirection: 'column', justifyContent: 'center',
    width: '55%', flexShrink: 0,
    backgroundImage: 'url(/learn/hero_image.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  // Right area scrollable
  formArea: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem',
    overflowY: 'auto', maxHeight: '100vh',
  },
  card: {
    background: 'var(--card)', borderRadius: '16px', padding: '2rem',
    width: '100%', maxWidth: '440px',
    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
    marginBottom: '1.5rem',
  },
  brandRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', width: '100%', maxWidth: '440px' },
  logo: { fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)' },
  navLinks: { display: 'flex', gap: '1rem' },
  navLink: { fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 },
  
  title: { fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.5rem' },
  subtitle: { fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' },
  
  label: { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.4rem', textTransform: 'uppercase' },
  input: {
    width: '100%', padding: '0.7rem 1rem', fontSize: '0.95rem', border: '1.5px solid var(--border)', borderRadius: '8px', 
    outline: 'none', background: 'var(--background)', color: 'var(--foreground)', marginBottom: '1rem', boxSizing: 'border-box',
  },
  button: {
    width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, background: 'var(--primary)', 
    color: 'var(--primary-foreground)', border: 'none', borderRadius: '8px', cursor: 'pointer',
  },
  secondaryButton: {
    width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, background: 'transparent', 
    color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem',
  },
  error: { background: 'hsl(0, 84%, 96%)', color: 'var(--destructive)', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.875rem', marginBottom: '1rem' },
  success: { background: 'hsl(142, 76%, 96%)', color: 'var(--success)', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.875rem', marginBottom: '1rem' },
  footerText: { textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.78rem', marginTop: '1rem' },
};

export default function LoginPage() {
  const { login, completeNewPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login', 'newPassword', 'enroll'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [enrollData, setEnrollData] = useState({ name: '', email: '', phone: '' });
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackVisit('landing_page').catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.requiresNewPassword) { setMode('newPassword'); return; }
    if (result.error) { setError(result.error); return; }
    navigate('/dashboard', { replace: true });
  }

  async function handleEnroll(e) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await enrollMasterclass(enrollData);
      setEnrollSuccess(true);
      setEnrollData({ name: '', email: '', phone: '' });
    } catch (err) {
      setError('Enrollment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showPanel = width > 900;

  return (
    <div style={styles.container}>
      {showPanel && <div style={styles.panel} />}
      
      <div style={styles.formArea}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>StepSmart</div>
          <div style={styles.navLinks}>
            <a href="https://chat.whatsapp.com/your-community-link" target="_blank" rel="noreferrer" style={styles.navLink}>Community</a>
            <a href="https://calendly.com/sanket-stepsmart" target="_blank" rel="noreferrer" style={styles.navLink}>Book 1:1</a>
          </div>
        </div>

        {/* Enrollment Section */}
        <div style={styles.card}>
          <div style={styles.title}>Join the Next Masterclass</div>
          <div style={styles.subtitle}>Enter your details to reserve your spot for the upcoming cohort.</div>
          
          {enrollSuccess ? (
            <div style={styles.success}>Thanks! We've received your enrollment request. We will reach out soon.</div>
          ) : (
            <form onSubmit={handleEnroll}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} type="text" placeholder="John Doe" required 
                value={enrollData.name} onChange={e => setEnrollData({...enrollData, name: e.target.value})} />
              
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} type="email" placeholder="john@example.com" required 
                value={enrollData.email} onChange={e => setEnrollData({...enrollData, email: e.target.value})} />
              
              <label style={styles.label}>Phone Number</label>
              <input style={styles.input} type="tel" placeholder="+91 98765 43210" 
                value={enrollData.phone} onChange={e => setEnrollData({...enrollData, phone: e.target.value})} />
              
              <button style={{...styles.button, opacity: submitting ? 0.6 : 1}} type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Register for Masterclass →'}
              </button>
            </form>
          )}
        </div>

        {/* Login Section */}
        <div style={styles.card}>
          <div style={styles.title}>LMS Student Portal</div>
          <div style={styles.subtitle}>Already a member? Sign in to access your course modules and sessions.</div>
          
          {error && <div style={styles.error}>{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <label style={styles.label}>Email address</label>
              <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <label style={styles.label}>Password</label>
              <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <button style={{ ...styles.button, opacity: submitting ? 0.65 : 1 }} type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In to Portal →'}
              </button>
            </form>
          ) : (
             <form onSubmit={async (e) => {
               e.preventDefault();
               setError(''); setSubmitting(true);
               if (newPassword !== confirmPassword) { setError('Passwords do not match.'); setSubmitting(false); return; }
               const res = await completeNewPassword(newPassword);
               setSubmitting(false);
               if (res.error) setError(res.error); else navigate('/dashboard');
             }}>
                <div style={styles.info}>Set your new password below.</div>
                <label style={styles.label}>New password</label>
                <input style={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <label style={styles.label}>Confirm password</label>
                <input style={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button style={styles.button} type="submit" disabled={submitting}>Set Password & Login</button>
             </form>
          )}
        </div>

        <div style={styles.footerText}>StepSmart · Product Management Career Accelerator</div>
      </div>
    </div>
  );
}
