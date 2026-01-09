import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx("h2", { style: {
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827'
                        }, children: "App de Pr\u00E9-Custo Vest Surf" }), profile && (_jsx("span", { style: {
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                        }, children: roleLabel }))] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [user?.email && (_jsx("span", { style: {
                            fontSize: '0.875rem',
                            color: '#6b7280',
                        }, children: user.email })), _jsx("button", { onClick: handleLogout, style: {
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.2s',
                        }, onMouseOver: (e) => {
                            e.currentTarget.style.backgroundColor = '#b91c1c';
                        }, onMouseOut: (e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                        }, children: "Sair" })] })] }));
}
