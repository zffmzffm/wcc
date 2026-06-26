'use client';

import { useState, useEffect, useCallback, memo } from 'react';

/**
 * Footer component with copyright and a privacy/legal link.
 * Click the link to open a modal with disclaimer and privacy notes.
 */
const Footer = memo(function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = useCallback(() => setIsModalOpen(false), []);

    useEffect(() => {
        if (!isModalOpen) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, closeModal]);

    return (
        <>
            <footer className="app-footer" role="contentinfo">
                <div className="footer-content footer-stacked">
                    <div className="footer-row footer-row-buttons">
                        <a
                            href="https://www.youtube.com/watch?v=WxOD7-CB0qI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-support-btn"
                        >
                            Video Guide
                        </a>
                        <a
                            href="https://ko-fi.com/duoyj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-support-btn"
                        >
                            Support the project
                        </a>
                    </div>
                    <div className="footer-row footer-row-legal">
                        <span className="footer-copyright">
                            Presented by <a href="https://duoyj.ca" target="_blank" rel="noopener noreferrer" className="footer-credit-link">duoyj.ca</a> | © 2026 Cup26Map
                        </span>
                        <span className="footer-separator">·</span>
                        <button
                            className="footer-legal-link"
                            onClick={openModal}
                            aria-label="Open privacy and legal information"
                        >
                            Privacy & Legal
                        </button>
                    </div>
                </div>
            </footer>

            {isModalOpen && (
                <div className="legal-modal-overlay" onClick={closeModal}>
                    <div
                        className="legal-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="legal-modal-title"
                    >
                        <div className="legal-modal-header">
                            <h2 id="legal-modal-title">Privacy & Legal</h2>
                            <button
                                className="legal-modal-close"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="legal-modal-body">
                            <p className="legal-copyright">
                                © 2026 Cup26Map. All rights reserved.
                            </p>
                            <p className="legal-disclaimer">
                                <strong>Disclaimer:</strong> This website is an unofficial fan project and is not affiliated with,
                                endorsed by, sponsored by, or associated with FIFA, the 2026 FIFA World Cup™,
                                or any official tournament organizers.
                            </p>
                            <p className="legal-disclaimer">
                                While we strive for accuracy, the information presented in this app may contain errors.
                                Please verify independently.
                            </p>
                            <p className="legal-disclaimer">
                                <strong>Privacy:</strong> Cup26Map does not require an account and does not collect personal
                                information through first-party forms. Map tiles, flags, video links, support links, and
                                creator links are served by third parties and may receive standard request metadata when
                                loaded or opened.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default Footer;
