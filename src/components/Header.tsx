'use client';
import { ReactNode, memo } from 'react';

interface HeaderProps {
    children?: ReactNode;
    onReset?: () => void;
}

const Header = memo(function Header({ children, onReset }: HeaderProps) {
    return (
        <header className="header" role="banner">
            <div
                className="header-brand"
                onClick={onReset}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onReset?.(); }}
                title="Reset all selections"
                style={{ cursor: 'pointer' }}
            >
                {/* Desktop Version: Image Logo */}
                <img src="/header-logo.png" alt="CUP26MAP Logo" className="header-brand-desktop" />

                {/* Mobile Version: Text and Trophy */}
                <div className="header-brand-mobile">
                    <span className="header-logo" aria-hidden="true">🏆</span>
                    <div className="header-title">
                        <h1>CUP26MAP</h1>
                        <span className="header-tagline">16 Cities • 48 Teams • 39 Days • One Map</span>
                    </div>
                </div>
            </div>

            <nav className="header-nav" aria-label="Main navigation">
                {children}
            </nav>
        </header>
    );
});

export default Header;
