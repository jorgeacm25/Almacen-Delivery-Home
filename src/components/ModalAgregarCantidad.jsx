import { useState } from 'react';

const ModalAgregarCantidad = ({ producto, onAgregar, onCerrar, usuario }) => {
  const [cantidad, setCantidad] = useState('');
  const [provider , setProvider] = useState('');
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState(producto.fechaVencimiento || '');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cantidadNum = parseInt(cantidad);
    if (!cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('Ingrese una cantidad válida mayor a 0');
      return;
    }
    setError('');
    setConfirmando(true);
  };

  const confirmarAccion = async () => {
    const cantidadAgregar = parseInt(cantidad);
    const nuevaCantidad = producto.cantidad + cantidadAgregar;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa. Inicie sesión nuevamente.');
      return;
    }
    const userId = usuario?.id;
    if (!userId) {
      alert('No se pudo identificar al usuario.');
      return;
    }

    // Convertir fecha de vencimiento a ISO (si existe)
    let endDate = null;
    if (nuevaFechaVencimiento) {
      endDate = new Date(nuevaFechaVencimiento).toISOString();
    }

    const payload = {
      id: producto.id,
      quantity: nuevaCantidad,
      endDate: endDate,
      adminId: null,
      userId: userId,
      provider: provider
    };

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5228/api/product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Actualizar estado local en App (cantidad y fecha de vencimiento)
        onAgregar(producto.id, cantidadAgregar, nuevaFechaVencimiento);
        onCerrar();
        window.location.reload();
      } else {
        const errorText = await response.text();
        alert(`Error al actualizar stock: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
      setConfirmando(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-4 sm:p-6 border-2 border-green-400">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-green-700 mb-4">Agregar Cantidad</h3>
        <p className="text-base sm:text-lg text-gray-700 mb-4">
          Producto: <span className="font-extrabold">{producto.nombre}</span>
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Cantidad actual: <span className="font-bold">{producto.cantidad} {producto.unidad}</span>
        </p>
        <p className="text-sm text-gray-500 mb-2">
          Fecha de vencimiento actual: <span className="font-bold">{producto.fechaVencimiento || 'No especificada'}</span>
        </p>

        {error && (
          <div className="bg-red-700 text-white text-center p-3 text-base rounded-lg mb-4">
            {error}
          </div>
        )}

        {!confirmando ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-800 font-extrabold text-base mb-2">
                Cantidad a agregar
              </label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full p-3 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-600 text-lg"
                placeholder="0"
                min="0"
                step="1"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-800 font-extrabold text-base mb-2">
                Nueva fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                value={nuevaFechaVencimiento}
                onChange={(e) => setNuevaFechaVencimiento(e.target.value)}
                className="w-full p-3 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-600 text-lg"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío para mantener la fecha actual o eliminarla (según el backend).
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-800 font-extrabold text-base mb-2">
                Nombre del Proveedor
              </label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full p-3 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-600 text-lg"
                placeholder="Merlin"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onCerrar}
                className="px-6 py-3 border-2 border-red-700 bg-white text-red-800 font-extrabold rounded-lg hover:bg-red-100"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 border-2 border-green-700 bg-white text-green-800 font-extrabold rounded-lg hover:bg-green-100"
                disabled={loading}
              >
                Continuar
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-lg sm:text-xl font-bold text-gray-800 mb-3">¿Confirmar esta acción?</p>
            <div className="p-4 border-2 border-green-300 rounded-lg bg-green-50 mb-4">
              <p className="text-base sm:text-lg">
                <span className="font-extrabold">Acción:</span> agregar inventario
              </p>
              <p className="text-base sm:text-lg">
                <span className="font-extrabold">Producto:</span> {producto.nombre}
              </p>
              <p className="text-base sm:text-lg">
                <span className="font-extrabold">Cantidad a agregar:</span> {cantidad} {producto.unidad}
              </p>
              <p className="text-base sm:text-lg">
                <span className="font-extrabold">Nueva cantidad total:</span> {producto.cantidad + parseInt(cantidad || 0)} {producto.unidad}
              </p>
              <p className="text-base sm:text-lg">
                <span className="font-extrabold">Nueva fecha de vencimiento:</span> {nuevaFechaVencimiento || 'No especificada'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="px-6 py-3 border-2 border-gray-700 bg-white text-gray-800 font-extrabold rounded-lg"
                disabled={loading}
              >
                NO, VOLVER
              </button>
              <button
                type="button"
                onClick={confirmarAccion}
                className="px-6 py-3 border-2 border-green-700 bg-green-700 text-white font-extrabold rounded-lg"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'SÍ, AGREGAR'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAgregarCantidad;