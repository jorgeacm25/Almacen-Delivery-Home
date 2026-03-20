import { useState, useEffect } from 'react';

const FormularioSalida = ({ productos, combos, onRegistrarSalida, onCerrar }) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('producto');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [comboSeleccionado, setComboSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  useEffect(() => {
    if (tipoSeleccionado === 'producto') {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [terminoBusqueda, productos, tipoSeleccionado]);

  const handleRegistrarSalida = () => {
    if (!motivo) {
      setError('Debe especificar un motivo para la salida');
      return;
    }

    if (tipoSeleccionado === 'producto') {
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

      onRegistrarSalida({
        tipo: 'producto',
        producto: productoSeleccionado,
        cantidad: cantidad,
        motivo: motivo
      });
    } else {
      if (!comboSeleccionado) {
        setError('Debe seleccionar un combo');
        return;
      }

      const productosSinStock = [];
      comboSeleccionado.productos.forEach(item => {
        const productoEnStock = productos.find(p => p.nombre === item.nombre);
        if (!productoEnStock || productoEnStock.cantidad < item.cantidad) {
          productosSinStock.push(`${item.nombre} (requiere ${item.cantidad} ${item.unidad})`);
        }
      });

      if (productosSinStock.length > 0) {
        setError(`No hay suficiente stock para los siguientes productos:\n${productosSinStock.join('\n')}`);
        return;
      }

      onRegistrarSalida({
        tipo: 'combo',
        combo: comboSeleccionado,
        motivo: motivo
      });
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
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  min="1"
                  max={productoSeleccionado.cantidad}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo disponible: {productoSeleccionado.cantidad} {productoSeleccionado.unidad}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Seleccionar Combo
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 mb-4">
              {combos.map(combo => {
                const tieneStock = combo.productos.every(item => {
                  const productoEnStock = productos.find(p => p.nombre === item.nombre);
                  return productoEnStock && productoEnStock.cantidad >= item.cantidad;
                });

                return (
                  <div
                    key={combo.id}
                    onClick={() => setComboSeleccionado(combo)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      comboSeleccionado?.id === combo.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold">{combo.nombre}</span>
                        <span className="text-sm text-gray-600 ml-2">${combo.precio.toFixed(2)}</span>
                      </div>
                      {!tieneStock && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Sin stock
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {combo.productos.length} productos
                    </p>
                  </div>
                );
              })}
            </div>

            {comboSeleccionado && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-bold text-blue-700 mb-2">Composición del Combo:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {comboSeleccionado.productos.map((item, index) => {
                    const productoEnStock = productos.find(p => p.nombre === item.nombre);
                    const tieneStockSuficiente = productoEnStock && productoEnStock.cantidad >= item.cantidad;
                    
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.cantidad} {item.unidad}</span>
                          {productoEnStock ? (
                            <span className={`text-xs ${tieneStockSuficiente ? 'text-green-600' : 'text-red-600'}`}>
                              (Stock: {productoEnStock.cantidad})
                            </span>
                          ) : (
                            <span className="text-xs text-red-600">(No existe)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-bold text-sm mb-2">
            Motivo de la Salida <span className="text-red-500">*</span>
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
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
            <label className="block text-gray-700 font-bold text-sm mb-2">
              Especifique el motivo
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
              placeholder="Describa el motivo..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCerrar}
            className="px-4 py-3 border-2 border-gray-500 bg-gray-50 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegistrarSalida}
            className="px-4 py-3 border-2 border-green-500 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(tipoSeleccionado === 'producto' && !productoSeleccionado) || 
                     (tipoSeleccionado === 'combo' && !comboSeleccionado) || 
                     !motivo}
          >
            Registrar Salida
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioSalida;