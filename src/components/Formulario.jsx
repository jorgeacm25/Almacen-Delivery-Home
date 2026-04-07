import { useState } from "react";
import Tooltip from "./UI/Tooltip.jsx";

const Formulario = ({ onAgregarProducto, onCerrar, usuario }) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [nombre, setNombre] = useState(''); 
  const [categoria, setCategoria] = useState('Alimentos');
  const [cantidad, setCantidad] = useState(''); 
  const [unidad, setUnidad] = useState('u');   // 👈 nueva unidad
  const [fechaentrada, setFechaEntrada] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(''); 
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider , setProvider] = useState('');

  const validarPasoActual = () => {
    if (pasoActual === 1) {
      if (!nombre.trim()) {
        setError(true);
        return false;
      }
    }
    if (pasoActual === 2) {
      if (!cantidad || Number(cantidad) <= 0) {
        setError(true);
        return false;
      }
      // La unidad ya está seleccionada por defecto, no hace falta validar
    }
    if (pasoActual === 3) {
      if (!fechaentrada) {
        setError(true);
        return false;
      }
    }
    setError(false);
    return true;
  };

  const irSiguientePaso = () => {
    if (!validarPasoActual()) return;
    setPasoActual((prev) => Math.min(prev + 1, 3));
  };

  const irPasoAnterior = () => {
    setError(false);
    setPasoActual((prev) => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !cantidad || !fechaentrada) {
      setError(true);
      return;
    }
    setError(false);
    
    // Obtener token y userId
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

    // Preparar fecha de vencimiento en formato ISO (si existe)
    let endDate = null;
    if (fechaVencimiento) {
      endDate = new Date(fechaVencimiento).toISOString();
    }

    const payload = {
      productName: nombre,
      quantity: parseInt(cantidad),
      unity: unidad,        
      endDate: endDate,
      adminId: null,
      userId: userId,
      category: categoria,
      provider : provider
    };

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5228/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const nuevoProductoBackend = await response.json();
        onAgregarProducto({
          id: nuevoProductoBackend.id,
          nombre: nombre,
          categoria: categoria,
          cantidad: parseInt(cantidad),
          unidad: unidad,
          fechaEntrada: fechaentrada,
          fechaVencimiento: fechaVencimiento || null,
          operador: usuario?.nombre || usuario?.username,
          proveedor: usuario?.username || 'Sistema'
        });
        onCerrar();
        window.location.reload();
      } else {
        const errorText = await response.text();
        alert(`Error al guardar: ${errorText}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const TITULOS_PASOS = {
    1: 'Paso 1 de 3: Informacion basica',
    2: 'Paso 2 de 3: Cantidad y unidad',
    3: 'Paso 3 de 3: Fechas',
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl py-8 px-6 border-4 border-orange-300"
      >
        <div className="text-center mb-6">
          <h3 className="text-3xl font-extrabold text-green-700">
            Nuevo Producto
          </h3>
          <p className="text-base font-semibold text-gray-700 mt-2">{TITULOS_PASOS[pasoActual]}</p>
          <div className="w-20 h-1 bg-green-500 mx-auto mt-2 rounded-full"></div>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map((paso) => (
              <div key={paso} className={`h-2 flex-1 rounded-full ${paso <= pasoActual ? 'bg-green-600' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-700 text-white text-center p-4 text-base uppercase font-bold mb-5 rounded-lg shadow">
            <p>Verifique los campos obligatorios de este paso</p>
          </div>
        )}

        {pasoActual === 1 && (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <label htmlFor="producto" className="block text-gray-900 uppercase font-extrabold text-base">
                  Nombre de Producto <span className="text-red-600">*</span>
                </label>
                <Tooltip texto="Ingrese el nombre exacto del producto" posicion="arriba">
                  <span className="text-orange-800 border-2 border-orange-700 rounded-full w-7 h-7 inline-flex items-center justify-center font-extrabold bg-white">?</span>
                </Tooltip>
              </div>
              <input 
                type="text" 
                id="producto"
                placeholder="Ejemplo: Arroz de 5 kg"
                className="border-2 border-orange-500 w-full p-3 text-base placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)} 
                disabled={loading}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="categoria" className="block text-gray-900 uppercase font-extrabold text-base mb-2">
                Categoria <span className="text-red-600">*</span>
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border-2 border-orange-500 w-full p-3 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all bg-white"
                disabled={loading}
              >
                <option value="Alimentos">Alimentos</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Aseo">Aseo</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </>
        )}

        {pasoActual === 2 && (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <label htmlFor="cantidad" className="block text-gray-900 uppercase font-extrabold text-base">
                  Cantidad <span className="text-red-600">*</span>
                </label>
                <Tooltip texto="Escriba la cantidad total disponible" posicion="arriba">
                  <span className="text-orange-800 border-2 border-orange-700 rounded-full w-7 h-7 inline-flex items-center justify-center font-extrabold bg-white">?</span>
                </Tooltip>
              </div>
              <input 
                type="number" 
                id="cantidad"
                placeholder="0"
                className="border-2 border-orange-500 w-full p-3 text-base placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                onFocus={(e) => e.target.select()}
                min="0"
                disabled={loading}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="unidad" className="block text-gray-900 uppercase font-extrabold text-base mb-2">
                Unidad de Medida <span className="text-red-600">*</span>
              </label>
              <select
                id="unidad"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="border-2 border-orange-500 w-full p-3 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all bg-white"
                disabled={loading}
              >
                <option value="u">Unidades (u)</option>
                <option value="g">Gramos (g)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="lb">Libras (lb)</option>
                <option value="L">Litros (L)</option>
                <option value="ml">Mililitros (ml)</option>
              </select>
            </div>
          </>
        )}

        {pasoActual === 3 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="FechaEntrada" className="block text-gray-900 uppercase font-extrabold text-base mb-2">
                  Fecha Entrada <span className="text-red-600">*</span>
                </label>
                <input 
                  type="date" 
                  id="FechaEntrada"
                  className="w-full px-3 py-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all text-base bg-white"
                  value={fechaentrada}
                  onChange={(e) => setFechaEntrada(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="FechaVencimiento" className="block text-gray-900 uppercase font-extrabold text-base mb-2">
                  Fecha Vencimiento <span className="text-gray-500 text-sm">(opcional)</span>
                </label>
                <input 
                  type="date" 
                  id="FechaVencimiento"
                  className="w-full px-3 py-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all text-base bg-white"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <label htmlFor="operador" className="block text-gray-900 uppercase font-extrabold text-base">
                  Operador
                </label>
                <Tooltip texto="Se usará el nombre del usuario que inició sesión" posicion="arriba">
                  <span className="text-orange-800 border-2 border-orange-700 rounded-full w-7 h-7 inline-flex items-center justify-center font-extrabold bg-white">?</span>
                </Tooltip>
              </div>
              <div className="border-2 border-gray-300 bg-gray-100 p-3 rounded-lg text-base">
                {usuario?.nombre || usuario?.username || 'No especificado'}
              </div>
              <div>
                <label htmlFor="Provider" className="block text-gray-900 uppercase font-extrabold text-base mb-2">
                  Proveedor <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text" 
                  id="Provider"
                  className="w-full px-3 py-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all text-base bg-white"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <button 
            type="button"
            className="w-full px-5 py-3 border-2 border-red-700 bg-white text-red-700 font-extrabold rounded-lg hover:bg-red-50 hover:shadow transition-all duration-300 text-base cursor-pointer"
            onClick={onCerrar}
            disabled={loading}
          >
            Cancelar
          </button>

          {pasoActual > 1 && (
            <button 
              type="button"
              className="w-full px-5 py-3 border-2 border-blue-700 bg-white text-blue-700 font-extrabold rounded-lg hover:bg-blue-50 hover:shadow transition-all duration-300 text-base cursor-pointer"
              onClick={irPasoAnterior}
              disabled={loading}
            >
              Atras
            </button>
          )}

          {pasoActual < 3 ? (
            <button 
              type="button"
              className="w-full px-5 py-3 border-2 border-green-700 bg-white text-green-700 font-extrabold rounded-lg hover:bg-green-50 hover:shadow transition-all duration-300 text-base cursor-pointer"
              onClick={irSiguientePaso}
              disabled={loading}
            >
              Siguiente
            </button>
          ) : (
            <button 
              type="submit"
              className="w-full px-5 py-3 border-2 border-green-700 bg-green-700 text-white font-extrabold rounded-lg hover:bg-green-800 hover:shadow transition-all duration-300 text-base cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Formulario;