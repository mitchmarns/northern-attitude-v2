import React, { useEffect, useRef } from 'react';

/**
 * Reusable modal component
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.fullscreen - Whether the modal should be fullscreen
 */
const Modal = ({ title, children, onClose, fullscreen = false }) => {
  const modalRef = useRef(null);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Add body class to prevent scrolling when modal is open
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  // Close when clicking outside the modal content
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleOutsideClick}>
      <div 
        className={`modal-content ${fullscreen ? 'fullscreen-modal' : ''}`}
        ref={modalRef}
      >
        <span className="close-modal" onClick={onClose}>
          &times;
        </span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;