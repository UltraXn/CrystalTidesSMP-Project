
export default function ServerWidgets() {
    return (
        <div className="widgets-container">
            <div className="widget-wrapper discord-widget">
                <iframe
                    src="https://discord.com/widget?id=922461634121846815&theme=dark"
                    width="350"
                    height="500"
                    allowTransparency="true"
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
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
                ></iframe>
            </div>
        </div>
    );
}
