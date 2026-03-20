import { useState } from 'react';

const InterfazHistorial = ({ historial }) => {
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const getColorPorTipo = (tipo) => {
    switch(tipo) {
      case 'entrada': return 'bg-green-100 text-green-700 border-green-300';
      case 'salida': return 'bg-red-100 text-red-700 border-red-300';
      case 'modificacion': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'creacion': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'eliminacion': return 'bg-red-100 text-red-700 border-red-300';
      case 'login': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'logout': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'registro': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getIconoPorTipo = (tipo) => {
    switch(tipo) {
      case 'entrada':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'salida':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case 'modificacion':
      case 'creacion':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'eliminacion':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const historialFiltrado = historial.filter(entry => {
    // Filtrar por tipo
    if (filtro !== 'todos' && entry.tipo !== filtro) return false;
    
    // Filtrar por búsqueda
    if (busqueda) {
      const textoBusqueda = busqueda.toLowerCase();
      return (
        entry.accion.toLowerCase().includes(textoBusqueda) ||
        entry.detalle.toLowerCase().includes(textoBusqueda) ||
        entry.usuario.toLowerCase().includes(textoBusqueda)
      );
    }
    
    return true;
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">Historial de Movimientos</h2>
      
      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar en historial..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="modificacion">Modificaciones</option>
            <option value="creacion">Creaciones</option>
            <option value="eliminacion">Eliminaciones</option>
            <option value="login">Login/Logout</option>
          </select>
        </div>
      </div>

      {/* Lista de historial */}
      <div className="border-2 border-purple-100 rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          {historialFiltrado.length > 0 ? (
            <div className="divide-y divide-purple-100">
              {historialFiltrado.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-purple-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`p-2 rounded-lg ${getColorPorTipo(entry.tipo)}`}>
                      {getIconoPorTipo(entry.tipo)}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                        <span className="font-bold text-gray-800">{entry.accion}</span>
                        <span className="text-xs text-gray-500">{entry.fecha}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{entry.detalle}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getColorPorTipo(entry.tipo)}`}>
                          {entry.tipo}
                        </span>
                        <span className="text-xs text-gray-500">por: {entry.usuario}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay registros que coincidan con los filtros
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        Total de registros: {historialFiltrado.length}
      </div>
    </div>
  );
};

export default InterfazHistorial;