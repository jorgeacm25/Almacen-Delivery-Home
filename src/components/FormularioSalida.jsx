import { useState, useEffect } from 'react';

const FormularioSalida = ({ productos, combos, onRegistrarSalida, onCerrar, usuario }) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('producto');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [cliente, setCliente] = useState('');
  const [error, setError] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  // Estado para los productos editables del combo
  const [productosComboEditables, setProductosComboEditables] = useState([]);
  // Estados para agregar productos extra al combo
  const [terminoBusquedaProductoExtra, setTerminoBusquedaProductoExtra] = useState('');
  const [productosExtraFiltrados, setProductosExtraFiltrados] = useState([]);

  // Filtrar productos según el tipo de selección
  useEffect(() => {
    if (tipoSeleccionado === 'producto') {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    } else if (tipoSeleccionado === 'combo' && terminoBusquedaProductoExtra) {
      const idsYaIncluidos = productosComboEditables.map(p => p.id);
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(terminoBusquedaProductoExtra.toLowerCase()) &&
        !idsYaIncluidos.includes(p.id)
      );
      setProductosExtraFiltrados(filtrados);
    }
  }, [terminoBusqueda, terminoBusquedaProductoExtra, productos, productosComboEditables, tipoSeleccionado]);

  // Función para agregar un producto extra al combo editable
  const agregarProductoExtra = (producto) => {
    const nuevoProducto = {
      id: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      unidad: producto.unidad,
      incluido: true
    };
    setProductosComboEditables([...productosComboEditables, nuevoProducto]);
    setTerminoBusquedaProductoExtra('');
    setProductosExtraFiltrados([]);
  };

  const handleRegistrarSalida = async () => {
    if (!motivo) {
      setError('Debe especificar un motivo para la salida');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Inicie sesión nuevamente.');
      return;
    }
    const userId = usuario?.id;
    if (!userId) {
      setError('No se pudo identificar al usuario. Reintente.');
      return;
    }

    if (tipoSeleccionado === 'producto') {
      // ----- SALIDA DE PRODUCTO (sin cambios) -----
      if (!productoSeleccionado) {
        setError('Debe seleccionar un producto');
        return;
      }
      if (cantidad <= 0) {
        setError('La cantidad debe ser mayor a 0');
        return;
      }
      if (cantidad > productoSeleccionado.cantidad) {
        setError(`No hay suficiente stock. Disponible: ${productoSeleccionado.cantidad} ${productoSeleccionado.unidad}`);
        return;
      }

      const payload = {
        productId: productoSeleccionado.id,
        quantity: cantidad,
        outMotive: motivo,
        adminId: null,
        userId: userId,
        customer: cliente || null
      };

      setLoading(true);
      try {
        const response = await fetch('http://localhost:5228/api/productOut', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          onRegistrarSalida(
            [{ producto: productoSeleccionado, cantidad: cantidad }],
            'producto',
            null,
            { motivo: motivo, cliente: cliente || '' }
          );
          onCerrar();
          window.location.reload();
        } else {
          const errorText = await response.text();
          setError(errorText || 'Error al registrar la salida');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    } 
    else {
      // ----- SALIDA DE COMBO CON EDICIÓN Y AGREGADO DE PRODUCTOS EXTRA -----
      if (!comboSeleccionado) {
        setError('Debe seleccionar un combo');
        return;
      }

      const productosSeleccionados = productosComboEditables.filter(p => p.incluido);
      if (productosSeleccionados.length === 0) {
        setError('Debe seleccionar al menos un producto del combo');
        return;
      }

      // Validar stock individualmente
      const productosSinStock = [];
      for (const item of productosSeleccionados) {
        const productoEnStock = productos.find(p => p.id === item.id);
        if (!productoEnStock || productoEnStock.cantidad < item.cantidad) {
          productosSinStock.push(`${item.nombre} (requiere ${item.cantidad} ${item.unidad})`);
        }
      }
      if (productosSinStock.length > 0) {
        setError(`No hay suficiente stock para:\n${productosSinStock.join('\n')}`);
        return;
      }

      const comboPayload = {
        comboId: comboSeleccionado.id,
        outMotive: motivo,
        adminId: null,
        userId: userId,
        comboEntity: productosSeleccionados.map(p => ({
          productDto: p.id,
          quantity: p.cantidad
        })),
        customer: cliente || null
      };

      setLoading(true);
      try {
        const response = await fetch('http://localhost:5228/api/comboOut', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(comboPayload)
        });

        if (response.ok) {
          const productosDescontados = productosSeleccionados.map(p => ({
            producto: productos.find(prod => prod.id === p.id),
            cantidad: p.cantidad
          }));
          onRegistrarSalida(
            productosDescontados,
            'producto',
            null,
            { motivo: motivo, cliente: cliente || '' }
          );
          onCerrar();
          window.location.reload();
        } else {
          const errorText = await response.text();
          setError(errorText || 'Error al registrar la salida del combo');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCerrar}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Registrar Salida de Inventario</h2>
        
        {error && (
          <div className="bg-red-600 text-white text-center p-3 text-sm rounded-lg mb-4 whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setTipoSeleccionado('producto');
              setProductoSeleccionado(null);
              setComboSeleccionado(null);
              setProductosComboEditables([]);
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
              tipoSeleccionado === 'producto'
                ? 'bg-green-600 text-white'
                : 'border-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Salida de Producto
          </button>
          <button
            onClick={() => {
              setTipoSeleccionado('combo');
              setProductoSeleccionado(null);
              setComboSeleccionado(null);
              setProductosComboEditables([]);
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
              tipoSeleccionado === 'combo'
                ? 'bg-green-600 text-white'
                : 'border-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Salida de Combo
          </button>
        </div>

        {tipoSeleccionado === 'producto' ? (
          // ---------- SECCIÓN PRODUCTO (sin cambios) ----------
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Buscar Producto
            </label>
            <input
              type="text"
              placeholder="Escriba para buscar productos..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
              autoFocus
              disabled={loading}
            />
            {terminoBusqueda && productosFiltrados.length > 0 && (
              <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg mb-4">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => {
                      setProductoSeleccionado(producto);
                      setTerminoBusqueda('');
                    }}
                    className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">Stock: {producto.cantidad} {producto.unidad}</span>
                    </div>
                    <button className="text-green-600 text-sm font-bold">Seleccionar</button>
                  </div>
                ))}
              </div>
            )}
            {productoSeleccionado && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                <p className="font-bold text-green-700 mb-2">Producto Seleccionado:</p>
                <p className="text-sm">{productoSeleccionado.nombre}</p>
                <p className="text-sm text-gray-600">
                  Stock disponible: {productoSeleccionado.cantidad} {productoSeleccionado.unidad}
                </p>
              </div>
            )}
            {productoSeleccionado && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold text-sm mb-2">
                  Cantidad a retirar
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  placeholder="0"
                  min="0"
                  max={productoSeleccionado?.cantidad || 0}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo disponible: {productoSeleccionado.cantidad} {productoSeleccionado.unidad}
                </p>
              </div>
            )}
          </div>
        ) : (
          // ---------- SECCIÓN COMBO CON EDICIÓN Y AGREGADO DE PRODUCTOS EXTRA ----------
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Seleccionar Combo
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 mb-4">
              {combos?.map(combo => {
                const tieneStock = combo.productos.every(item => {
                  const productoEnStock = productos.find(p => p.nombre === item.nombre);
                  return productoEnStock && productoEnStock.cantidad >= item.cantidad;
                });
                return (
                  <div
                    key={combo.id}
                    onClick={() => {
                      setComboSeleccionado(combo);
                      const editables = combo.productos.map(p => ({
                        id: p.id,
                        nombre: p.nombre,
                        cantidad: p.cantidad,
                        unidad: p.unidad,
                        incluido: true
                      }));
                      setProductosComboEditables(editables);
                    }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      comboSeleccionado?.id === combo.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{combo.nombre}</span>
                      {!tieneStock && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Sin stock</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{combo.productos.length} productos</p>
                  </div>
                );
              })}
            </div>

            {comboSeleccionado && productosComboEditables.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-bold text-blue-700 mb-2">Editar productos a retirar (para esta salida):</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {productosComboEditables.map((item, idx) => {
                    const productoEnStock = productos.find(p => p.id === item.id);
                    const tieneStockSuficiente = productoEnStock && productoEnStock.cantidad >= (item.incluido ? item.cantidad : 0);
                    return (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={item.incluido}
                            onChange={() => {
                              const nuevos = [...productosComboEditables];
                              nuevos[idx].incluido = !nuevos[idx].incluido;
                              setProductosComboEditables(nuevos);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="font-medium text-gray-800">{item.nombre}</span>
                          <span className="text-xs text-gray-500">({item.unidad})</span>
                        </div>
                        {item.incluido && (
                          <div className="flex items-center gap-3 ml-6">
                            <label className="text-sm text-gray-600">Cantidad:</label>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => {
                                const nuevos = [...productosComboEditables];
                                nuevos[idx].cantidad = parseInt(e.target.value) || 0;
                                setProductosComboEditables(nuevos);
                              }}
                              onFocus={(e) => e.target.select()}
                              className="w-24 p-1 border border-gray-300 rounded text-sm"
                              min="0"
                              step="1"
                            />
                            <span className="text-xs text-gray-500">
                              Stock: {productoEnStock?.cantidad || 0} {item.unidad}
                            </span>
                            {!tieneStockSuficiente && (
                              <span className="text-xs text-red-600 font-bold">Insuficiente</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Total de productos seleccionados: {productosComboEditables.filter(p => p.incluido).length}
                </div>

                {/* Buscador para agregar productos extra al combo */}
                <div className="mt-4">
                  <label className="block text-gray-700 font-bold text-sm mb-2">
                    Agregar producto adicional al combo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={terminoBusquedaProductoExtra}
                      onChange={(e) => setTerminoBusquedaProductoExtra(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                      disabled={loading}
                    />
                    {terminoBusquedaProductoExtra && productosExtraFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border-2 border-green-200 rounded-lg shadow-lg">
                        {productosExtraFiltrados.map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => agregarProductoExtra(prod)}
                            className="p-2 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                          >
                            <span className="font-medium">{prod.nombre}</span>
                            <span className="text-xs text-gray-500 ml-2">(Stock: {prod.cantidad} {prod.unidad})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Motivo y cliente (comunes) */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold text-sm mb-2">
            Motivo de la Salida <span className="text-red-500">*</span>
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            disabled={loading}
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
            <label className="block text-gray-700 font-bold text-sm mb-2">Especifique el motivo</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
              disabled={loading}
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-bold text-sm mb-2">Cliente (opcional)</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCerrar}
            className="px-4 py-3 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleRegistrarSalida}
            className="px-4 py-3 border-2 border-green-500 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              (tipoSeleccionado === 'producto' && !productoSeleccionado) ||
              (tipoSeleccionado === 'combo' && (!comboSeleccionado || productosComboEditables.filter(p => p.incluido).length === 0)) ||
              !motivo || loading
            }
          >
            {loading ? 'Registrando...' : 'Registrar Salida'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioSalida;