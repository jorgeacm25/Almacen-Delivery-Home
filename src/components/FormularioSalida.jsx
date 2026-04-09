import { useState, useEffect } from 'react';

const FormularioSalida = ({ productos, combos, onRegistrarSalida, onCerrar, usuario }) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('producto');
  // Estados para productos (salida de productos)
  const [itemsProductos, setItemsProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [cantidadProductoTexto, setCantidadProductoTexto] = useState('1'); // texto temporal
  const [terminoBusquedaProducto, setTerminoBusquedaProducto] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  // Estados para combo
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [productosComboEditables, setProductosComboEditables] = useState([]);
  const [productosExtra, setProductosExtra] = useState([]);
  const [terminoBusquedaExtra, setTerminoBusquedaExtra] = useState('');
  const [productosExtraFiltrados, setProductosExtraFiltrados] = useState([]);

  // Estados comunes
  const [motivo, setMotivo] = useState('');
  const [cliente, setCliente] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [salidaDate, setSalidaDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Filtrar productos para la sección de productos
  useEffect(() => {
    if (tipoSeleccionado === 'producto') {
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(terminoBusquedaProducto.toLowerCase()) &&
        p.cantidad > 0 &&
        !itemsProductos.some(item => item.id === p.id)
      );
      setProductosFiltrados(filtrados);
    }
  }, [terminoBusquedaProducto, productos, itemsProductos, tipoSeleccionado]);

  // Filtrar productos extra para combo
  useEffect(() => {
    if (tipoSeleccionado === 'combo' && terminoBusquedaExtra) {
      const idsYaIncluidos = [
        ...productosComboEditables.map(p => p.id),
        ...productosExtra.map(p => p.id)
      ];
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(terminoBusquedaExtra.toLowerCase()) &&
        p.cantidad > 0 &&
        !idsYaIncluidos.includes(p.id)
      );
      setProductosExtraFiltrados(filtrados);
    } else {
      setProductosExtraFiltrados([]);
    }
  }, [terminoBusquedaExtra, productos, productosComboEditables, productosExtra, tipoSeleccionado]);

  // --- Funciones para productos (salida de productos) ---
  const agregarProducto = () => {
    if (!productoSeleccionado) {
      setError('Debe seleccionar un producto');
      return;
    }
    if (cantidadProducto <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidadProducto > productoSeleccionado.cantidad) {
      setError(`Stock insuficiente. Disponible: ${productoSeleccionado.cantidad} ${productoSeleccionado.unidad}`);
      return;
    }
    if (itemsProductos.some(item => item.id === productoSeleccionado.id)) {
      setError('Este producto ya está en la lista');
      return;
    }
    setItemsProductos([
      ...itemsProductos,
      {
        id: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        cantidad: cantidadProducto,
        cantidadTexto: cantidadProducto.toString(),
        unidad: productoSeleccionado.unidad,
        stock: productoSeleccionado.cantidad
      }
    ]);
    setProductoSeleccionado(null);
    setCantidadProducto(1);
    setCantidadProductoTexto('1');
    setTerminoBusquedaProducto('');
    setError('');
  };

  const actualizarCantidadProducto = (index, nuevaCantidad) => {
    const item = itemsProductos[index];
    if (nuevaCantidad > item.stock) {
      setError(`Stock insuficiente. Máximo: ${item.stock}`);
      return;
    }
    if (nuevaCantidad <= 0) {
      eliminarProducto(index);
      return;
    }
    const nuevos = [...itemsProductos];
    nuevos[index].cantidad = nuevaCantidad;
    nuevos[index].cantidadTexto = nuevaCantidad.toString();
    setItemsProductos(nuevos);
    setError('');
  };

  const eliminarProducto = (index) => {
    setItemsProductos(itemsProductos.filter((_, i) => i !== index));
  };

  // --- Funciones para combo ---
  const seleccionarCombo = (combo) => {
    setComboSeleccionado(combo);
    const editables = combo.productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      cantidadTexto: p.cantidad.toString(),
      unidad: p.unidad,
      stock: productos.find(prod => prod.id === p.id)?.cantidad || 0,
      incluido: true
    }));
    setProductosComboEditables(editables);
    setProductosExtra([]);
    setError('');
  };

  const toggleIncluirProductoCombo = (index) => {
    const nuevos = [...productosComboEditables];
    nuevos[index].incluido = !nuevos[index].incluido;
    setProductosComboEditables(nuevos);
  };

  const actualizarCantidadProductoCombo = (index, nuevaCantidad) => {
    const item = productosComboEditables[index];
    if (nuevaCantidad > item.stock) {
      setError(`Stock insuficiente. Máximo: ${item.stock}`);
      return;
    }
    if (nuevaCantidad <= 0) {
      const nuevos = [...productosComboEditables];
      nuevos[index].cantidad = 0;
      nuevos[index].cantidadTexto = '0';
      nuevos[index].incluido = false;
      setProductosComboEditables(nuevos);
      return;
    }
    const nuevos = [...productosComboEditables];
    nuevos[index].cantidad = nuevaCantidad;
    nuevos[index].cantidadTexto = nuevaCantidad.toString();
    setProductosComboEditables(nuevos);
    setError('');
  };

  const agregarProductoExtraCombo = (producto) => {
    setProductosExtra([...productosExtra, {
      id: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      cantidadTexto: '1',
      unidad: producto.unidad,
      stock: producto.cantidad,
      incluido: true
    }]);
    setTerminoBusquedaExtra('');
    setError('');
  };

  const actualizarCantidadExtra = (index, nuevaCantidad) => {
    const extra = productosExtra[index];
    if (nuevaCantidad > extra.stock) {
      setError(`Stock insuficiente. Máximo: ${extra.stock}`);
      return;
    }
    if (nuevaCantidad <= 0) {
      eliminarExtra(index);
      return;
    }
    const nuevos = [...productosExtra];
    nuevos[index].cantidad = nuevaCantidad;
    nuevos[index].cantidadTexto = nuevaCantidad.toString();
    setProductosExtra(nuevos);
    setError('');
  };

  const eliminarExtra = (index) => {
    setProductosExtra(productosExtra.filter((_, i) => i !== index));
  };

  // --- Envío de datos ---
  const handleRegistrarSalida = async () => {
    if (!motivo) {
      setError('Debe seleccionar un motivo');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa');
      return;
    }
    const userId = usuario?.id;
    if (!userId) {
      setError('No se pudo identificar al usuario');
      return;
    }

    const dateTime = new Date(salidaDate).toISOString();
    let url = '';
    let body = {};

    if (tipoSeleccionado === 'producto') {
      if (itemsProductos.length === 0) {
        setError('Debe agregar al menos un producto');
        return;
      }
      url = 'http://localhost:5228/api/productOut';
      body = {
        products: itemsProductos.map(item => ({ id: item.id, quantity: item.cantidad })),
        ProductOutDate: dateTime,
        outMotive: motivo,
        adminId: null,
        userId: userId,
        customer: cliente || ''
      };
    } else {
      if (!comboSeleccionado) {
        setError('Debe seleccionar un combo');
        return;
      }
      const productosComboIncluidos = productosComboEditables.filter(p => p.incluido && p.cantidad > 0);
      if (productosComboIncluidos.length === 0 && productosExtra.length === 0) {
        setError('Debe seleccionar al menos un producto del combo o agregar extras');
        return;
      }
      const todosProductos = [
        ...productosComboIncluidos.map(p => ({ id: p.id, cantidad: p.cantidad, stock: p.stock })),
        ...productosExtra.map(p => ({ id: p.id, cantidad: p.cantidad, stock: p.stock }))
      ];
      for (const prod of todosProductos) {
        if (prod.cantidad > prod.stock) {
          setError(`Stock insuficiente para algún producto. Verifique las cantidades.`);
          return;
        }
      }
      url = 'http://localhost:5228/api/comboOut';
      body = {
        comboId: comboSeleccionado.id,
        comboOutDate: dateTime,
        outMotive: motivo,
        adminId: null,
        userId: userId,
        comboEntity: todosProductos.map(p => ({
          productDto: p.id,
          quantity: p.cantidad
        })),
        customer: cliente || ''
      };
    }

    setLoading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        if (tipoSeleccionado === 'producto') {
          const itemsParaPadre = itemsProductos.map(item => ({
            producto: { id: item.id, nombre: item.nombre, unidad: item.unidad },
            cantidad: item.cantidad
          }));
          onRegistrarSalida(itemsParaPadre, 'producto', null, { motivo, cliente });
        } else {
          const comboInfo = {
            id: comboSeleccionado.id,
            nombre: comboSeleccionado.nombre,
            productos: [
              ...productosComboEditables.filter(p => p.incluido && p.cantidad > 0).map(p => ({
                nombre: p.nombre,
                cantidad: p.cantidad,
                unidad: p.unidad
              })),
              ...productosExtra.map(p => ({
                nombre: p.nombre,
                cantidad: p.cantidad,
                unidad: p.unidad
              }))
            ],
            cantidadSalida: 1
          };
          onRegistrarSalida([], 'combo', comboInfo, { motivo, cliente });
        }
        onCerrar();
      } else {
        const errorData = await response.json();
        setError(errorData.title || errorData.message || 'Error al registrar la salida');
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
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
              setComboSeleccionado(null);
              setProductosComboEditables([]);
              setProductosExtra([]);
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
              tipoSeleccionado === 'producto'
                ? 'bg-green-600 text-white'
                : 'border-2 border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Salida de Productos
          </button>
          <button
            onClick={() => {
              setTipoSeleccionado('combo');
              setItemsProductos([]);
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

        {/* Campo de fecha */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold text-sm mb-2">
            Fecha de Salida <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={salidaDate}
            onChange={(e) => setSalidaDate(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
          />
        </div>

        {tipoSeleccionado === 'producto' ? (
          <>
            {/* Buscador y selección de producto */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold text-sm mb-2">Buscar Producto</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Escriba para buscar productos..."
                    value={terminoBusquedaProducto}
                    onChange={(e) => setTerminoBusquedaProducto(e.target.value)}
                    className="w-full p-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  />
                  <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={agregarProducto}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300"
                  disabled={loading}
                >
                  Agregar
                </button>
              </div>
              {terminoBusquedaProducto && productosFiltrados.length > 0 && (
                <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg mt-2">
                  {productosFiltrados.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setProductoSeleccionado(prod);
                        setTerminoBusquedaProducto('');
                      }}
                      className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{prod.nombre}</span>
                        <span className="text-xs text-gray-500 ml-2">Stock: {prod.cantidad} {prod.unidad}</span>
                      </div>
                      <button className="text-green-600 text-xs font-bold">Seleccionar</button>
                    </div>
                  ))}
                </div>
              )}
              {productoSeleccionado && (
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-green-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <span className="font-bold text-green-700">Seleccionado: </span>
                    <span>{productoSeleccionado.nombre}</span>
                    <span className="text-sm text-gray-600 ml-2">(Stock: {productoSeleccionado.cantidad} {productoSeleccionado.unidad})</span>
                  </div>
                  <div className="w-full sm:w-32">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cantidadProductoTexto}
                      onChange={(e) => {
                        let raw = e.target.value;
                        if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                          setCantidadProductoTexto(raw);
                        }
                      }}
                      onBlur={() => {
                        let num = parseFloat(cantidadProductoTexto.replace(',', '.'));
                        if (isNaN(num)) num = 0;
                        if (productoSeleccionado && num > productoSeleccionado.cantidad) {
                          num = productoSeleccionado.cantidad;
                        }
                        setCantidadProducto(num);
                        setCantidadProductoTexto(num.toString());
                      }}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabla de productos agregados */}
            {itemsProductos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-700 mb-3">Productos a retirar</h3>
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
                          <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Precio (no editable)</th>
                          <th className="border-2 border-red-200 p-2 text-left text-xs font-bold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsProductos.map((item, idx) => (
                          <tr key={idx} className="hover:bg-red-50/50">
                            <td className="border-2 border-red-200 p-2 text-xs">{idx + 1}</td>
                            <td className="border-2 border-red-200 p-2 text-xs font-medium">{item.nombre}</td>
                            <td className="border-2 border-red-200 p-2 text-xs">{item.unidad}</td>
                            <td className="border-2 border-red-200 p-2 text-xs">{item.stock}</td>
                            <td className="border-2 border-red-200 p-2 text-xs">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={item.cantidadTexto}
                                onChange={(e) => {
                                  let raw = e.target.value;
                                  if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                                    const nuevos = [...itemsProductos];
                                    nuevos[idx].cantidadTexto = raw;
                                    setItemsProductos(nuevos);
                                  }
                                }}
                                onBlur={() => {
                                  let num = parseFloat(item.cantidadTexto.replace(',', '.'));
                                  if (isNaN(num)) num = 0;
                                  if (num > item.stock) num = item.stock;
                                  if (num <= 0) {
                                    eliminarProducto(idx);
                                  } else {
                                    actualizarCantidadProducto(idx, num);
                                  }
                                }}
                                className="w-20 p-1 border border-red-300 rounded text-xs"
                                placeholder="0"
                              />
                            </td>
                            <td className="border-2 border-red-200 p-2 text-xs">
                              <input
                                type="text"
                                disabled
                                value=""
                                className="w-24 p-1 border border-gray-300 rounded bg-gray-100 text-xs"
                                placeholder="No se envía"
                              />
                            </td>
                            <td className="border-2 border-red-200 p-2">
                              <button
                                onClick={() => eliminarProducto(idx)}
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
          </>
        ) : (
          // Sección combo
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">Seleccionar Combo</label>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 mb-4">
              {combos?.map(combo => {
                const tieneStock = combo.productos.every(item => {
                  const productoEnStock = productos.find(p => p.nombre === item.nombre);
                  return productoEnStock && productoEnStock.cantidad >= item.cantidad;
                });
                return (
                  <div
                    key={combo.id}
                    onClick={() => seleccionarCombo(combo)}
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
                            onChange={() => toggleIncluirProductoCombo(idx)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="font-medium text-gray-800">{item.nombre}</span>
                          <span className="text-xs text-gray-500">({item.unidad})</span>
                        </div>
                        {item.incluido && (
                          <div className="flex items-center gap-3 ml-6">
                            <label className="text-sm text-gray-600">Cantidad:</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.cantidadTexto}
                              onChange={(e) => {
                                let raw = e.target.value;
                                if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                                  const nuevos = [...productosComboEditables];
                                  nuevos[idx].cantidadTexto = raw;
                                  setProductosComboEditables(nuevos);
                                }
                              }}
                              onBlur={() => {
                                let num = parseFloat(item.cantidadTexto.replace(',', '.'));
                                if (isNaN(num)) num = 0;
                                if (num > item.stock) num = item.stock;
                                actualizarCantidadProductoCombo(idx, num);
                              }}
                              className="w-24 p-1 border border-gray-300 rounded text-sm"
                              placeholder="0"
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
                      value={terminoBusquedaExtra}
                      onChange={(e) => setTerminoBusquedaExtra(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                      disabled={loading}
                    />
                    {terminoBusquedaExtra && productosExtraFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border-2 border-green-200 rounded-lg shadow-lg">
                        {productosExtraFiltrados.map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => agregarProductoExtraCombo(prod)}
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
            {productosExtra.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-700">Productos extra agregados:</h4>
                <div className="space-y-2 mt-2">
                  {productosExtra.map((item, idx) => (
                    <div key={idx} className="bg-yellow-50 p-2 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.nombre}</span>
                        <span className="text-xs ml-2">Cantidad: {item.cantidad} {item.unidad}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.cantidadTexto}
                          onChange={(e) => {
                            let raw = e.target.value;
                            if (raw === '' || /^\d*[.,]?\d*$/.test(raw)) {
                              const nuevos = [...productosExtra];
                              nuevos[idx].cantidadTexto = raw;
                              setProductosExtra(nuevos);
                            }
                          }}
                          onBlur={() => {
                            let num = parseFloat(item.cantidadTexto.replace(',', '.'));
                            if (isNaN(num)) num = 0;
                            if (num > item.stock) num = item.stock;
                            actualizarCantidadExtra(idx, num);
                          }}
                          className="w-20 p-1 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                        <button onClick={() => eliminarExtra(idx)} className="text-red-600 text-sm font-bold">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Motivo y cliente */}
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
            className="px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              loading ||
              (tipoSeleccionado === 'producto' && itemsProductos.length === 0) ||
              (tipoSeleccionado === 'combo' && !comboSeleccionado) ||
              !motivo
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