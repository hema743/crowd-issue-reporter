import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenu(false);
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontSize: '18px',
        fontWeight: '800',
        color: '#1a56db',
        textDecoration: 'none',
      }}>
        🏙️ CivicAlert
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <Link to="/" style={navLink}>Feed</Link>
        <Link to="/dashboard" style={navLink}>Dashboard</Link>
        <Link to="/report" style={navLink}>Report Issue</Link>
        {isAdmin && (
          <Link to="/admin" style={{
            ...navLink,
            color: '#e02424',
          }}>Admin</Link>
        )}
      </div>

      {/* User Menu */}
      <div style={{ position: 'relative' }}>
        {user ? (
          <div>
            <div
              onClick={() => setMenu(!menu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f3f4f6',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#1a56db',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px',
              }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>
                {user.name.split(' ')[0]}
              </span>
              <span style={{ fontSize: '10px', color: '#6b7280' }}>▼</span>
            </div>

            {/* Dropdown */}
            {menu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                minWidth: '160px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                zIndex: 200,
              }}>
                <div style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                  }}>{user.name}</div>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                  }}>{user.role}</div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMenu(false)}
                  style={dropLink}
                >
                  👤 My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    ...dropLink,
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: '#e02424',
                    cursor: 'pointer',
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" style={{
              padding: '7px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              color: '#374151',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              Login
            </Link>
            <Link to="/register" style={{
              padding: '7px 16px',
              borderRadius: '8px',
              background: '#1a56db',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const navLink = {
  padding: '6px 14px',
  borderRadius: '8px',
  color: '#6b7280',
  textDecoration: 'none',
  fontSize: '13.5px',
  fontWeight: '500',
};

const dropLink = {
  display: 'block',
  padding: '10px 16px',
  fontSize: '13px',
  color: '#111827',
  textDecoration: 'none',
};