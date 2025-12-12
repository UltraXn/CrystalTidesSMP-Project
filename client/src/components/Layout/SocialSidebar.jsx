import { FaDiscord, FaTwitter, FaTwitch } from 'react-icons/fa';

export default function SocialSidebar() {
    return (
        <div className="social-sidebar">
            <a href="https://x.com/KilluBysmali" target="_blank" rel="noreferrer" className="social-link twitter" aria-label="Twitter">
                <FaTwitter />
            </a>
            <a href="https://discord.com/invite/TDmwYNnvyT" target="_blank" rel="noreferrer" className="social-link discord" aria-label="Discord">
                <FaDiscord />
            </a>
            <a href="https://www.twitch.tv/killubysmalivt" target="_blank" rel="noreferrer" className="social-link twitch" aria-label="Twitch">
                <FaTwitch />
            </a>
        </div>
    );
}
