import React, { useEffect } from 'react';

function ModalShell({
    open,
    title,
    subtitle,
    children,
    width = '900px',
    onClose,
    footer = null
}) {
    useEffect(() => {
        if (!open) return undefined;

        const oldOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = oldOverflow;
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                role="document"
                style={{ maxWidth: width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title fw-bold mb-1">{title}</h5>
                            {subtitle ? <div className="text-muted small">{subtitle}</div> : null}
                        </div>

                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">{children}</div>

                    {footer ? <div className="modal-footer">{footer}</div> : null}
                </div>
            </div>
        </div>
    );
}

export default ModalShell;