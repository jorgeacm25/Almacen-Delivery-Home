const ModalConfirmarEliminar = ({ producto, onEliminar, onCerrar }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 border-2 border-red-400">
        <h3 className="text-3xl font-extrabold text-red-700 mb-4">Confirmar Eliminacion</h3>
        
        <p className="text-xl font-bold text-gray-800 mb-2">
          ¿Esta seguro que desea ELIMINAR este producto?
        </p>
        
        <div className="bg-red-50 p-4 rounded-lg mb-4 border-2 border-red-300">
          <p className="font-extrabold text-gray-900 text-lg">Producto: {producto.nombre}</p>
          <p className="text-base text-gray-700">Cantidad: {producto.cantidad} {producto.unidad}</p>
          <p className="text-base text-gray-700">Accion: eliminar definitivamente del inventario</p>
        </div>
        
        <p className="text-red-700 text-base font-bold mb-6">
          Esta accion no se puede deshacer.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCerrar}
            className="px-6 py-3 border-2 border-gray-700 bg-white text-gray-800 font-extrabold rounded-lg hover:bg-gray-100"
          >
            NO, CANCELAR
          </button>
          <button
            onClick={() => onEliminar(producto.id)}
            className="px-6 py-3 border-2 border-red-700 bg-red-700 text-white font-extrabold rounded-lg hover:bg-red-800"
          >
            SI, ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEliminar;