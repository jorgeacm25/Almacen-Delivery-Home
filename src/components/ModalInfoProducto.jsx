const ModalInfoProducto = ({ producto, onCerrar }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-2xl font-bold text-purple-600 mb-4">Información del Producto</h3>
        
        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">ID</p>
            <p className="text-lg font-bold">{producto.id}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="text-lg font-bold">{producto.nombre}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Cantidad</p>
            <p className="text-lg font-bold">{producto.cantidad} {producto.unidad}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Fecha de Entrada</p>
            <p className="text-lg font-bold">{producto.fechaEntrada}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Fecha de Vencimiento</p>
            <p className="text-lg font-bold">{producto.fechaVencimiento || 'No especificada'}</p>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">Operador</p>
            <p className="text-lg font-bold">{producto.operador || 'No especificado'}</p>
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