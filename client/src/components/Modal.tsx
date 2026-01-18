import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose, actions }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                <div className="section-description">
                    {children}
                </div>
                {actions && (
                    <div className="modal-actions">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
