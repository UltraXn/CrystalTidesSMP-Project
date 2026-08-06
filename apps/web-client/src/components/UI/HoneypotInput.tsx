import React from 'react';

interface HoneypotInputProps {
    name?: string;
}

/**
 * HoneypotInput Component
 * Rendered with off-screen positioning CSS (left: -9999px, opacity: 0).
 * Completely invisible to human users, but auto-completed by automated bots/crawlers.
 */
export const HoneypotInput: React.FC<HoneypotInputProps> = ({ name = 'confirm_email' }) => {
    return (
        <div
            style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                opacity: 0,
                pointerEvents: 'none',
                height: 0,
                width: 0,
                overflow: 'hidden'
            }}
            aria-hidden="true"
        >
            <label htmlFor={`hp_${name}`}>Confirm Email (Leave Empty)</label>
            <input
                id={`hp_${name}`}
                type="text"
                name={name}
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
            />
        </div>
    );
};

export default HoneypotInput;
