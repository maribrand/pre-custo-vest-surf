import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Card.css';
export function Card({ title, description, children }) {
    return (_jsxs("article", { className: "card", children: [_jsxs("header", { children: [_jsx("h3", { children: title }), description && _jsx("p", { className: "card__description", children: description })] }), children && _jsx("div", { className: "card__content", children: children })] }));
}
