'use client';
import { ReactNode, forwardRef } from 'react';
import FlagIcon from './FlagIcon';

interface SidebarLayoutProps {
    /** Whether sidebar is on the right side */
    position?: 'left' | 'right';
    /** ARIA label for accessibility */
    ariaLabel: string;
    /** Icon or flag code to display in header */
    iconCode?: string;
    /** Title text for the header */
    title: string;
    /** Placeholder state when no content is selected */
    placeholder?: {
        icon: string;
        line1: string;
        line2: string;
    };
    /** Whether to show the placeholder state */
    showPlaceholder?: boolean;
    /** Optional badge content (e.g., group letter) */
    badge?: ReactNode;
    /** Close button handler */
    onClose: () => void;
    /** Content to render in the sidebar body */
    children: ReactNode;
}

/**
 * Shared sidebar layout component used by CitySidebar and TeamScheduleSidebar.
 * Provides consistent header, placeholder, and styling across sidebars.
 */
const SidebarLayout = forwardRef<HTMLElement, SidebarLayoutProps>(function SidebarLayout(
    {
        position = 'left',
        ariaLabel,
        iconCode,
        title,
        placeholder,
        showPlaceholder = false,
        badge,
        onClose,
        children
    },
    ref
) {
    const sidebarClass = position === 'right' ? 'sidebar sidebar-right' : 'sidebar';

    // Render placeholder state
    if (showPlaceholder && placeholder) {
        return (
            <aside className={sidebarClass} role="complementary" aria-label={ariaLabel}>
                <div className="sidebar-placeholder">
                    <span className="sidebar-placeholder-icon">{placeholder.icon}</span>
                    <p>{placeholder.line1}</p>
                    <p>{placeholder.line2}</p>
                </div>
            </aside>
        );
    }

    // Render active state with content
    return (
        <aside ref={ref} className={sidebarClass} role="complementary" aria-label={ariaLabel}>
            {/* Header */}
            <div className="sidebar-header sidebar-header-compact">
                <div className="sidebar-title">
                    {iconCode && <FlagIcon code={iconCode} size={28} />}
                    <h2>{title}</h2>
                </div>
                <div className="sidebar-header-actions">
                    {badge}
                    <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
                        ✕
                    </button>
                </div>
            </div>

            {/* Body content */}
            {children}
        </aside>
    );
});

export default SidebarLayout;
