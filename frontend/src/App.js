import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
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
const roleToPath = {
    admin: '/admin',
    pcp: '/pcp',
    rep: '/rep',
};
function AppShell({ children, showAuthHeader = false }) {
    return (_jsxs("div", { className: "app-shell", children: [showAuthHeader ? (_jsx(Header, {})) : (_jsxs("header", { className: "app-header", children: [_jsx("p", { children: "App de Pr\u00E9-Custo Vest Surf" }), _jsx("h1", { children: "Simulador r\u00E1pido para atendimento" })] })), _jsx("div", { className: "app-content", children: children })] }));
}
function SupabaseDataGate({ children, showAuthHeader = true }) {
    const data = useSupabaseData();
    const { loading, error, refresh } = data;
    const isConfigError = error?.includes('Variáveis de ambiente') || error?.includes('VITE_SUPABASE');
    if (loading) {
        return (_jsx(AppShell, { showAuthHeader: showAuthHeader, children: _jsx("div", { style: { textAlign: 'center', padding: '2rem' }, children: _jsx("p", { children: "Carregando dados..." }) }) }));
    }
    if (error) {
        return (_jsx(AppShell, { showAuthHeader: showAuthHeader, children: _jsxs("div", { style: { textAlign: 'center', padding: '2rem', maxWidth: '600px', margin: '0 auto' }, children: [_jsxs("div", { style: {
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            marginBottom: '1rem'
                        }, children: [_jsx("h3", { style: { color: '#dc2626', marginTop: 0 }, children: "\u26A0\uFE0F Configura\u00E7\u00E3o Necess\u00E1ria" }), _jsx("p", { style: { color: '#991b1b', marginBottom: '1rem' }, children: error }), isConfigError && (_jsxs("div", { style: {
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    textAlign: 'left',
                                    marginTop: '1rem'
                                }, children: [_jsx("p", { style: { fontWeight: 'bold', marginTop: 0 }, children: "Como corrigir:" }), _jsxs("ol", { style: { margin: '0.5rem 0', paddingLeft: '1.5rem' }, children: [_jsxs("li", { children: ["Crie o arquivo ", _jsx("code", { style: { backgroundColor: '#f3f4f6', padding: '0.2rem 0.4rem', borderRadius: '3px' }, children: "frontend/.env.local" })] }), _jsx("li", { children: "Adicione as seguintes linhas:" })] }), _jsx("pre", { style: {
                                            backgroundColor: '#1f2937',
                                            color: '#f9fafb',
                                            padding: '1rem',
                                            borderRadius: '4px',
                                            overflow: 'auto',
                                            fontSize: '0.85rem'
                                        }, children: `VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui` }), _jsxs("p", { style: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }, children: ["Consulte o arquivo ", _jsx("code", { children: "SETUP_SUPABASE.md" }), " para instru\u00E7\u00F5es detalhadas."] })] }))] }), !isConfigError && (_jsx("button", { onClick: () => refresh(), style: {
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }, children: "Tentar novamente" }))] }) }));
    }
    return _jsx(AppShell, { showAuthHeader: showAuthHeader, children: children(data) });
}
function AuthPage() {
    const [mode, setMode] = useState('login');
    const { isAuthenticated, isApproved, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname;
    const targetPath = profile?.role ? roleToPath[profile.role] : from;
    useEffect(() => {
        if (isAuthenticated && isApproved && profile?.role) {
            navigate(targetPath || roleToPath[profile.role], { replace: true });
        }
    }, [isAuthenticated, isApproved, profile?.role, targetPath, navigate]);
    if (isAuthenticated && !isApproved) {
        return (_jsx(AppShell, { children: _jsx(ApprovalPending, { refreshProfile: refreshProfile }) }));
    }
    return (_jsx(AppShell, { children: mode === 'login' ? (_jsx(Login, { onSwitchToRegister: () => setMode('register') })) : (_jsx(Register, { onSwitchToLogin: () => setMode('login') })) }));
}
function AdminPage() {
    const [completeModels, setCompleteModels] = useState([]);
    return (_jsx(SupabaseDataGate, { children: ({ clientTypes, productModels, variants, attributes, fabrics, refresh }) => (_jsx(AdminLayout, { clientTypes: clientTypes, productModels: productModels, variants: variants, attributes: attributes, completeModels: completeModels, fabrics: fabrics, onClientTypesChange: refresh, onProductModelsChange: refresh, onVariantsChange: refresh, onAttributesChange: refresh, onCompleteModelsChange: setCompleteModels, onFabricsChange: refresh })) }));
}
function PCPPage() {
    return (_jsx(SupabaseDataGate, { children: ({ clientTypes, productModels, variants, attributes, fabrics }) => (_jsx(SellerLayout, { clientTypes: clientTypes, models: productModels, variations: variants, attributes: attributes, fabrics: fabrics, mode: "internal" })) }));
}
function RepPage() {
    return (_jsx(SupabaseDataGate, { children: ({ clientTypes, productModels, variants, attributes, fabrics }) => (_jsx(SellerLayout, { clientTypes: clientTypes, models: productModels, variations: variants, attributes: attributes, fabrics: fabrics, mode: "rep" })) }));
}
function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(AuthPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { requiredAccess: "admin", children: _jsx(AdminPage, {}) }) }), _jsx(Route, { path: "/pcp", element: _jsx(ProtectedRoute, { requiredAccess: "pcp", children: _jsx(PCPPage, {}) }) }), _jsx(Route, { path: "/rep", element: _jsx(ProtectedRoute, { requiredAccess: "rep", children: _jsx(RepPage, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
export default App;
