import { useState, useEffect } from 'react';

const InterfazHistorial = () => {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
  const fetchHistorial = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5228/api/history', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Ordenar de más antiguo a más reciente
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setItems(sorted);
      } else {
        throw new Error('La respuesta no es un array');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };
  fetchHistorial();
}, []);

  const getEstilo = (tipo) => {
    const t = (tipo || '').toLowerCase();
    if (t.includes('entrada')) return 'bg-green-100 text-green-700 border-green-300';
    if (t.includes('salida')) return 'bg-red-100 text-red-700 border-red-300';
    if (t.includes('creac')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (t.includes('elimin')) return 'bg-red-100 text-red-700 border-red-300';
    if (t.includes('modific')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (t.includes('login')) return 'bg-purple-100 text-purple-700 border-purple-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const formatearFecha = (f) => {
    if (!f) return '—';
    return new Date(f).toLocaleString('es-CU', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  };

  const filtrados = items.filter(item => {
    if (filtro !== 'todos' && item.actionType !== filtro) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        item.actionType.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.userOrAdminUserName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (cargando) return <div className="p-8 text-center">Cargando historial...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white/95 rounded-2xl shadow-xl p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-purple-600 mb-6">Historial de Movimientos</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 p-3 border-2 border-purple-200 rounded-lg"
        />
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="sm:w-48 p-3 border-2 border-purple-200 rounded-lg">
          <option value="todos">Todos</option>
          <option value="Entrada">Entradas</option>
          <option value="Salida">Salidas</option>
          <option value="Modificación">Modificaciones</option>
          <option value="Creaciones">Creaciones</option>
          <option value="Eliminaciones">Eliminaciones</option>
          <option value="Login">Login/Logout</option>
        </select>
      </div>

      <div className="border-2 border-purple-100 rounded-lg overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          {filtrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No hay registros</div>
          ) : (
            <div className="divide-y divide-purple-100">
              {filtrados.map(item => (
                <div
                  key={item.id}
                  onClick={() => setDetalle(item)}
                  className="p-4 hover:bg-purple-50 cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg ${getEstilo(item.actionType)} text-lg`}>
                      {item.actionType === 'Entrada' ? '📥' : item.actionType === 'Salida' ? '📤' : '📋'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold">{item.actionType}</span>
                        <span className="text-xs text-gray-500">{formatearFecha(item.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${getEstilo(item.actionType)}`}>{item.actionType}</span>
                        <span>por: {item.userOrAdminUserName}</span>
                        <span className="text-purple-600">Ver detalles →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {detalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <h3 className="text-xl font-bold">{detalle.actionType}</h3>
              <button onClick={() => setDetalle(null)} className="text-2xl font-bold">✕</button>
            </div>
            <div className="space-y-4 mt-4">
              <div><span className="font-bold">Fecha:</span> {formatearFecha(detalle.createdAt)}</div>
              <div><span className="font-bold">Usuario:</span> {detalle.userOrAdminUserName}</div>
              <div><span className="font-bold">Descripción:</span> {detalle.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfazHistorial;