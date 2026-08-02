import React from 'react';

interface MinecraftAvatarProps {
    src: string;
    alt?: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    fallback?: string;
}

/**
 * Componente inteligente que renderiza:
 * 1. Un recorte de la cara si el SRC es una URL de skin de Minecraft (.png o minecraftskins)
 * 2. Un avatar normal (mc-heads) si es un Nickname.
 * 3. Una imagen normal si es cualquier otra URL.
 */
const MinecraftAvatar: React.FC<MinecraftAvatarProps> = ({ 
    src, 
    alt = "Avatar", 
    size = 120, 
    className = "", 
    style = {},
    fallback = "https://mc-heads.net/avatar/MHF_Steve"
}) => {
    
    // Detectar si es una URL de textura desarmada (64x64) de MC que requiere recorte CSS
    const isSkinTexture = React.useMemo(() => {
        if (!src) return false;
        const s = src.toLowerCase();
        return (
            s.includes('/skins/') ||
            s.endsWith('.png') ||
            s.includes('minotar.net/skin') ||
            s.includes('minecraftskins.com/uploads/skins') ||
            s.includes('textures.minecraft.net/texture') ||
            s.includes('crafatar.com/skins')
        );
    }, [src]);

    // Si no hay src o es un nickname corto, usamos mc-heads (fallback interno)
    const finalSrc = src || 'MHF_Steve';
    
    // Si es un Nickname (no una URL o ruta de archivo local)
    const isUrl = finalSrc.startsWith('http') || finalSrc.startsWith('/') || finalSrc.includes('/');
    if (!isUrl) {
        return (
            <img 
                src={`https://mc-heads.net/avatar/${finalSrc}/${size}`}
                alt={alt}
                className={className}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    ...style
                }}
                onError={(e) => {
                    e.currentTarget.src = fallback;
                }}
            />
        );
    }

    // Si es una URL pero NO es una textura de skin (ej: un avatar ya recortado de imgur)
    if (!isSkinTexture) {
        return (
            <img 
                src={finalSrc}
                alt={alt}
                className={className}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    ...style
                }}
                onError={(e) => {
                    e.currentTarget.src = fallback;
                }}
            />
        );
    }

    /**
     * MAGIA CSS: Recorte de cara frontal
     * En una skin de 64x64, la cara frontal está en x=8, y=8 con tamaño 8x8.
     * background-size: 800% (porque 64/8 = 8)
     * background-position: 14.28% 14.28% (x/(64-8) = 8/56 = 14.28%)
     */
    return (
        <div 
            className={`mc-head-crop ${className}`}
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url("${finalSrc}")`,
                backgroundSize: '800%', // Zoom to 8x8 area
                backgroundPosition: '14.285% 14.285%', // Face frontal
                imageRendering: 'pixelated',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                ...style
            }}
            aria-label={alt}
        >
            {/* Capa de Accesorio (Hat/Helmet) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url("${finalSrc}")`,
                backgroundSize: '800%',
                backgroundPosition: '71.428% 14.285%', // Posición del Hat
                imageRendering: 'pixelated',
                backgroundRepeat: 'no-repeat',
            }} />
        </div>
    );
};

export default MinecraftAvatar;
