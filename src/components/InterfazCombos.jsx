import { useState, useEffect } from 'react';

const InterfazCombos = ({ setCombos, productos, onModificarCombo, onAgregarAlHistorial, onAbrirNuevoCombo, usuario }) => {
  const [combos, setCombosLocal] = useState([]);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [comboEditando, setComboEditando] = useState(null);
  const [productoBuscado, setProductoBuscado] = useState('');
  const [productosEncontrados, setProductosEncontrados] = useState([]);
  const [saving, setSaving] = useState(false);
  
  // Estados para el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comboToDelete, setComboToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar combos desde el backend al montar el componente
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await fetch('http://localhost:5228/api/combo');
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();

        const combosFormateados = data.map(combo => ({
          id: combo.id,
          nombre: combo.name,
          productos: combo.products.map(prod => ({
            id: prod.id,
            nombre: prod.nameProduct,
            cantidad: prod.quantity,
            unidad: prod.unity,
            codigo: ''
          })),
          nombreCreador: combo.nameUserOrAdmin
        }));

        setCombosLocal(combosFormateados);
        if (setCombos) setCombos(combosFormateados);
      } catch (error) {
        console.error('Error al cargar combos:', error);
      }
    };
    fetchCombos();
  }, [setCombos]);

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
      setCombosLocal(combosActualizados);
      if (setCombos) setCombos(combosActualizados);
      
      if (comboSeleccionado?.id === comboId) {
        setComboSeleccionado(combosActualizados.find(c => c.id === comboId));
      }
      
      const combo = combos.find(c => c.id === comboId);
      onAgregarAlHistorial('modificacion', 'Producto Eliminado de Combo', 
        `Se eliminó un producto de ${combo.nombre}`);
    }
  };

  const modificarComposicion = (combo) => {
    setComboEditando(JSON.parse(JSON.stringify(combo)));
    setModoEdicion(true);
    setProductoBuscado('');
    setProductosEncontrados([]);
  };

  const guardarCambiosCombo = async () => {
    if (!comboEditando) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa. Inicie sesión nuevamente.');
      return;
    }
    const userId = usuario?.id;
    if (!userId) {
      alert('No se pudo identificar al usuario. Reintente.');
      return;
    }

    const productsIds = comboEditando.productos.map(p => ({
      id: p.id,
      quantity: p.cantidad
    }));

    const payload = {
      id: comboEditando.id,
      name: comboEditando.nombre,
      productsIds: productsIds,
      adminId: null,
      userId: userId
    };

    setSaving(true);
    try {
      const response = await fetch('http://localhost:5228/api/combo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const combosActualizados = combos.map(combo =>
          combo.id === comboEditando.id ? comboEditando : combo
        );
        setCombosLocal(combosActualizados);
        if (setCombos) setCombos(combosActualizados);
        setComboSeleccionado(comboEditando);
        setModoEdicion(false);
        setComboEditando(null);
        
        onAgregarAlHistorial('modificacion', 'Combo Modificado', 
          `Se modificó ${comboEditando.nombre}`);
        if (onModificarCombo) {
          onModificarCombo(comboEditando);
        }
        window.location.reload();
      } else {
        const errorText = await response.text();
        alert(`Error al guardar: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setSaving(false);
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
      id: producto.id,
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
    const simbolos = { 'lb': 'lb', 'kg': 'kg', 'g': 'g', 'L': 'L', 'u': 'u' };
    return simbolos[unidad] || unidad;
  };

  const verificarDisponibilidad = (productoNombre, cantidadNecesaria) => {
    const producto = productos.find(p => p.nombre === productoNombre);
    return producto && producto.cantidad >= cantidadNecesaria;
  };

  // Función para eliminar combo
  const confirmDeleteCombo = (combo) => {
    setComboToDelete(combo);
    setShowDeleteConfirm(true);
  };

  const deleteCombo = async () => {
    if (!comboToDelete) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No hay sesión activa. Inicie sesión nuevamente.');
      setShowDeleteConfirm(false);
      setComboToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:5228/api/combo/${comboToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Eliminar del estado local
        const combosActualizados = combos.filter(c => c.id !== comboToDelete.id);
        setCombosLocal(combosActualizados);
        if (setCombos) setCombos(combosActualizados);
        
        // Si el combo eliminado estaba seleccionado, limpiar selección
        if (comboSeleccionado?.id === comboToDelete.id) {
          setComboSeleccionado(null);
        }
        
        // Registrar en historial
        onAgregarAlHistorial('eliminacion', 'Combo Eliminado', 
          `Se eliminó el combo ${comboToDelete.nombre}`);
        
        setShowDeleteConfirm(false);
        setComboToDelete(null);
        window.location.reload();
        alert('Combo eliminado correctamente');
      } else {
        const errorText = await response.text();
        alert(`Error al eliminar: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setDeleting(false);
    }
  };

  const combosFiltrados = combos.filter(combo =>
    combo.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Gestión de Combos</h2>
      
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
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {terminoBusqueda && (
            <button onClick={() => setTerminoBusqueda('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">{combosFiltrados.length} combos disponibles</p>
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
              <button onClick={(e) => { e.stopPropagation(); setComboSeleccionado(combo); }} className="px-3 py-1.5 border-2 border-blue-500 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 text-xs">
                Ver Detalle
              </button>
              <button onClick={(e) => { e.stopPropagation(); modificarComposicion(combo); }} className="px-3 py-1.5 border-2 border-yellow-500 bg-yellow-50 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 text-xs">
                Modificar
              </button>
              <button onClick={(e) => { e.stopPropagation(); confirmDeleteCombo(combo); }} className="px-3 py-1.5 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 text-xs">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detalle del combo seleccionado (sin cambios) */}
      {comboSeleccionado && !modoEdicion && (
        <div className="mt-8 border-t-2 border-green-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-green-700">Detalle: {comboSeleccionado.nombre}</h3>
            <button onClick={() => modificarComposicion(comboSeleccionado)} className="w-full sm:w-auto px-4 py-2 border-2 border-yellow-500 bg-yellow-50 text-yellow-700 font-bold rounded-lg hover:bg-yellow-100 text-sm">
              Modificar Composición
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto border-2 border-green-100 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-green-50 z-10">
                  <tr>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">#</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Producto</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Cantidad</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Unidad</th>
                    <th className="border-2 border-green-200 p-2 text-left text-xs font-bold">Disponible</th>
                  </tr>
                </thead>
                <tbody>
                  {comboSeleccionado.productos.map((producto, index) => {
                    const disponible = verificarDisponibilidad(producto.nombre, producto.cantidad);
                    return (
                      <tr key={index} className="hover:bg-green-50/50">
                        <td className="border-2 border-green-200 p-2 text-xs">{index + 1}</td>
                        <td className="border-2 border-green-200 p-2 text-xs font-medium">{producto.nombre}</td>
                        <td className="border-2 border-green-200 p-2 text-xs text-center">{producto.cantidad}</td>
                        <td className="border-2 border-green-200 p-2 text-xs text-center">{obtenerSimboloUnidad(producto.unidad)}</td>
                        <td className="border-2 border-green-200 p-2 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {disponible ? 'Sí' : 'No'}
                          </span>
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

      {/* Modo edición de composición (sin cambios) */}
      {modoEdicion && comboEditando && (
        <div className="mt-8 border-t-2 border-yellow-200 pt-6 overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-xl sm:text-2xl font-bold text-yellow-700">Editando: {comboEditando.nombre}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <button onClick={cancelarEdicion} className="w-full px-4 py-2 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 text-sm">
                Cancelar
              </button>
              <button onClick={guardarCambiosCombo} className="w-full px-4 py-2 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 text-sm" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold text-sm mb-2">Agregar producto al combo</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={productoBuscado}
                onChange={(e) => buscarProductos(e.target.value)}
                className="w-full p-3 border-2 border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400"
              />
              {productosEncontrados.length > 0 && (
                <div className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto bg-white border-2 border-yellow-200 rounded-lg shadow-lg">
                  {productosEncontrados.map(producto => (
                    <div key={producto.id} onClick={() => agregarProductoACombo(producto)} className="p-2 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0">
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-xs text-gray-500 ml-2">({producto.unidad})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto border-2 border-yellow-100 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-yellow-50 z-10">
                  <tr>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">#</th>
                    <th className="border-2 border-yellow-200 p-2 text-left text-xs font-bold">Producto</th>
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
                        <input type="text" value={producto.nombre} onChange={(e) => actualizarProductoEditando(index, 'nombre', e.target.value)} className="w-full p-1 border border-yellow-300 rounded text-xs" />
                      </td>
                      <td className="border-2 border-yellow-200 p-2 text-xs">
                        <input type="number" value={producto.cantidad} onChange={(e) => actualizarProductoEditando(index, 'cantidad', parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="w-full sm:w-16 p-1 border border-yellow-300 rounded text-xs" min="0" step="1" />
                      </td>
                      <td className="border-2 border-yellow-200 p-2 text-xs">
                        <span className="text-xs">{producto.unidad}</span>
                      </td>
                      <td className="border-2 border-yellow-200 p-2">
                        <button onClick={() => eliminarProductoEditando(index)} className="px-2 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 text-[10px]">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button onClick={onAbrirNuevoCombo} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl">
          + Nuevo Combo
        </button>
      </div>

      {/* Modal de confirmación para eliminar combo */}
      {showDeleteConfirm && comboToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border-2 border-red-400">
            <h3 className="text-2xl font-extrabold text-red-700 mb-4">Confirmar Eliminación</h3>
            <p className="text-lg font-bold text-gray-800 mb-2">
              ¿Está seguro que desea ELIMINAR el combo?
            </p>
            <div className="bg-red-50 p-4 rounded-lg mb-4 border-2 border-red-300">
              <p className="font-extrabold text-gray-900 text-base">Combo: {comboToDelete.nombre}</p>
              <p className="text-base text-gray-700">Cantidad de productos: {comboToDelete.productos.length}</p>
              <p className="text-base text-gray-700">Acción: eliminar definitivamente del inventario</p>
            </div>
            <p className="text-red-700 text-base font-bold mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={deleteCombo}
                className="px-4 py-2 border-2 border-red-700 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfazCombos;