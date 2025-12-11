'use client';
import { ReactNode } from 'react';

interface HeaderProps {
    children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
    return (
        <header className="header" role="banner">
            <div className="header-brand">
                <span className="header-logo" aria-hidden="true">🏆</span>
                <div className="header-title">
                    <h1>SOCCER FAN GUIDE &apos;26</h1>
                </div>
            </div>

            <nav className="header-nav" aria-label="Main navigation">
                {children}
            </nav>
        </header>
    );
}
