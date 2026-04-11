'use client';

import { useState, useEffect, useCallback, memo } from 'react';

/**
 * Footer component with copyright and a Legal link
 * Click the link to open a modal with disclaimer
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
                <div className="footer-content footer-split">
                    <div className="footer-left">
                        <span className="footer-copyright">
                            © 2026 Cup26Map
                        </span>
                        <span className="footer-separator">·</span>
                        <button
                            className="footer-legal-link"
                            onClick={openModal}
                            aria-label="Open legal disclaimer"
                        >
                            Legal
                        </button>
                    </div>
                    <div className="footer-right">
                        <a
                            href="https://ko-fi.com/duoyj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-support-btn"
                        >
                            Support the project
                        </a>
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
                            <h2 id="legal-modal-title">Legal Disclaimer</h2>
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
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default Footer;
