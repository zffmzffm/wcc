'use client';
import { ReactNode, memo } from 'react';

interface HeaderProps {
    children?: ReactNode;
}

const Header = memo(function Header({ children }: HeaderProps) {
    return (
        <header className="header" role="banner">
            <div className="header-brand">
                <span className="header-logo" aria-hidden="true">🏆</span>
                <div className="header-title">
                    <h1>CUP26MAP</h1>
                    <span className="header-tagline">16 Cities • 48 Teams • 39 Days • One Map</span>
                </div>
            </div>

            <nav className="header-nav" aria-label="Main navigation">
                {children}
            </nav>
        </header>
    );
});

export default Header;
