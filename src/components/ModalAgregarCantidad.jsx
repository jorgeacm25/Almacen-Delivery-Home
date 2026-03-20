import { useState } from 'react';

const ModalAgregarCantidad = ({ producto, onAgregar, onCerrar }) => {
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cantidad || cantidad <= 0) {
      setError('Ingrese una cantidad válida');
      return;
    }

    setConfirmando(true);
  };

  const confirmarAccion = () => {
    onAgregar(producto.id, parseInt(cantidad));
    onCerrar();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border-2 border-green-400">
        <h3 className="text-3xl font-extrabold text-green-700 mb-4">Agregar Cantidad</h3>
        <p className="text-lg text-gray-700 mb-4">Producto: <span className="font-extrabold">{producto.nombre}</span></p>
        
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
              className="w-full p-3 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-600 text-lg"
              placeholder="Ingrese cantidad"
              min="1"
              step="1"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3 border-2 border-red-700 bg-white text-red-800 font-extrabold rounded-lg hover:bg-red-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 border-2 border-green-700 bg-white text-green-800 font-extrabold rounded-lg hover:bg-green-100"
            >
              Continuar
            </button>
          </div>
        </form>
        ) : (
          <div>
            <p className="text-xl font-bold text-gray-800 mb-3">¿Confirmar esta accion?</p>
            <div className="p-4 border-2 border-green-300 rounded-lg bg-green-50 mb-4">
              <p className="text-lg"><span className="font-extrabold">Accion:</span> agregar inventario</p>
              <p className="text-lg"><span className="font-extrabold">Producto:</span> {producto.nombre}</p>
              <p className="text-lg"><span className="font-extrabold">Cantidad:</span> {cantidad} {producto.unidad}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setConfirmando(false)} className="px-6 py-3 border-2 border-gray-700 bg-white text-gray-800 font-extrabold rounded-lg">
                NO, VOLVER
              </button>
              <button type="button" onClick={confirmarAccion} className="px-6 py-3 border-2 border-green-700 bg-green-700 text-white font-extrabold rounded-lg">
                SI, AGREGAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAgregarCantidad;