import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './SelectionCard.css';
export function SelectionCard({ title, imageUrl, price, selected, onClick }) {
    return (_jsxs("div", { className: `selection-card ${selected ? 'selected' : ''}`, onClick: onClick, role: "button", tabIndex: 0, onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onClick();
            }
        }, children: [_jsx("div", { className: "selection-card__image", children: imageUrl ? (_jsx("img", { src: imageUrl, alt: title })) : (_jsx("div", { className: "selection-card__placeholder", children: "\uD83D\uDCF7" })) }), _jsx("div", { className: "selection-card__check", children: "\u2713" }), _jsxs("div", { className: "selection-card__content", children: [_jsx("h4", { className: "selection-card__title", children: title }), price && _jsx("span", { className: "selection-card__price", children: price })] })] }));
}
