import React from "react";
import { useEffect, useState } from "react";
import CloseButton from "../components/close-button";

// Header styles
const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e5e5e5',
    backgroundColor: '#f8f9fa',
    minHeight: '60px',
    flexShrink: 0,
};

// Title styles
const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#333333',
    flex: 1,
};

// Overlay styles
const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    transition: 'opacity 0.3s ease-in-out',
};

// Panel container styles
const panelContainerStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: `400px`,
    backgroundColor: '#ffffff',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

// Content styles
const contentStyles: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    overflowX: 'hidden',
};

interface SlideInTabProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

const SlideInTab: React.FC<React.PropsWithChildren<SlideInTabProps>> = ({ isOpen, onClose, title = 'Side Panel', children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
          setIsVisible(true);
          // Small delay to ensure the element is rendered before starting animation
          setTimeout(() => setIsAnimating(true), 10);
        } else {
          setIsAnimating(false);
          // Wait for animation to complete before hiding the element
          const timer = setTimeout(() => setIsVisible(false), 300);
          return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Click outside to close handler
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Handle escape key press
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
    
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scrolling when panel is open
            document.body.style.overflow = 'hidden';
        }
    
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isVisible && !isOpen) {
        return null;
    }

    return (
        <>
            <div style={{ ...overlayStyles, opacity: isAnimating ? 1 : 0, visibility: isVisible ? 'visible' : 'hidden', pointerEvents: isAnimating ? 'auto' : 'none' }} onClick={handleOverlayClick} aria-hidden="true" />
            <div style={{ ...panelContainerStyles, transform: isAnimating ? 'translateX(0)' : 'translateX(100%)', visibility: isVisible ? 'visible' : 'hidden' }} role="dialog" aria-modal="true" aria-labelledby="slide-tab-title">
                <div style={headerStyles}>
                    <h2 id="slide-tab-title" style={titleStyles}>{title}</h2>
                    <CloseButton onClick={onClose} />
                </div>
                <div style={contentStyles}>{children}</div>
            </div>
        </>
    );
}

export default SlideInTab;