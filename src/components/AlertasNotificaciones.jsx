import { useState } from 'react';
import AlertCard from './AlertCard';

/**
 * Componente Alertas y Notificaciones
 * Muestra un resumen y lista de alertas de stock y vencimiento
 * 
 * Props:
 * @param {Object} alertas - Objeto con { stockBajo, porVencer, total, resumen }
 * @param {Function} onVerProducto - Callback cuando se click en una alerta
 * @param {boolean} expandido - Si mostrar lista expandida (default: false)
 */
const AlertasNotificaciones = ({ 
  alertas = { stockBajo: [], porVencer: [], total: 0, resumen: {} },
  onVerProducto = () => {},
  expandido = false
}) => {
  const [mostrarDetalle, setMostrarDetalle] = useState(expandido);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'stock', 'vencimiento'

  if (alertas.total === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
        <p className="text-green-700 font-bold">✅ Todo en orden</p>
        <p className="text-green-600 text-sm">No hay alertas de stock ni vencimiento</p>
      </div>
    );
  }

  // Filtrar alertas según tipo
  let alertasAMostrar = [];
  if (filtroTipo === 'stock') {
    alertasAMostrar = alertas.stockBajo;
  } else if (filtroTipo === 'vencimiento') {
    alertasAMostrar = alertas.porVencer;
  } else {
    alertasAMostrar = [...alertas.stockBajo, ...alertas.porVencer];
  }

  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
      {/* Header con Resumen */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-orange-100">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 mb-1">
            🔔 Alertas y Notificaciones
          </h2>
          <p className="text-sm text-gray-600">
            {alertas.total} alerta{alertas.total !== 1 ? 's' : ''} activa{alertas.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => setMostrarDetalle(!mostrarDetalle)}
          className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
        >
          {mostrarDetalle ? 'Ocultar' : 'Ver Detalle'}
        </button>
      </div>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Stock Bajo */}
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
          <p className="text-3xl font-bold text-red-600">
            {alertas.stockBajo.length}
          </p>
          {alertas.resumen.stockBajoCritico > 0 && (
            <p className="text-xs text-red-600 mt-1">
              🔴 {alertas.resumen.stockBajoCritico} crítico
            </p>
          )}
        </div>

        {/* Vencimiento */}
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
          <p className="text-sm text-gray-600 mb-1">Por Vencer (7 días)</p>
          <p className="text-3xl font-bold text-yellow-600">
            {alertas.porVencer.length}
          </p>
          {alertas.resumen.productosVencidos > 0 && (
            <p className="text-xs text-red-600 mt-1">
              ❌ {alertas.resumen.productosVencidos} vencido{alertas.resumen.productosVencidos !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Total de Alertas</p>
          <p className="text-3xl font-bold text-orange-600">
            {alertas.total}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Requieren atención
          </p>
        </div>
      </div>

      {/* Detalle de Alertas */}
      {mostrarDetalle && (
        <div className="mt-6">
          {/* Filtros */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1 rounded text-sm font-bold transition ${
                filtroTipo === 'todos'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos ({alertas.total})
            </button>
            <button
              onClick={() => setFiltroTipo('stock')}
              className={`px-3 py-1 rounded text-sm font-bold transition ${
                filtroTipo === 'stock'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Stock ({alertas.stockBajo.length})
            </button>
            <button
              onClick={() => setFiltroTipo('vencimiento')}
              className={`px-3 py-1 rounded text-sm font-bold transition ${
                filtroTipo === 'vencimiento'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Vencimiento ({alertas.porVencer.length})
            </button>
          </div>

          {/* Lista de Alertas */}
          <div className="max-h-96 overflow-y-auto">
            {alertasAMostrar.length > 0 ? (
              alertasAMostrar.map(alerta => (
                <AlertCard
                  key={`${alerta.tipo}-${alerta.id}`}
                  alerta={alerta}
                  onAccion={onVerProducto}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No hay alertas de este tipo</p>
              </div>
            )}
          </div>

          {/* Acciones Rápidas */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
            <button
              className="flex-1 px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
              onClick={() => alert('Marcar todas las alertas como revisadas')}
            >
              ✓ Marcar como Revisado
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
              onClick={() => alert('Generar reporte de alertas')}
            >
              📊 Generar Reporte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasNotificaciones;
