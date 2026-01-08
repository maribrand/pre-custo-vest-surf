import { useState, useEffect } from 'react';
import { getAllUserProfiles, approveUser, updateUserProfile } from '../../services/userProfilesService';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../App';
import type { UserProfileWithEmail } from '../../services/userProfilesService';
import { Notification } from '../common/Notification';
import './AdminSection.css';

export function UsersManager() {
  const [profiles, setProfiles] = useState<UserProfileWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { refreshProfile } = useAuth();

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const result = await getAllUserProfiles();
      if (result.success && result.profiles) {
        setProfiles(result.profiles);
      } else {
        showNotification(result.error || 'Erro ao carregar usuários', 'error');
      }
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleApprove = async (profileId: string, role: UserRole) => {
    try {
      const result = await approveUser(profileId, role);
      if (result.success) {
        showNotification('Usuário aprovado com sucesso!', 'success');
        await loadProfiles();
        // Atualiza o perfil do usuário atual se necessário
        refreshProfile();
      } else {
        showNotification(result.error || 'Erro ao aprovar usuário', 'error');
      }
    } catch (error) {
      showNotification('Erro ao aprovar usuário', 'error');
    }
  };

  const handleUpdateRole = async (profileId: string, newRole: UserRole) => {
    try {
      const result = await updateUserProfile(profileId, { role: newRole });
      if (result.success) {
        showNotification('Perfil atualizado com sucesso!', 'success');
        await loadProfiles();
        refreshProfile();
      } else {
        showNotification(result.error || 'Erro ao atualizar perfil', 'error');
      }
    } catch (error) {
      showNotification('Erro ao atualizar perfil', 'error');
    }
  };

  const handleToggleApproval = async (profileId: string, currentApproval: boolean) => {
    try {
      const result = await updateUserProfile(profileId, { is_approved: !currentApproval });
      if (result.success) {
        showNotification(
          currentApproval ? 'Usuário desaprovado' : 'Usuário aprovado',
          'success'
        );
        await loadProfiles();
        refreshProfile();
      } else {
        showNotification(result.error || 'Erro ao atualizar aprovação', 'error');
      }
    } catch (error) {
      showNotification('Erro ao atualizar aprovação', 'error');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'pcp':
        return 'PCP';
      case 'rep':
        return 'Representante';
      default:
        return role;
    }
  };

  const pendingProfiles = profiles.filter((p) => !p.is_approved);
  const approvedProfiles = profiles.filter((p) => p.is_approved);

  if (loading) {
    return (
      <div className="admin-section">
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h3>Gerenciamento de Usuários</h3>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Gerencie os usuários do sistema: aprove novos cadastros e atribua perfis de acesso.
      </p>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {pendingProfiles.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Usuários Aguardando Aprovação ({pendingProfiles.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingProfiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{profile.email || `ID: ${profile.user_id.substring(0, 8)}...`}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Perfil atual: <strong>{getRoleLabel(profile.role)}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Cadastrado em: {new Date(profile.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select
                      value={profile.role}
                      onChange={(e) => handleUpdateRole(profile.id, e.target.value as UserRole)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <option value="rep">Representante</option>
                      <option value="pcp">PCP</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleApprove(profile.id, profile.role)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 style={{ marginBottom: '1rem' }}>Usuários Aprovados ({approvedProfiles.length})</h4>
        {approvedProfiles.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nenhum usuário aprovado ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {approvedProfiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{profile.email || `ID: ${profile.user_id.substring(0, 8)}...`}</strong>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Perfil: <strong>{getRoleLabel(profile.role)}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                      Aprovado em: {new Date(profile.updated_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select
                      value={profile.role}
                      onChange={(e) => handleUpdateRole(profile.id, e.target.value as UserRole)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      <option value="rep">Representante</option>
                      <option value="pcp">PCP</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleToggleApproval(profile.id, profile.is_approved)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Desaprovar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

