import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getAllUserProfiles, approveUser, updateUserProfile } from '../../services/userProfilesService';
import { useAuth } from '../../hooks/useAuth';
import { Notification } from '../common/Notification';
import './AdminSection.css';
export function UsersManager() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const { refreshProfile } = useAuth();
    function showNotification(message, type) {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }
    const loadProfiles = async () => {
        setLoading(true);
        try {
            const result = await getAllUserProfiles();
            if (result.success && result.profiles) {
                setProfiles(result.profiles);
            }
            else {
                showNotification(result.error || 'Erro ao carregar usuários', 'error');
            }
        }
        catch (error) {
            showNotification('Erro ao carregar usuários', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadProfiles();
    }, []);
    const handleApprove = async (profileId, role) => {
        try {
            const result = await approveUser(profileId, role);
            if (result.success) {
                showNotification('Usuário aprovado com sucesso!', 'success');
                await loadProfiles();
                // Atualiza o perfil do usuário atual se necessário
                refreshProfile();
            }
            else {
                showNotification(result.error || 'Erro ao aprovar usuário', 'error');
            }
        }
        catch (error) {
            showNotification('Erro ao aprovar usuário', 'error');
        }
    };
    const handleUpdateRole = async (profileId, newRole) => {
        try {
            const result = await updateUserProfile(profileId, { role: newRole });
            if (result.success) {
                showNotification('Perfil atualizado com sucesso!', 'success');
                await loadProfiles();
                refreshProfile();
            }
            else {
                showNotification(result.error || 'Erro ao atualizar perfil', 'error');
            }
        }
        catch (error) {
            showNotification('Erro ao atualizar perfil', 'error');
        }
    };
    const handleToggleApproval = async (profileId, currentApproval) => {
        try {
            const result = await updateUserProfile(profileId, { is_approved: !currentApproval });
            if (result.success) {
                showNotification(currentApproval ? 'Usuário desaprovado' : 'Usuário aprovado', 'success');
                await loadProfiles();
                refreshProfile();
            }
            else {
                showNotification(result.error || 'Erro ao atualizar aprovação', 'error');
            }
        }
        catch (error) {
            showNotification('Erro ao atualizar aprovação', 'error');
        }
    };
    const getRoleLabel = (role) => {
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
        return (_jsx("div", { className: "admin-section", children: _jsx("p", { children: "Carregando usu\u00E1rios..." }) }));
    }
    return (_jsxs("div", { className: "admin-section", children: [_jsx("h3", { children: "Gerenciamento de Usu\u00E1rios" }), _jsx("p", { style: { color: '#64748b', marginBottom: '1.5rem' }, children: "Gerencie os usu\u00E1rios do sistema: aprove novos cadastros e atribua perfis de acesso." }), notification && (_jsx(Notification, { message: notification.message, type: notification.type, onClose: () => setNotification(null) })), pendingProfiles.length > 0 && (_jsxs("div", { style: { marginBottom: '2rem' }, children: [_jsxs("h4", { style: { color: '#dc2626', marginBottom: '1rem' }, children: ["Usu\u00E1rios Aguardando Aprova\u00E7\u00E3o (", pendingProfiles.length, ")"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: pendingProfiles.map((profile) => (_jsx("div", { style: {
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '1rem',
                                backgroundColor: '#fef2f2',
                            }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsx("strong", { children: profile.email || `ID: ${profile.user_id.substring(0, 8)}...` }), _jsxs("div", { style: { fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }, children: ["Perfil atual: ", _jsx("strong", { children: getRoleLabel(profile.role) })] }), _jsxs("div", { style: { fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }, children: ["Cadastrado em: ", new Date(profile.created_at).toLocaleString('pt-BR')] })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }, children: [_jsxs("select", { value: profile.role, onChange: (e) => handleUpdateRole(profile.id, e.target.value), style: {
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1',
                                                }, children: [_jsx("option", { value: "rep", children: "Representante" }), _jsx("option", { value: "pcp", children: "PCP" }), _jsx("option", { value: "admin", children: "Admin" })] }), _jsx("button", { onClick: () => handleApprove(profile.id, profile.role), style: {
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#16a34a',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                }, children: "Aprovar" })] })] }) }, profile.id))) })] })), _jsxs("div", { children: [_jsxs("h4", { style: { marginBottom: '1rem' }, children: ["Usu\u00E1rios Aprovados (", approvedProfiles.length, ")"] }), approvedProfiles.length === 0 ? (_jsx("p", { style: { color: '#64748b' }, children: "Nenhum usu\u00E1rio aprovado ainda." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: approvedProfiles.map((profile) => (_jsx("div", { style: {
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '1rem',
                                backgroundColor: '#ffffff',
                            }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsx("strong", { children: profile.email || `ID: ${profile.user_id.substring(0, 8)}...` }), _jsxs("div", { style: { fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }, children: ["Perfil: ", _jsx("strong", { children: getRoleLabel(profile.role) })] }), _jsxs("div", { style: { fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }, children: ["Aprovado em: ", new Date(profile.updated_at).toLocaleString('pt-BR')] })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }, children: [_jsxs("select", { value: profile.role, onChange: (e) => handleUpdateRole(profile.id, e.target.value), style: {
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1',
                                                }, children: [_jsx("option", { value: "rep", children: "Representante" }), _jsx("option", { value: "pcp", children: "PCP" }), _jsx("option", { value: "admin", children: "Admin" })] }), _jsx("button", { onClick: () => handleToggleApproval(profile.id, profile.is_approved), style: {
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#dc2626',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                }, children: "Desaprovar" })] })] }) }, profile.id))) }))] })] }));
}
