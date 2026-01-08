import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ApprovalPendingProps {
  refreshProfile: () => Promise<void>;
}

export function ApprovalPending({ refreshProfile }: ApprovalPendingProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fde68a',
        color: '#92400e',
        padding: '1.5rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>Aguardando Aprovação</h3>
        <p>
          Sua conta foi criada, mas ainda está aguardando aprovação do seu email no Supabase.
          <br />
          <br />
          Um administrador precisa aprovar seu email diretamente no painel do Supabase. 
          Assim que seu email for aprovado, você terá acesso imediato ao sistema.
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }}>
          O status é verificado automaticamente a cada 10 segundos.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            onClick={async () => {
              await refreshProfile();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            Atualizar Status Agora
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
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
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  requiredAccess: 'admin' | 'pcp' | 'rep';
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredAccess, redirectTo = '/login' }: ProtectedRouteProps) {
  const { loading, isAuthenticated, isApproved, canAccessAdmin, canAccessPCP, canAccessRep, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (!isApproved) {
    return <ApprovalPending refreshProfile={refreshProfile} />;
  }

  // Verifica acesso baseado no perfil
  let hasAccess = false;
  switch (requiredAccess) {
    case 'admin':
      hasAccess = canAccessAdmin;
      break;
    case 'pcp':
      hasAccess = canAccessPCP;
      break;
    case 'rep':
      hasAccess = canAccessRep;
      break;
  }

  if (!hasAccess) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <h3 style={{ marginTop: 0 }}>Acesso Negado</h3>
          <p>
            Você não tem permissão para acessar esta página.
            Entre em contato com um administrador se precisar de acesso.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

