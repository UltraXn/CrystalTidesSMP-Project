import { ShieldAlert } from 'lucide-react';

interface PermissionDeniedProps {
    message?: string;
    requiredRole?: string;
}

export default function PermissionDenied({ 
    message = 'No tienes permisos para acceder a esta sección.',
    requiredRole 
}: PermissionDeniedProps) {
    return (
        <div 
            className="permission-denied-container" 
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                textAlign: 'center',
                minHeight: '400px',
                background: 'rgba(10, 10, 15, 0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                color: '#fff'
            }}
        >
            <div style={{
                background: 'rgba(255, 59, 48, 0.1)',
                padding: '1.5rem',
                borderRadius: '50%',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255, 59, 48, 0.2)'
            }}>
                <ShieldAlert 
                    size={48} 
                    style={{ 
                        color: '#ff3b30' 
                    }} 
                />
            </div>
            <h2 style={{ 
                marginBottom: '0.75rem',
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.5px'
            }}>
                Acceso Denegado
            </h2>
            <p style={{ 
                opacity: 0.6, 
                maxWidth: '450px',
                lineHeight: 1.6,
                fontSize: '1.1rem',
                marginBottom: '1.5rem',
                color: 'rgba(255, 255, 255, 0.8)'
            }}>
                {message}
            </p>
            {requiredRole && (
                <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.9rem', 
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{ opacity: 0.5 }}>Rol requerido:</span>
                    <strong style={{ color: '#ff3b30', fontFamily: 'monospace', fontSize: '1rem' }}>{requiredRole.toUpperCase()}</strong>
                </div>
            )}
        </div>
    );
}
