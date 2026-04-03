import { useState } from 'react';

const ModalConfirmarEliminar = ({ producto, onEliminar, onCerrar }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEliminar = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5228/api/product/${producto.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onEliminar(producto.id);
        onCerrar();
      } else {
        const errorText = await response.text();
        setError(errorText || `Error ${response.status}: No se pudo eliminar`);
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-4 sm:p-6 border-2 border-red-400">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-red-700 mb-4">Confirmar Eliminación</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <p className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
          ¿Está seguro que desea ELIMINAR este producto?
        </p>
        
        <div className="bg-red-50 p-4 rounded-lg mb-4 border-2 border-red-300">
          <p className="font-extrabold text-gray-900 text-base sm:text-lg">Producto: {producto.nombre}</p>
          <p className="text-base text-gray-700">Cantidad: {producto.cantidad} {producto.unidad}</p>
          <p className="text-base text-gray-700">Acción: eliminar definitivamente del inventario</p>
        </div>
        
        <p className="text-red-700 text-base font-bold mb-6">
          Esta acción no se puede deshacer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={onCerrar}
            className="px-6 py-3 border-2 border-gray-700 bg-white text-gray-800 font-extrabold rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            NO, CANCELAR
          </button>
          <button
            onClick={handleEliminar}
            className="px-6 py-3 border-2 border-red-700 bg-red-700 text-white font-extrabold rounded-lg hover:bg-red-800"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'SÍ, ELIMINAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEliminar;