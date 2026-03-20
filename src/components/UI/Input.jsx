/**
 * Componente Input reutilizable
 * Elimina duplicación de estilos de inputs
 */
const Input = ({ 
  label, 
  id, 
  type = 'text', 
  placeholder = '', 
  value = '', 
  onChange = null,
  disabled = false,
  error = '',
  required = false,
  className = '',
  ...props 
}) => {
  const baseInputClass = 'border-2 border-gray-200 w-full p-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all';
  
  const errorInputClass = error ? 'border-red-500 focus:ring-red-200 focus:border-red-400' : '';

  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-gray-700 uppercase font-bold text-sm mb-2"
          aria-label={label}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input 
        type={type} 
        id={id}
        placeholder={placeholder}
        className={`${baseInputClass} ${errorInputClass} ${className}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        {...props}
      />
      {error && (
        <p className="text-red-600 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
