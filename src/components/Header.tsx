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
                <img src="/header-logo.png" alt="Cup26Map – World Cup 2026 Schedule & Interactive Map" className="header-brand-desktop" />

                {/* Mobile Version: Text and Trophy */}
                <div className="header-brand-mobile">
                    <span className="header-logo" aria-hidden="true">🏆</span>
                    <div className="header-title">
                        <h1><span className="header-brand-name">CUP26MAP</span> <span className="sr-only">– World Cup 2026 Schedule & Map</span></h1>
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
