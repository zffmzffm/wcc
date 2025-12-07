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
                    <h1>FIFA World Cup 2026</h1>
                    <span className="header-subtitle">美国 · 加拿大 · 墨西哥</span>
                </div>
            </div>

            <nav className="header-nav" aria-label="主导航">
                {children}
            </nav>
        </header>
    );
}
