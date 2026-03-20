export default function Tooltip({ children, texto, posicion = 'arriba' }) {
  const posicionesClases = {
    arriba: 'bottom-full mb-2',
    abajo: 'top-full mt-2',
    izq: 'right-full mr-2',
    der: 'left-full ml-2'
  };

  return (
    <div className="relative inline-block group">
      {children}
      
      {/* Tooltip */}
      <div
        className={`absolute ${posicionesClases[posicion]} left-1/2 transform -translate-x-1/2 
          bg-gray-900 text-white text-base rounded px-4 py-3 whitespace-normal min-w-[240px]
          opacity-0 group-hover:opacity-100 pointer-events-none
          z-40 shadow-lg`}
      >
        {texto}
        {/* Flecha */}
        <div
          className={`absolute w-2 h-2 bg-gray-900 transform rotate-45
            ${posicion === 'arriba' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
            ${posicion === 'abajo' ? 'bottom-full left-1/2 -translate-x-1/2 mb-0' : ''}
            ${posicion === 'izq' ? 'left-full top-1/2 -translate-y-1/2 ml-0' : ''}
            ${posicion === 'der' ? 'right-full top-1/2 -translate-y-1/2 mr-0' : ''}
          `}
        ></div>
      </div>
    </div>
  );
}
