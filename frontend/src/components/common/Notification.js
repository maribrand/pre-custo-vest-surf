import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
export function Notification({ message, type, onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);
    if (!message)
        return null;
    const styles = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: '#fff',
        backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 50,
        animation: 'slideIn 0.3s ease-out',
        fontWeight: 500,
    };
    return (_jsx("div", { style: styles, children: message }));
}
