import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const roleLabel = profile?.role === 'admin' 
    ? 'Admin' 
    : profile?.role === 'pcp' 
    ? 'PCP' 
    : 'Representante';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: '600',
          color: '#111827'
        }}>
          App de Pré-Custo Vest Surf
        </h2>
        {profile && (
          <span style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}>
            {roleLabel}
          </span>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user?.email && (
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280',
          }}>
            {user.email}
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
