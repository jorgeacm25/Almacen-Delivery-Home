/**
 * Componente Tarjeta de Alerta individual
 * Muestra información sobre un producto con alerta
 */
const AlertCard = ({ alerta, onAccion }) => {
  const isStockAlert = alerta.tipo === 'stock';
  
  // Colores según severidad
  const severidadStyles = {
    critica: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      badge: 'bg-red-500 text-white',
      icon: '🔴',
      text: 'CRÍTICO'
    },
    alta: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      badge: 'bg-yellow-500 text-white',
      icon: '🟡',
      text: 'ALTO'
    }
  };

  const style = severidadStyles[alerta.severidad];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded-lg mb-3 flex items-start justify-between hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3 flex-1">
        {/* Icono */}
        <div className="text-2xl mt-1">{style.icon}</div>
        
        {/* Contenido */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800">{alerta.nombre}</h3>
            <span className={`${style.badge} px-2 py-1 text-xs font-bold rounded`}>
              {style.text}
            </span>
          </div>

          {isStockAlert ? (
            // Alerta de Stock
            <div className="text-sm text-gray-600">
              <p>
                <strong>Stock actual:</strong> {alerta.cantidad} {alerta.unidad}
              </p>
              <p>
                <strong>Mínimo recomendado:</strong> {alerta.umbral} {alerta.unidad}
              </p>
              <p className="text-red-600 mt-1">
                ⚠️ Falta: {alerta.umbral - alerta.cantidad} {alerta.unidad}
              </p>
            </div>
          ) : (
            // Alerta de Vencimiento
            <div className="text-sm text-gray-600">
              <p>
                <strong>Fecha vencimiento:</strong> {alerta.fechaVencimiento}
              </p>
              {alerta.vencido ? (
                <p className="text-red-600 font-bold mt-1">
                  ❌ PRODUCTO VENCIDO
                </p>
              ) : (
                <p className="text-orange-600 mt-1">
                  ⏰ Vence en {alerta.diasRestantes} día{alerta.diasRestantes !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón de acción */}
      {onAccion && (
        <button
          onClick={() => onAccion(alerta)}
          className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition whitespace-nowrap"
        >
          Ver
        </button>
      )}
    </div>
  );
};

export default AlertCard;
