import { useTranslation } from "react-i18next";
import "../../styles/layout/loader.css";

interface LoaderProps {
    text?: string;
    style?: React.CSSProperties;
    minimal?: boolean;
    fullScreen?: boolean;
    size?: number;
}

export default function Loader({ text, style, minimal, fullScreen, size }: LoaderProps) {
    const { t } = useTranslation();

    // In minimal mode, we only show a small spinner
    if (minimal) {
        const sizeStyle: React.CSSProperties = size
            ? { width: size, height: size, fontSize: size * 0.6, ...style }
            : style ?? {};
        return (
            <div className="loader-minimal" style={sizeStyle}>
                <div className="prism-glass">
                    <div className="spinner"></div>
                </div>
                {text && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>{text}</span>}
            </div>
        );
    }

    const displayText = text === "" ? null : (text || t('common.loading_content'));

    return (
        <div className={`premium-loader-container ${fullScreen ? 'loader-fullscreen' : ''}`} style={style}>
            <div className="loader-visual-wrapper">
                {/* Prism Body */}
                <div className="prism-container">
                    <div className="prism-glass">
                        <div className="loader-logo-wrapper">
                            <img
                                src="/images/ui/logo.webp"
                                alt="Crystal Tides"
                            />
                        </div>
                    </div>
                </div>

                {/* Effect Layers */}
                <div className="prism-rays">
                    <div className="ray ray-1"></div>
                    <div className="ray ray-2"></div>
                    <div className="ray ray-3"></div>
                    <div className="ray ray-4"></div>
                    <div className="ray ray-5"></div>
                </div>

                <div className="particles">
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                    <div className="particle p4"></div>
                </div>
            </div>

            {displayText && (
                <div className="loader-text-wrapper">
                    <div className="loader-text-premium">
                        {displayText}
                    </div>
                    <div className="loader-subtitle">
                        {t('common.please_wait', 'Please wait...')}
                    </div>
                </div>
            )}
        </div>
    )
}
