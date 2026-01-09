import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';
export function Login({ onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Erro ao fazer login');
            }
            // Se sucesso, o AuthContext vai atualizar automaticamente
        }
        catch (err) {
            setError('Erro inesperado ao fazer login');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h2", { children: "Login" }), _jsx("p", { className: "auth-subtitle", children: "Entre com sua conta para continuar" }), error && (_jsx("div", { className: "auth-error", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "seu@email.com", required: true, disabled: loading })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { htmlFor: "password", children: "Senha" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, disabled: loading })] }), _jsx("button", { type: "submit", className: "auth-button auth-button-primary", disabled: loading, children: loading ? 'Entrando...' : 'Entrar' })] }), _jsx("div", { className: "auth-switch", children: _jsxs("p", { children: ["N\u00E3o tem uma conta?", ' ', _jsx("button", { type: "button", onClick: onSwitchToRegister, className: "auth-link", children: "Cadastre-se" })] }) })] }) }));
}
