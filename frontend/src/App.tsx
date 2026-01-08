import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ApprovalPending, ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { SellerLayout } from './components/layout/SellerLayout';
import { Header } from './components/layout/Header';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useAuth } from './hooks/useAuth';
import type { CompleteModel } from './types/catalog';

export type UserRole = 'admin' | 'pcp' | 'rep';

type SupabaseData = ReturnType<typeof useSupabaseData>;

const roleToPath: Record<UserRole, string> = {
  admin: '/admin',
  pcp: '/pcp',
  rep: '/rep',
};

function AppShell({ children, showAuthHeader = false }: { children: ReactNode; showAuthHeader?: boolean }) {
  return (
    <div className="app-shell">
      {showAuthHeader ? (
        <Header />
      ) : (
        <header className="app-header">
          <p>App de Pré-Custo Vest Surf</p>
          <h1>Simulador rápido para atendimento</h1>
        </header>
      )}
      <div className="app-content">{children}</div>
    </div>
  );
}

function SupabaseDataGate({ children, showAuthHeader = true }: { children: (data: SupabaseData) => ReactNode; showAuthHeader?: boolean }) {
  const data = useSupabaseData();
  const { loading, error, refresh } = data;
  const isConfigError = error?.includes('Variáveis de ambiente') || error?.includes('VITE_SUPABASE');

  if (loading) {
    return (
      <AppShell showAuthHeader={showAuthHeader}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando dados...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell showAuthHeader={showAuthHeader}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: '#dc2626', marginTop: 0 }}>⚠️ Configuração Necessária</h3>
            <p style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>
            
            {isConfigError && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1rem', 
                borderRadius: '4px', 
                textAlign: 'left',
                marginTop: '1rem'
              }}>
                <p style={{ fontWeight: 'bold', marginTop: 0 }}>Como corrigir:</p>
                <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  <li>Crie o arquivo <code style={{ backgroundColor: '#f3f4f6', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>frontend/.env.local</code></li>
                  <li>Adicione as seguintes linhas:</li>
                </ol>
                <pre style={{ 
                  backgroundColor: '#1f2937', 
                  color: '#f9fafb', 
                  padding: '1rem', 
                  borderRadius: '4px', 
                  overflow: 'auto',
                  fontSize: '0.85rem'
                }}>
{`VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui`}
                </pre>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Consulte o arquivo <code>SETUP_SUPABASE.md</code> para instruções detalhadas.
                </p>
              </div>
            )}
          </div>
          
          {!isConfigError && (
            <button
              onClick={() => refresh()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
          )}
        </div>
      </AppShell>
    );
  }

  return <AppShell showAuthHeader={showAuthHeader}>{children(data)}</AppShell>;
}

function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isApproved, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;
  const targetPath = profile?.role ? roleToPath[profile.role] : from;

  useEffect(() => {
    if (isAuthenticated && isApproved && profile?.role) {
      navigate(targetPath || roleToPath[profile.role], { replace: true });
    }
  }, [isAuthenticated, isApproved, profile?.role, targetPath, navigate]);

  if (isAuthenticated && !isApproved) {
    return (
      <AppShell>
        <ApprovalPending refreshProfile={refreshProfile} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      {mode === 'login' ? (
        <Login onSwitchToRegister={() => setMode('register')} />
      ) : (
        <Register onSwitchToLogin={() => setMode('login')} />
      )}
    </AppShell>
  );
}

function AdminPage() {
  const [completeModels, setCompleteModels] = useState<CompleteModel[]>([]);

  return (
    <SupabaseDataGate>
      {({ clientTypes, productModels, variants, attributes, fabrics, refresh }) => (
        <AdminLayout
          clientTypes={clientTypes}
          productModels={productModels}
          variants={variants}
          attributes={attributes}
          completeModels={completeModels}
          fabrics={fabrics}
          onClientTypesChange={refresh}
          onProductModelsChange={refresh}
          onVariantsChange={refresh}
          onAttributesChange={refresh}
          onCompleteModelsChange={setCompleteModels}
          onFabricsChange={refresh}
        />
      )}
    </SupabaseDataGate>
  );
}

function PCPPage() {
  return (
    <SupabaseDataGate>
      {({ clientTypes, productModels, variants, attributes, fabrics }) => (
        <SellerLayout
          clientTypes={clientTypes}
          models={productModels}
          variations={variants}
          attributes={attributes}
          fabrics={fabrics}
          mode="internal"
        />
      )}
    </SupabaseDataGate>
  );
}

function RepPage() {
  return (
    <SupabaseDataGate>
      {({ clientTypes, productModels, variants, attributes, fabrics }) => (
        <SellerLayout
          clientTypes={clientTypes}
          models={productModels}
          variations={variants}
          attributes={attributes}
          fabrics={fabrics}
          mode="rep"
        />
      )}
    </SupabaseDataGate>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredAccess="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pcp"
        element={
          <ProtectedRoute requiredAccess="pcp">
            <PCPPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rep"
        element={
          <ProtectedRoute requiredAccess="rep">
            <RepPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
