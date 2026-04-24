import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Register Page
 * Clean, spacious registration page matching the login design
 */
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
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
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    color: '#475569',
    pointerEvents: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '8px',
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
          top: '25%',
          right: '30%',
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
          bottom: '25%',
          left: '25%',
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
            Create Account
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
            Start managing your inventory today
          </p>
        </div>

        {/* Register Card */}
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

            {/* Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={iconStyle} />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={iconStyle} />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={iconStyle} />
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit"
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
                  Create Account
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.4)', margin: '24px 0' }} />

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: '500', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
