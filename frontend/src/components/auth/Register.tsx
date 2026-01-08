import { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../App';
import './Login.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const roleOptions: { label: string; value: UserRole; description: string }[] = [
  {
    label: 'Admin / Precificação',
    value: 'admin',
    description: 'Cadastrar tipos de cliente, modelos, categorias e variações.',
  },
  {
    label: 'PCP / Interno',
    value: 'pcp',
    description: 'Visualiza todo o simulador detalhado (base + adicionais).',
  },
  {
    label: 'Representante / Comercial',
    value: 'rep',
    description: 'Simula com visão simplificada, sem mostrar cada valor adicional.',
  },
];

export function Register({ onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('rep');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, selectedRole);
      
      if (!result.success) {
        setError(result.error || 'Erro ao criar conta');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Conta criada com sucesso!</h2>
          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0 }}>
              Sua conta foi criada com o perfil <strong>{roleOptions.find(r => r.value === selectedRole)?.label}</strong>.
              <br />
              <br />
              Aguarde a aprovação do seu email no Supabase para acessar o sistema. 
              Um administrador aprovará sua conta diretamente no painel do Supabase.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="auth-button auth-button-primary"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Cadastro</h2>
        <p className="auth-subtitle">Crie sua conta para começar</p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirmar Senha</label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-role">Perfil de Acesso</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}>
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${selectedRole === option.value ? '#2563eb' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    backgroundColor: selectedRole === option.value ? '#dbeafe' : '#f8fafc',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!loading && selectedRole !== option.value) {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedRole !== option.value) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#0f172a' }}>
                    {option.label}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-link"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

