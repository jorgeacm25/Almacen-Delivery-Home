/**
 * Componente Button reutilizable
 * Elimina duplicación de estilos en toda la aplicación
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  type = 'button',
  disabled = false,
  onClick = null,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-bold rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
    danger: 'border-2 border-red-500 bg-red-50 text-red-700 hover:bg-red-100',
    warning: 'border-2 border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    secondary: 'border-2 border-gray-400 bg-gray-50 text-gray-700 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    full: 'w-full px-4 py-3 text-sm',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button 
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
