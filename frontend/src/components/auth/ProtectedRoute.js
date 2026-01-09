import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
export function ApprovalPending({ refreshProfile }) {
    const { logout } = useAuth();
    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };
    return (_jsx("div", { style: {
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
        }, children: _jsxs("div", { style: {
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                padding: '1.5rem',
                borderRadius: '8px'
            }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Aguardando Aprova\u00E7\u00E3o" }), _jsxs("p", { children: ["Sua conta foi criada, mas ainda est\u00E1 aguardando aprova\u00E7\u00E3o do seu email no Supabase.", _jsx("br", {}), _jsx("br", {}), "Um administrador precisa aprovar seu email diretamente no painel do Supabase. Assim que seu email for aprovado, voc\u00EA ter\u00E1 acesso imediato ao sistema."] }), _jsx("p", { style: { fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8 }, children: "O status \u00E9 verificado automaticamente a cada 10 segundos." }), _jsxs("div", { style: { display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }, children: [_jsx("button", { onClick: async () => {
                                await refreshProfile();
                            }, style: {
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background-color 0.2s',
                            }, onMouseOver: (e) => {
                                e.currentTarget.style.backgroundColor = '#1d4ed8';
                            }, onMouseOut: (e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                            }, children: "Atualizar Status Agora" }), _jsx("button", { onClick: handleLogout, style: {
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'background-color 0.2s',
                            }, onMouseOver: (e) => {
                                e.currentTarget.style.backgroundColor = '#b91c1c';
                            }, onMouseOut: (e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                            }, children: "Sair" })] })] }) }));
}
export function ProtectedRoute({ children, requiredAccess, redirectTo = '/login' }) {
    const { loading, isAuthenticated, isApproved, canAccessAdmin, canAccessPCP, canAccessRep, refreshProfile } = useAuth();
    const location = useLocation();
    if (loading) {
        return (_jsx("div", { style: { textAlign: 'center', padding: '2rem' }, children: _jsx("p", { children: "Carregando..." }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: redirectTo, replace: true, state: { from: location } });
    }
    if (!isApproved) {
        return _jsx(ApprovalPending, { refreshProfile: refreshProfile });
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
        return (_jsx("div", { style: {
                textAlign: 'center',
                padding: '2rem',
                maxWidth: '600px',
                margin: '0 auto'
            }, children: _jsxs("div", { style: {
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '1.5rem',
                    borderRadius: '8px'
                }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "Acesso Negado" }), _jsx("p", { children: "Voc\u00EA n\u00E3o tem permiss\u00E3o para acessar esta p\u00E1gina. Entre em contato com um administrador se precisar de acesso." })] }) }));
    }
    return _jsx(_Fragment, { children: children });
}
