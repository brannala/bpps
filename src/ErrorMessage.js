import React from 'react';
import './ErrorMessage.css';

// Inline error message - appears near the source of the error
function ErrorMessage({ message, onDismiss }) {
    if (!message) return null;

    return (
        <div className="error-message">
            <span className="error-icon">!</span>
            <span className="error-text">{message}</span>
            {onDismiss && (
                <button className="error-dismiss" onClick={onDismiss} title="Dismiss">
                    &times;
                </button>
            )}
        </div>
    );
}

// Error banner - for more prominent errors at the top of a section
function ErrorBanner({ message, onDismiss }) {
    if (!message) return null;

    return (
        <div className="error-banner">
            <span className="error-icon">!</span>
            <span className="error-text">{message}</span>
            {onDismiss && (
                <button className="error-dismiss" onClick={onDismiss} title="Dismiss">
                    &times;
                </button>
            )}
        </div>
    );
}

// Warning banner - for non-critical warnings
function WarningBanner({ message, onDismiss }) {
    if (!message) return null;

    return (
        <div className="warning-banner">
            <span className="warning-icon">!</span>
            <span className="warning-text">{message}</span>
            {onDismiss && (
                <button className="warning-dismiss" onClick={onDismiss} title="Dismiss">
                    &times;
                </button>
            )}
        </div>
    );
}

export { ErrorMessage, ErrorBanner, WarningBanner };
