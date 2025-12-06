'use client';
import { ReactNode } from 'react';

interface HeaderProps {
    children?: ReactNode;
    selectedTeam?: { name: string; flag: string; group: string } | null;
}

export default function Header({ children, selectedTeam }: HeaderProps) {
    return (
        <header className="header">
            <div className="header-brand">
                <span className="header-logo">🏆</span>
                <div className="header-title">
                    <h1>FIFA World Cup 2026</h1>
                    <span className="header-subtitle">美国 · 加拿大 · 墨西哥</span>
                </div>
            </div>

            <nav className="header-nav">
                {children}
            </nav>

            {selectedTeam && (
                <div className="header-team-info">
                    <span className="team-badge">
                        <span className="badge-flag">{selectedTeam.flag}</span>
                        <span className="badge-name">{selectedTeam.name}</span>
                        <span className="badge-group">小组 {selectedTeam.group}</span>
                    </span>
                </div>
            )}
        </header>
    );
}
