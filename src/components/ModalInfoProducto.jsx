import { useState, useEffect } from 'react';

const ModalInfoProducto = ({ producto, onCerrar }) => {
  const [historialProducto, setHistorialProducto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5228/api/history', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();

        const nombreProducto = (producto?.nombre || '').toLowerCase();

        // Filtrar entradas que mencionen el producto
        const filtrados = data.filter(item => {
          const user = (item.userOrAdminUserName || '').toLowerCase();
          const descripcion = (item.description || '').toLowerCase();
          // Coincide si el nombre del producto está en userOrAdminUserName o en la descripción
          return user.includes(nombreProducto) || descripcion.includes(nombreProducto);
        });

        // Mapear al formato que espera el componente (tipo 'entrada'/'salida')
        const mapeados = filtrados.map(item => {
          let tipo = 'movimiento';
          if (item.actionType === 'Entrada') tipo = 'entrada';
          else if (item.actionType === 'Salida') tipo = 'salida';
          else if (item.actionType === 'Creaciones') tipo = 'creacion';
          else if (item.actionType === 'Eliminaciones') tipo = 'eliminacion';
          else if (item.actionType === 'Modificación') tipo = 'modificacion';
          return {
            id: item.id,
            tipo: tipo,
            accion: item.actionType,
            detalle: item.description,
            fecha: new Date(item.createdAt).toLocaleString('es-CU', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit'
            }).replace(',', ''),
            usuario: item.userOrAdminUserName
          };
        });

        setHistorialProducto(mapeados);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el historial del producto.');
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [producto]); // Se vuelve a cargar si cambia el producto

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-purple-600 mb-4">Información del Producto</h3>
        
        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">ID</p>
            <p className="text-base sm:text-lg font-bold">{producto.id}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="text-base sm:text-lg font-bold">{producto.nombre}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Cantidad</p>
            <p className="text-base sm:text-lg font-bold">{producto.cantidad} {producto.unidad}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Fecha de Entrada</p>
            <p className="text-base sm:text-lg font-bold">{producto.fechaEntrada}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
            <p className="text-base sm:text-lg font-bold">{producto.fechaVencimiento || 'No especificada'}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Operador</p>
            <p className="text-base sm:text-lg font-bold">{producto.operador || 'No especificado'}</p>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2">Historial de Movimientos del Producto</p>
            {cargando ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando historial...</p>
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
            ) : historialProducto.length > 0 ? (
              <div className="max-h-56 overflow-y-auto border border-purple-200 rounded-lg divide-y divide-purple-100">
                {historialProducto.map((entrada) => (
                  <div key={entrada.id} className="p-3 bg-purple-50/40">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        entrada.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 
                        entrada.tipo === 'salida' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entrada.accion}
                      </span>
                      <span className="text-xs text-gray-500">{entrada.fecha}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{entrada.detalle}</p>
                    <p className="text-xs text-gray-500 mt-1">por: {entrada.usuario}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                Este producto no tiene movimientos registrados en el historial.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onCerrar}
            className="px-6 py-2 border-2 border-purple-500 bg-purple-50 text-purple-700 font-bold rounded-lg hover:bg-purple-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoProducto;