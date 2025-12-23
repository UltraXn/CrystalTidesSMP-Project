import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export default function ServerWidgets() {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
        threshold: 0.1,
        triggerOnce: true
    })

    return (
        <div className="widgets-container" ref={ref} style={{ minHeight: '500px' }}>
            {isVisible ? (
                <>
                    <div className="widget-wrapper discord-widget">
                        <iframe
                            src="https://discord.com/widget?id=922461634121846815&theme=dark"
                            width="350"
                            height="500"
                            allowTransparency={true}
                            frameBorder="0"
                            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                            title="Discord Widget"
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div className="widget-wrapper twitch-widget">
                        <iframe
                            src="https://player.twitch.tv/?channel=killubysmalivt&parent=localhost&parent=127.0.0.1"
                            height="400"
                            width="100%"
                            allowFullScreen={true}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            frameBorder="0"
                            title="Twitch Stream"
                            loading="lazy"
                        ></iframe>
                    </div>
                </>
            ) : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '500px',
                    color: 'var(--muted)',
                    border: '1px dashed var(--border)',
                    borderRadius: '12px'
                }}>
                    Cargando integración social...
                </div>
            )}
        </div>
    );
}
