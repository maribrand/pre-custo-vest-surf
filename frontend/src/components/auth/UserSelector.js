import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './UserSelector.css';
const options = [
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
export function UserSelector({ currentRole, onSelectRole }) {
    return (_jsxs("section", { className: "user-selector", children: [_jsx("h2", { children: "Quem est\u00E1 usando o app?" }), _jsx("div", { className: "user-selector__options", children: options.map((option) => (_jsxs("button", { type: "button", className: `user-selector__card ${currentRole === option.value ? 'is-active' : ''}`, onClick: () => onSelectRole(option.value), children: [_jsx("strong", { children: option.label }), _jsx("span", { children: option.description })] }, option.value))) })] }));
}
