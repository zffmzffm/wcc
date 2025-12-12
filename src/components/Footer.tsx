'use client';

/**
 * Footer component with copyright and disclaimer
 * Positioned at bottom-right on desktop, bottom on mobile
 */
export default function Footer() {
    return (
        <footer className="app-footer" role="contentinfo">
            <div className="footer-content">
                <p className="footer-copyright">
                    © 2025 SOCCER FAN GUIDE &apos;26. All rights reserved.
                </p>
                <p className="footer-disclaimer">
                    Disclaimer: This website is an unofficial fan project and is not affiliated with,
                    endorsed by, sponsored by, or associated with FIFA, the 2026 FIFA World Cup™,
                    or any official tournament organizers.
                </p>
            </div>
        </footer>
    );
}
