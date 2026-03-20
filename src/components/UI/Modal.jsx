/**
 * Componente Modal base y reutilizable
 * Elimina duplicación de estructura HTML en 10+ modales
 * 
 * Props:
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar modal
 * @param {string} title - Título del modal
 * @param {ReactElement} children - Contenido del modal
 * @param {string} size - Tamaño: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} closeOnBackdrop - Cerrar al clickear backdrop (default: true)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnBackdrop = true,
  className = ''
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl mx-4 ${sizes[size]} ${className}`}>
        {/* Header con título y botón cerrar */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 
              id="modal-title"
              className="text-xl font-bold text-gray-800"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Cerrar modal"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
