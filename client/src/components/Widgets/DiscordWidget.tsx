

const DiscordWidget = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '2rem',
            marginBottom: '2rem'
        }}>
            <div style={{
                position: 'relative',
                width: '350px',
                height: '500px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(137, 217, 209, 0.2)', // Cyan crystal border
                background: 'rgba(11, 12, 16, 0.5)', // Dark semi-transparent bg
                backdropFilter: 'blur(4px)'
            }}>
                {/* Glow effect behind */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(88, 101, 242, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: -1
                }}></div>

                <iframe 
                    src="https://discord.com/widget?id=922461634121846815&theme=dark" 
                    width="350" 
                    height="500" 
                    allowTransparency={true} 
                    frameBorder="0" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    style={{
                        position: 'relative',
                        zIndex: 1
                    }}
                ></iframe>
            </div>
        </div>
    );
};

export default DiscordWidget;
