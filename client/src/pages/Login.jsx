import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Login Page
 * Clean, spacious auth page with centered card
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '300px',
          height: '300px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '30%',
          width: '250px',
          height: '250px',
          background: 'rgba(67, 56, 202, 0.06)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
            }}
          >
            <Boxes style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
            Sign in to your InvTrack account
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  marginBottom: '20px',
                }}
              >
                <AlertCircle style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    color: '#475569',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@inventory.com"
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    color: '#475569',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '42px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(to right, #4f46e5, #6366f1)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.4)', margin: '24px 0' }} />

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: '500', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
            }}
          >
            <span style={{ fontSize: '12px', color: '#475569' }}>Demo:</span>
            <code style={{ fontSize: '12px', color: '#94a3b8' }}>admin@inventory.com</code>
            <span style={{ fontSize: '12px', color: '#334155' }}>/</span>
            <code style={{ fontSize: '12px', color: '#94a3b8' }}>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
