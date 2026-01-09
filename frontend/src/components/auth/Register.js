import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';
const roleOptions = [
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
export function Register({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('rep');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const handleSubmit = async (e) => {
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
            }
            else {
                setSuccess(true);
            }
        }
        catch (err) {
            setError('Erro inesperado ao criar conta');
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h2", { children: "Conta criada com sucesso!" }), _jsx("div", { style: {
                            backgroundColor: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            color: '#166534',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }, children: _jsxs("p", { style: { margin: 0 }, children: ["Sua conta foi criada com o perfil ", _jsx("strong", { children: roleOptions.find(r => r.value === selectedRole)?.label }), ".", _jsx("br", {}), _jsx("br", {}), "Aguarde a aprova\u00E7\u00E3o do seu email no Supabase para acessar o sistema. Um administrador aprovar\u00E1 sua conta diretamente no painel do Supabase."] }) }), _jsx("button", { type: "button", onClick: onSwitchToLogin, className: "auth-button auth-button-primary", children: "Ir para Login" })] }) }));
    }
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h2", { children: "Cadastro" }), _jsx("p", { className: "auth-subtitle", children: "Crie sua conta para come\u00E7ar" }), error && (_jsx("div", { className: "auth-error", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "register-email", children: "Email" }), _jsx("input", { id: "register-email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "seu@email.com", required: true, disabled: loading })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "register-password", children: "Senha" }), _jsx("input", { id: "register-password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "M\u00EDnimo 6 caracteres", required: true, minLength: 6, disabled: loading })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "register-confirm-password", children: "Confirmar Senha" }), _jsx("input", { id: "register-confirm-password", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Digite a senha novamente", required: true, minLength: 6, disabled: loading })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "register-role", children: "Perfil de Acesso" }), _jsx("div", { style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '0.75rem',
                                        marginTop: '0.5rem'
                                    }, children: roleOptions.map((option) => (_jsxs("button", { type: "button", onClick: () => setSelectedRole(option.value), disabled: loading, style: {
                                            padding: '0.75rem',
                                            border: `2px solid ${selectedRole === option.value ? '#2563eb' : '#cbd5e1'}`,
                                            borderRadius: '8px',
                                            backgroundColor: selectedRole === option.value ? '#dbeafe' : '#f8fafc',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            opacity: loading ? 0.6 : 1,
                                        }, onMouseOver: (e) => {
                                            if (!loading && selectedRole !== option.value) {
                                                e.currentTarget.style.borderColor = '#2563eb';
                                                e.currentTarget.style.backgroundColor = '#eff6ff';
                                            }
                                        }, onMouseOut: (e) => {
                                            if (selectedRole !== option.value) {
                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }
                                        }, children: [_jsx("strong", { style: { display: 'block', marginBottom: '0.25rem', color: '#0f172a' }, children: option.label }), _jsx("span", { style: { fontSize: '0.85rem', color: '#64748b' }, children: option.description })] }, option.value))) })] }), _jsx("button", { type: "submit", className: "auth-button auth-button-primary", disabled: loading, children: loading ? 'Criando conta...' : 'Criar Conta' })] }), _jsx("div", { className: "auth-switch", children: _jsxs("p", { children: ["J\u00E1 tem uma conta?", ' ', _jsx("button", { type: "button", onClick: onSwitchToLogin, className: "auth-link", children: "Fazer login" })] }) })] }) }));
}
