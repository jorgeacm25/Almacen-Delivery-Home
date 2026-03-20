import { useState, useEffect } from 'react';

const ModalModificarProducto = ({ producto, onModificar, onCerrar }) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Alimentos');
  const [cantidad, setCantidad] = useState('');
  const [peso, setPeso] = useState('');
  const [unidadPeso, setUnidadPeso] = useState('g');
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [operador, setOperador] = useState('');
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  // Cargar datos del producto al abrir el modal
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || '');
      setCategoria(producto.categoria || 'Alimentos');
      setCantidad(producto.cantidad?.toString() || '');
      
      // Determinar si tiene peso o es unidad
      if (producto.unidad && ['g', 'kg', 'lb'].includes(producto.unidad)) {
        setPeso(producto.cantidad?.toString() || '');
        setUnidadPeso(producto.unidad);
      }
      
      setFechaEntrada(producto.fechaEntrada || '');
      setFechaVencimiento(producto.fechaVencimiento || '');
      setOperador(producto.operador || '');
    }
  }, [producto]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre || !cantidad || !fechaEntrada || !operador) {
      setError('Nombre, Cantidad, Fecha Entrada y Operador son obligatorios');
      return;
    }

    const productoModificado = {
      ...producto,
      nombre,
      categoria,
      cantidad: parseInt(cantidad),
      unidad: peso ? unidadPeso : 'u',
      fechaEntrada,
      fechaVencimiento: fechaVencimiento || '',
      operador
    };

    setConfirmando(true);
  };

  const confirmarCambios = () => {
    const productoModificado = {
      ...producto,
      nombre,
      categoria,
      cantidad: parseInt(cantidad),
      unidad: peso ? unidadPeso : 'u',
      fechaEntrada,
      fechaVencimiento: fechaVencimiento || '',
      operador
    };

    onModificar(producto.id, productoModificado);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto border-2 border-blue-400">
        <h3 className="text-3xl font-extrabold text-blue-700 mb-4">Modificar Producto</h3>
        
        {error && (
          <div className="bg-red-700 text-white text-center p-3 text-base rounded-lg mb-4">
            {error}
          </div>
        )}

        {!confirmando ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
            >
              <option value="Alimentos">Alimentos</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Aseo">Aseo</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              min="0"
              step="1"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Peso <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-24 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                placeholder="Peso"
                step="0.01"
                min="0"
              />
              <select
                value={unidadPeso}
                onChange={(e) => setUnidadPeso(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
              >
                <option value="g">Gramos (g)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="lb">Libras (lb)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold text-sm mb-2">
                Fecha Entrada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold text-sm mb-2">
                Fecha Vencimiento
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Operador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={operador}
              onChange={(e) => setOperador(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
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
              className="px-6 py-3 border-2 border-blue-700 bg-white text-blue-800 font-extrabold rounded-lg hover:bg-blue-100"
            >
              Continuar
            </button>
          </div>
        </form>
        ) : (
          <div>
            <p className="text-xl font-bold text-gray-800 mb-3">¿Confirmar esta accion importante?</p>
            <div className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50 mb-4">
              <p className="text-lg"><span className="font-extrabold">Accion:</span> modificar producto</p>
              <p className="text-lg"><span className="font-extrabold">Producto:</span> {producto.nombre}</p>
              <p className="text-lg"><span className="font-extrabold">Nuevo nombre:</span> {nombre}</p>
              <p className="text-lg"><span className="font-extrabold">Nueva cantidad:</span> {cantidad}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setConfirmando(false)} className="px-6 py-3 border-2 border-gray-700 bg-white text-gray-800 font-extrabold rounded-lg">
                NO, VOLVER
              </button>
              <button type="button" onClick={confirmarCambios} className="px-6 py-3 border-2 border-blue-700 bg-blue-700 text-white font-extrabold rounded-lg">
                SI, GUARDAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalModificarProducto;