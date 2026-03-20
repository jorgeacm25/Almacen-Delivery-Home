import { useState } from 'react';

const ModalNuevoCombo = ({ productos, onCrearCombo, onCerrar }) => {
  const [nombreCombo, setNombreCombo] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    !productosSeleccionados.some(ps => ps.nombre === p.nombre)
  );

  const agregarProducto = (producto) => {
    setProductosSeleccionados([
      ...productosSeleccionados,
      {
        nombre: producto.nombre,
        codigo: producto.codigo || '',
        cantidad: 1,
        unidad: producto.unidad
      }
    ]);
    setBusqueda('');
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const nuevos = [...productosSeleccionados];
    nuevos[index].cantidad = nuevaCantidad;
    setProductosSeleccionados(nuevos);
  };

  const actualizarUnidad = (index, nuevaUnidad) => {
    const nuevos = [...productosSeleccionados];
    nuevos[index].unidad = nuevaUnidad;
    setProductosSeleccionados(nuevos);
  };

  const eliminarProducto = (index) => {
    setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== index));
  };

  const handleCrear = () => {
    if (!nombreCombo.trim()) {
      setError('Debe ingresar un nombre para el combo');
      return;
    }
    if (productosSeleccionados.length === 0) {
      setError('Debe agregar al menos un producto al combo');
      return;
    }
    onCrearCombo(nombreCombo, productosSeleccionados);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Crear Nuevo Combo</h2>
        
        {error && (
          <div className="bg-red-600 text-white text-center p-3 text-sm rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-bold text-sm mb-2">
            Nombre del Combo
          </label>
          <input
            type="text"
            value={nombreCombo}
            onChange={(e) => setNombreCombo(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            placeholder="Ej: Combo Familiar"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold text-sm mb-2">
            Agregar Productos
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            />
            {busqueda && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border-2 border-green-200 rounded-lg shadow-lg">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => agregarProducto(producto)}
                    className="p-2 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                  >
                    <span className="font-medium">{producto.nombre}</span>
                    <span className="text-xs text-gray-500 ml-2">({producto.unidad})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {productosSeleccionados.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">Productos del Combo</h3>
            <div className="overflow-x-auto">
              <div className="max-h-[300px] overflow-y-auto border-2 border-green-100 rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-green-50 z-10">
                    <tr>
                      <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">#</th>
                      <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Producto</th>
                      <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Código</th>
                      <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Cantidad</th>
                      <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Unidad</th>
                      <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosSeleccionados.map((producto, index) => (
                      <tr key={index} className="hover:bg-green-50/50">
                        <td className="border-2 border-green-200 p-2 text-xs">{index + 1}</td>
                        <td className="border-2 border-green-200 p-2 text-xs font-medium">{producto.nombre}</td>
                        <td className="border-2 border-green-200 p-2 text-xs">
                          <input
                            type="text"
                            value={producto.codigo}
                            onChange={(e) => {
                              const nuevos = [...productosSeleccionados];
                              nuevos[index].codigo = e.target.value;
                              setProductosSeleccionados(nuevos);
                            }}
                            className="w-full p-1 border border-green-300 rounded text-xs"
                            placeholder="Código"
                          />
                        </td>
                        <td className="border-2 border-green-200 p-2 text-xs">
                          <input
                            type="number"
                            value={producto.cantidad}
                            onChange={(e) => actualizarCantidad(index, parseInt(e.target.value) || 0)}
                            className="w-16 p-1 border border-green-300 rounded text-xs"
                            min="1"
                          />
                        </td>
                        <td className="border-2 border-green-200 p-2 text-xs">
                          <select
                            value={producto.unidad}
                            onChange={(e) => actualizarUnidad(index, e.target.value)}
                            className="w-16 p-1 border border-green-300 rounded text-xs"
                          >
                            <option value="lb">lb</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="L">L</option>
                            <option value="u">u</option>
                          </select>
                        </td>
                        <td className="border-2 border-green-200 p-2">
                          <button
                            onClick={() => eliminarProducto(index)}
                            className="px-2 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-[10px]"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCerrar}
            className="px-6 py-3 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrear}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300"
          >
            Crear Combo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevoCombo;