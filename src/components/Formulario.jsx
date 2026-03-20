import { useState } from "react";
import Tooltip from "./UI/Tooltip.jsx";

const Formulario = ({ onAgregarProducto, onCerrar }) => {
  const [pasoActual, setPasoActual] = useState(1);
  const [nombre, setNombre] = useState(''); 
  const [categoria, setCategoria] = useState('Alimentos');
  const [cantidad, setCantidad] = useState(''); 
  const [peso, setPeso] = useState(''); 
  const [unidadPeso, setUnidadPeso] = useState('g');
  const [fechaentrada, setFechaEntrada] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(''); 
  const [operador, setOperador] = useState(''); 
  const [error, setError] = useState(false);

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
    }
    if (pasoActual === 3) {
      if ([fechaentrada, operador].includes('')) {
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
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    if([nombre, cantidad, fechaentrada, operador].includes('')){
      setError(true);
      return
    }
    setError(false);
    
    // Determinar la unidad a mostrar
    let unidad = '';
    if (peso) {
      unidad = unidadPeso;
    } else {
      unidad = 'u'; // Por defecto, si no hay peso, es unidad
    }
    
    const nuevoProducto = {
      nombre,
      categoria,
      cantidad: parseInt(cantidad), // Asegurar que sea número
      unidad: unidad,
      fechaEntrada: fechaentrada,
      fechaVencimiento: fechaVencimiento || '', // Si no hay fecha, vacío
    };
    
    console.log('Agregando producto:', nuevoProducto); // Para debugging
    onAgregarProducto(nuevoProducto);
    onCerrar();
  }

  const TITULOS_PASOS = {
    1: 'Paso 1 de 3: Informacion basica',
    2: 'Paso 2 de 3: Cantidad y unidad',
    3: 'Paso 3 de 3: Fechas y operador',
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
                <Tooltip texto="¿QUE ES ESTO? Ingrese el nombre exacto del producto tal como aparece en el inventario" posicion="arriba">
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
                <Tooltip texto="¿QUE ES ESTO? Escriba la cantidad total disponible en almacen" posicion="arriba">
                  <span className="text-orange-800 border-2 border-orange-700 rounded-full w-7 h-7 inline-flex items-center justify-center font-extrabold bg-white">?</span>
                </Tooltip>
              </div>
              <input 
                type="number" 
                id="cantidad"
                placeholder="Cantidad"
                className="border-2 border-orange-500 w-full p-3 text-base placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="Peso" className="block text-gray-900 uppercase font-extrabold text-base mb-2">
                Peso <span className="text-gray-500 text-sm">(opcional)</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  id="Peso"
                  placeholder="Peso"
                  className="w-36 border-2 border-orange-500 p-3 text-base placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <select
                  value={unidadPeso}
                  onChange={(e) => setUnidadPeso(e.target.value)}
                  className="flex-1 border-2 border-orange-500 p-3 text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all bg-white text-gray-800 font-bold"
                >
                  <option value="g">Gramos (g)</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="lb">Libras (lb)</option>
                </select>
              </div>
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
                />
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <label htmlFor="operador" className="block text-gray-900 uppercase font-extrabold text-base">
                  Nombre de Operador <span className="text-red-600">*</span>
                </label>
                <Tooltip texto="¿QUE ES ESTO? Nombre de la persona que registra esta entrada" posicion="arriba">
                  <span className="text-orange-800 border-2 border-orange-700 rounded-full w-7 h-7 inline-flex items-center justify-center font-extrabold bg-white">?</span>
                </Tooltip>
              </div>
              <input 
                type="text" 
                id="operador"
                placeholder="Nombre del Operador"
                className="border-2 border-orange-500 w-full p-3 text-base placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 transition-all"
                value={operador}
                onChange={(e) => setOperador(e.target.value)} 
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <button 
            type="button"
            className="w-full px-5 py-3 border-2 border-red-700 bg-white text-red-700 font-extrabold rounded-lg hover:bg-red-50 hover:shadow transition-all duration-300 text-base cursor-pointer"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          {pasoActual > 1 ? (
            <button 
              type="button"
              className="w-full px-5 py-3 border-2 border-blue-700 bg-white text-blue-700 font-extrabold rounded-lg hover:bg-blue-50 hover:shadow transition-all duration-300 text-base cursor-pointer"
              onClick={irPasoAnterior}
            >
              Atras
            </button>
          ) : (
            <div />
          )}

          {pasoActual < 3 ? (
            <button 
              type="button"
              className="w-full px-5 py-3 border-2 border-green-700 bg-white text-green-700 font-extrabold rounded-lg hover:bg-green-50 hover:shadow transition-all duration-300 text-base cursor-pointer"
              onClick={irSiguientePaso}
            >
              Siguiente
            </button>
          ) : (
            <button 
              type="submit"
              className="w-full px-5 py-3 border-2 border-green-700 bg-green-700 text-white font-extrabold rounded-lg hover:bg-green-800 hover:shadow transition-all duration-300 text-base cursor-pointer"
            >
              Guardar Producto
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default Formulario;