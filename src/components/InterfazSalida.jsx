import { useState } from 'react';

const InterfazSalida = ({ productos, combos, onRegistrarSalida, onCancelar }) => {
  const [tipoSalida, setTipoSalida] = useState('producto'); // 'producto' o 'combo'
  const [itemsSalida, setItemsSalida] = useState([]);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [error, setError] = useState('');

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
    p.cantidad > 0
  );

  const agregarItem = () => {
    if (!productoSeleccionado) {
      setError('Debe seleccionar un producto');
      return;
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidad > productoSeleccionado.cantidad) {
      setError(`Stock insuficiente. Disponible: ${productoSeleccionado.cantidad} ${productoSeleccionado.unidad}`);
      return;
    }

    const existe = itemsSalida.find(item => item.producto.id === productoSeleccionado.id);
    if (existe) {
      setError('Este producto ya está en la lista');
      return;
    }

    setItemsSalida([...itemsSalida, {
      producto: productoSeleccionado,
      cantidad: cantidad
    }]);
    setProductoSeleccionado(null);
    setCantidad(1);
    setTerminoBusqueda('');
    setError('');
  };

  const eliminarItem = (index) => {
    setItemsSalida(itemsSalida.filter((_, i) => i !== index));
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    const item = itemsSalida[index];
    if (nuevaCantidad > item.producto.cantidad) {
      alert(`Stock insuficiente. Disponible: ${item.producto.cantidad} ${item.producto.unidad}`);
      return;
    }
    if (nuevaCantidad <= 0) {
      eliminarItem(index);
      return;
    }
    const nuevosItems = [...itemsSalida];
    nuevosItems[index].cantidad = nuevaCantidad;
    setItemsSalida(nuevosItems);
  };

  const handleRegistrarSalida = () => {
    if (tipoSalida === 'producto') {
      if (itemsSalida.length === 0) {
        setError('Debe agregar al menos un producto a la salida');
        return;
      }
    } else {
      if (!comboSeleccionado) {
        setError('Debe seleccionar un combo');
        return;
      }
      
      // Verificar stock para todos los productos del combo
      const productosSinStock = [];
      comboSeleccionado.productos.forEach(item => {
        const producto = productos.find(p => p.nombre === item.nombre);
        if (!producto || producto.cantidad < item.cantidad) {
          productosSinStock.push(`${item.nombre} (requiere ${item.cantidad} ${item.unidad})`);
        }
      });
      
      if (productosSinStock.length > 0) {
        setError(`Stock insuficiente para:\n${productosSinStock.join('\n')}`);
        return;
      }
    }

    if (!motivo) {
      setError('Debe seleccionar un motivo para la salida');
      return;
    }

    if (tipoSalida === 'producto') {
      onRegistrarSalida(itemsSalida, 'producto');
    } else {
      onRegistrarSalida([], 'combo', comboSeleccionado);
    }
  };

  const totalProductos = itemsSalida.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-red-600 mb-6">Registrar Salida de Inventario</h2>
      
      {error && (
        <div className="bg-red-600 text-white text-center p-3 text-sm rounded-lg mb-4 whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Selector de tipo de salida */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setTipoSalida('producto');
            setComboSeleccionado(null);
            setError('');
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
            tipoSalida === 'producto'
              ? 'bg-red-600 text-white'
              : 'border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Salida de Productos
        </button>
        <button
          onClick={() => {
            setTipoSalida('combo');
            setItemsSalida([]);
            setProductoSeleccionado(null);
            setError('');
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
            tipoSalida === 'combo'
              ? 'bg-red-600 text-white'
              : 'border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Salida de Combo
        </button>
      </div>

      {tipoSalida === 'producto' ? (
        <>
          {/* Buscador y selección de productos */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Buscar Producto para Agregar
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Escriba para buscar productos..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={agregarItem}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300"
              >
                Agregar
              </button>
            </div>

            {terminoBusqueda && productosFiltrados.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => {
                      setProductoSeleccionado(producto);
                      setTerminoBusqueda(producto.nombre);
                    }}
                    className="p-2 hover:bg-red-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">Stock: {producto.cantidad} {producto.unidad}</span>
                    </div>
                    <button className="text-red-600 text-xs font-bold">Seleccionar</button>
                  </div>
                ))}
              </div>
            )}

            {productoSeleccionado && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 bg-green-50 p-3 rounded-lg">
                  <span className="font-bold text-green-700">Seleccionado: </span>
                  <span>{productoSeleccionado.nombre}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    (Stock: {productoSeleccionado.cantidad} {productoSeleccionado.unidad})
                  </span>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    min="1"
                    max={productoSeleccionado.cantidad}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tabla de productos a salir */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-700 mb-3">Productos a Registrar Salida</h3>
            {itemsSalida.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="max-h-[300px] overflow-y-auto border-2 border-red-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-red-50 z-10">
                      <tr>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">#</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Producto</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Unidad</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Stock Actual</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Cantidad a Salir</th>
                        <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsSalida.map((item, index) => (
                        <tr key={index} className="hover:bg-red-50/50">
                          <td className="border-2 border-red-200 p-2 text-xs">{index + 1}</td>
                          <td className="border-2 border-red-200 p-2 text-xs font-medium">{item.producto.nombre}</td>
                          <td className="border-2 border-red-200 p-2 text-xs">{item.producto.unidad}</td>
                          <td className="border-2 border-red-200 p-2 text-xs">{item.producto.cantidad}</td>
                          <td className="border-2 border-red-200 p-2 text-xs">
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => actualizarCantidad(index, parseInt(e.target.value) || 0)}
                              className="w-20 p-1 border border-red-300 rounded text-xs"
                              min="0"
                              max={item.producto.cantidad}
                            />
                          </td>
                          <td className="border-2 border-red-200 p-2">
                            <button
                              onClick={() => eliminarItem(index)}
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
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay productos agregados a la salida. Busque y agregue productos arriba.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Selección de combo */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Seleccionar Combo
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 mb-4">
              {combos.map(combo => {
                const tieneStock = combo.productos.every(item => {
                  const producto = productos.find(p => p.nombre === item.nombre);
                  return producto && producto.cantidad >= item.cantidad;
                });

                return (
                  <div
                    key={combo.id}
                    onClick={() => setComboSeleccionado(combo)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      comboSeleccionado?.id === combo.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{combo.nombre}</h3>
                      {!tieneStock && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Sin stock
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {combo.productos.length} productos
                    </p>
                    <div className="text-xs text-gray-500">
                      {combo.productos.map((p, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{p.nombre}</span>
                          <span>{p.cantidad} {p.unidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Resumen y motivo */}
      {tipoSalida === 'producto' && itemsSalida.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total de productos:</p>
            <p className="text-2xl font-bold text-red-600">{itemsSalida.length}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Unidades totales:</p>
            <p className="text-2xl font-bold text-red-600">{totalProductos}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 font-bold text-sm mb-2">
          Motivo de la Salida <span className="text-red-500">*</span>
        </label>
        <select
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
        >
          <option value="">Seleccione un motivo</option>
          <option value="venta">Venta</option>
          <option value="consumo_interno">Consumo Interno</option>
          <option value="merma">Merma/Pérdida</option>
          <option value="donacion">Donación</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {motivo === 'otro' && (
        <div className="mb-6">
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            placeholder="Describa el motivo..."
          />
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancelar}
          className="px-6 py-3 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleRegistrarSalida}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={(tipoSalida === 'producto' && itemsSalida.length === 0) || 
                   (tipoSalida === 'combo' && !comboSeleccionado) || 
                   !motivo}
        >
          Registrar Salida
        </button>
      </div>
    </div>
  );
};

export default InterfazSalida;