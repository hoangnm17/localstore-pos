import React from 'react';

const Toast = ({ type = 'success', message }) => {
    if (!message) return null;

    const styles = {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        background: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#f59e0b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'fadeInUp 0.3s ease',
    };

    const iconMap = {
        success: '✔',
        error: '✕',
        warning: '⚠',
    };

    return (
        <div style={styles}>
            <span>{iconMap[type] || '•'}</span>
            <span>{message}</span>
        </div>
    );
};

export default Toast;
