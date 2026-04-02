import { useState, useEffect } from 'react';

const InterfazCombos = ({ combos, setCombos, productos, onModificarCombo, onAgregarAlHistorial, onAbrirNuevoCombo }) => {
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [comboEditando, setComboEditando] = useState(null);
  const [productoBuscado, setProductoBuscado] = useState('');
  const [productosEncontrados, setProductosEncontrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // Cargar combos desde el backend al montar el componente
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setCargando(true);
        const response = await fetch('http://localhost:5228/api/combo');
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data = await response.json();

        // Mapear la respuesta al formato que usa el componente
        const combosFormateados = data.map(combo => ({
          id: combo.id,
          nombre: combo.name,                     // backend usa "name"
          productos: combo.products.map(prod => ({
            nombre: prod.nameProduct,            // backend usa "nameProduct"
            cantidad: prod.quantity,             // backend usa "quantity"
            unidad: prod.unity,                  // backend usa "unity"
            codigo: prod.codigo || ''            // si no viene, vacío
          })),
          nombreCreador: combo.nameUserOrAdmin
        }));

        setCombos(combosFormateados);
        setErrorCarga(null);
      } catch (error) {
        console.error('Error al cargar combos:', error);
        setErrorCarga('No se pudieron cargar los combos. Intente más tarde.');
      } finally {
        setCargando(false);
      }
    };

    fetchCombos();
  }, [setCombos]); // Dependencia: setCombos (estable, solo se ejecuta una vez)

  // Si está cargando, mostrar un indicador
  if (cargando) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="mt-2 text-gray-600">Cargando combos...</p>
      </div>
    );
  }

  // Si hay error, mostrarlo
  if (errorCarga) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center text-red-600">
        <p>{errorCarga}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Resto del componente (igual que el original, sin cambios en la lógica de edición)
  const combosFiltrados = combos.filter(combo =>
    combo.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const totalProductos = (combo) => {
    return combo.productos.reduce((acc, prod) => acc + prod.cantidad, 0);
  };

  const eliminarProducto = (comboId, productoIndex) => {
    if (window.confirm('¿Estás seguro de eliminar este producto del combo?')) {
      const combosActualizados = combos.map(combo => {
        if (combo.id === comboId) {
          const nuevosProductos = [...combo.productos];
          nuevosProductos.splice(productoIndex, 1);
          return { ...combo, productos: nuevosProductos };
        }
        return combo;
      });
      setCombos(combosActualizados);
      
      if (comboSeleccionado?.id === comboId) {
        setComboSeleccionado(combosActualizados.find(c => c.id === comboId));
      }
      
      const combo = combos.find(c => c.id === comboId);
      onAgregarAlHistorial('modificacion', 'Producto Eliminado de Combo', 
        `Se eliminó un producto de ${combo.nombre}`);
    }
  };

  const modificarComposicion = (combo) => {
    setComboEditando(JSON.parse(JSON.stringify(combo))); // Copia profunda
    setModoEdicion(true);
    setProductoBuscado('');
    setProductosEncontrados([]);
  };

  const guardarCambiosCombo = () => {
    const combosActualizados = combos.map(combo => 
      combo.id === comboEditando.id ? comboEditando : combo
    );
    setCombos(combosActualizados);
    setComboSeleccionado(comboEditando);
    setModoEdicion(false);
    setComboEditando(null);
    
    onAgregarAlHistorial('modificacion', 'Combo Modificado', 
      `Se modificó ${comboEditando.nombre}`);
    if (onModificarCombo) {
      onModificarCombo(comboEditando);
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setComboEditando(null);
  };

  const actualizarProductoEditando = (index, campo, valor) => {
    const nuevosProductos = [...comboEditando.productos];
    nuevosProductos[index][campo] = valor;
    setComboEditando({
      ...comboEditando,
      productos: nuevosProductos
    });
  };

  const eliminarProductoEditando = (index) => {
    const nuevosProductos = comboEditando.productos.filter((_, i) => i !== index);
    setComboEditando({
      ...comboEditando,
      productos: nuevosProductos
    });
  };

  const buscarProductos = (texto) => {
    setProductoBuscado(texto);
    if (texto.length > 1) {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto.toLowerCase()) &&
        !comboEditando.productos.some(prod => prod.nombre === p.nombre)
      );
      setProductosEncontrados(filtrados);
    } else {
      setProductosEncontrados([]);
    }
  };

  const agregarProductoACombo = (producto) => {
    const nuevoProducto = {
      nombre: producto.nombre,
      codigo: producto.codigo || '',
      cantidad: 1,
      unidad: producto.unidad
    };
    
    setComboEditando({
      ...comboEditando,
      productos: [...comboEditando.productos, nuevoProducto]
    });
    
    setProductoBuscado('');
    setProductosEncontrados([]);
  };

  const obtenerSimboloUnidad = (unidad) => {
    const simbolos = {
      'lb': 'lb',
      'kg': 'kg',
      'g': 'g',
      'L': 'L',
      'u': 'u'
    };
    return simbolos[unidad] || unidad;
  };

  const verificarDisponibilidad = (productoNombre, cantidadNecesaria) => {
    const producto = productos.find(p => p.nombre === productoNombre);
    return producto && producto.cantidad >= cantidadNecesaria;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
        Gestión de Combos
      </h2>
      
      {/* Buscador */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar combo por nombre..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="w-full p-3 pl-10 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 text-sm"
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
          {terminoBusqueda && (
            <button
              onClick={() => setTerminoBusqueda('')}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {combosFiltrados.length} combos disponibles
        </p>
      </div>

      {/* Grid de combos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {combosFiltrados.map((combo) => (
          <div
            key={combo.id}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              comboSeleccionado?.id === combo.id && !modoEdicion
                ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
            onClick={() => !modoEdicion && setComboSeleccionado(combo)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-green-700">{combo.nombre}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {combo.productos.length} productos • Total: {totalProductos(combo)} unidades
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setComboSeleccionado(combo);
                }}
                className="px-3 py-1.5 border-2 border-blue-500 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-all duration-300 text-xs"
              >
                Ver Detalle
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  modificarComposicion(combo);
                }}
                className="px-3 py-1.5 border-2 border-yellow-500 bg-yellow-50 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-300 text-xs"
              >
                Modificar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detalle del combo seleccionado */}
      {comboSeleccionado && !modoEdicion && (
        <div className="mt-8 border-t-2 border-green-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-green-700">
              Detalle: {comboSeleccionado.nombre}
            </h3>
            <button
              onClick={() => modificarComposicion(comboSeleccionado)}
              className="w-full sm:w-auto px-4 py-2 border-2 border-yellow-500 bg-yellow-50 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-300 text-sm"
            >
              Modificar Composición
            </button>
          </div>

          {/* Tabla de productos del combo */}
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto border-2 border-green-100 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-green-50 z-10">
                  <tr>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">#</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Producto</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Código</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Cantidad</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Unidad</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Disponible</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comboSeleccionado.productos.map((producto, index) => {
                    const disponible = verificarDisponibilidad(producto.nombre, producto.cantidad);
                    return (
                      <tr key={index} className="hover:bg-green-50/50">
                        <td className="border-2 border-green-200 p-2 text-xs">{index + 1}</td>
                        <td className="border-2 border-green-200 p-2 text-xs font-medium">{producto.nombre}</td>
                        <td className="border-2 border-green-200 p-2 text-xs font-mono">{producto.codigo || '—'}</td>
                        <td className="border-2 border-green-200 p-2 text-xs text-center">{producto.cantidad}</td>
                        <td className="border-2 border-green-200 p-2 text-xs text-center">{obtenerSimboloUnidad(producto.unidad)}</td>
                        <td className="border-2 border-green-200 p-2 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {disponible ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="border-2 border-green-200 p-2">
                          <button
                            onClick={() => eliminarProducto(comboSeleccionado.id, index)}
                            className="px-2 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-[10px]"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modo edición de composición */}
      {modoEdicion && comboEditando && (
        <div className="mt-8 border-t-2 border-yellow-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-yellow-700">
              Editando: {comboEditando.nombre}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <button
                onClick={cancelarEdicion}
                className="w-full px-4 py-2 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambiosCombo}
                className="w-full px-4 py-2 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-all duration-300 text-sm"
              >
                Guardar Cambios
              </button>
            </div>
          </div>

          {/* Buscador para agregar productos */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Agregar producto al combo
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={productoBuscado}
                onChange={(e) => buscarProductos(e.target.value)}
                className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400"
              />
              {productosEncontrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border-2 border-yellow-200 rounded-lg shadow-lg">
                  {productosEncontrados.map(producto => (
                    <div
                      key={producto.id}
                      onClick={() => agregarProductoACombo(producto)}
                      className="p-2 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0"
                    >
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">({producto.unidad})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabla editable */}
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto border-2 border-yellow-100 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-yellow-50 z-10">
                  <tr>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">#</th>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">Producto</th>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">Código</th>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">Cantidad</th>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">Unidad</th>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comboEditando.productos.map((producto, index) => (
                    <tr key={index} className="hover:bg-yellow-50/50">
                      <td className="border-2 border-yellow-200 p-2 text-xs">{index + 1}</td>
                      <td className="border-2 border-yellow-200 p-2 text-xs font-medium">
                        <input
                          type="text"
                          value={producto.nombre}
                          onChange={(e) => actualizarProductoEditando(index, 'nombre', e.target.value)}
                          className="w-full p-1 border border-yellow-300 rounded text-xs"
                        />
                      </td>
                      <td className="border-2 border-yellow-200 p-2 text-xs">
                        <input
                          type="text"
                          value={producto.codigo || ''}
                          onChange={(e) => actualizarProductoEditando(index, 'codigo', e.target.value)}
                          className="w-full p-1 border border-yellow-300 rounded text-xs"
                          placeholder="Código"
                        />
                      </td>
                      <td className="border-2 border-yellow-200 p-2 text-xs">
                        <input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) => actualizarProductoEditando(index, 'cantidad', parseInt(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="w-full sm:w-16 p-1 border border-yellow-300 rounded text-xs"
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </td>
                      <td className="border-2 border-yellow-200 p-2 text-xs">
                        <select
                          value={producto.unidad}
                          onChange={(e) => actualizarProductoEditando(index, 'unidad', e.target.value)}
                          className="w-full sm:w-16 p-1 border border-yellow-300 rounded text-xs"
                        >
                          <option value="lb">lb</option>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="L">L</option>
                          <option value="u">u</option>
                        </select>
                      </td>
                      <td className="border-2 border-yellow-200 p-2">
                        <button
                          onClick={() => eliminarProductoEditando(index)}
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

      {/* Botón para nuevo combo */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onAbrirNuevoCombo}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl"
        >
          + Nuevo Combo
        </button>
      </div>
    </div>
  );
};

export default InterfazCombos;