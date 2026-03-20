import Header from './components/Header.jsx'
import Formulario from './components/Formulario.jsx'
import InterfazSalida from './components/InterfazSalida.jsx'
import InterfazHistorial from './components/InterfazHistorial.jsx'
import AuthGerenteForm from './components/AuthGerenteForm.jsx'
import RegistroTrabajadorForm from './components/RegistroTrabajadorForm.jsx'
import FormLogin from './components/FormLogin.jsx'
import ModalAgregarCantidad from './components/ModalAgregarCantidad.jsx'
import ModalModificarProducto from './components/ModalModificarProducto.jsx'
import ModalInfoProducto from './components/ModalInfoProducto.jsx'
import ModalConfirmarEliminar from './components/ModalConfirmarEliminar.jsx'
import ModalNuevoCombo from './components/ModalNuevoCombo.jsx'
import InterfazCombos from './components/InterfazCombos.jsx'
import AlertasNotificaciones from './components/AlertasNotificaciones.jsx'
import DashboardPrincipal from './components/DashboardPrincipal.jsx'
import SeccionReportes from './components/SeccionReportes.jsx'
import { Fragment, useState } from 'react'
import { useStockAlerts } from './hooks/useStockAlerts.js'
import { useAtajosTeclado } from './hooks/useAtajosTeclado.js'
import Tooltip from './components/UI/Tooltip.jsx'
import fondo from './assets/fondo.png'
import logoFondo from './assets/LogoFondo.png'
import { productosData, combosData } from './data/almacenData.js'
import { historialData } from './data/historialData.js'
import { buscarUsuario } from './data/usuarios.js'

const obtenerCategoriaAutomatica = (nombre = '') => {
  const n = nombre.toLowerCase();
  if (n.includes('aceite') || n.includes('vinagre') || n.includes('vino') || n.includes('refresco') || n.includes('malta') || n.includes('cafe') || n.includes('leche')) {
    return 'Bebidas';
  }
  if (n.includes('detergente') || n.includes('estropajo') || n.includes('colcha limpiar')) {
    return 'Limpieza';
  }
  if (n.includes('jabon') || n.includes('pasta dental') || n.includes('papel sanitario')) {
    return 'Aseo';
  }
  if (n.trim().length > 0) {
    return 'Alimentos';
  }
  return 'Otros';
};

const obtenerCodigoPorNombre = (nombreProducto = '', combos = []) => {
  for (const combo of combos) {
    for (const producto of combo.productos || []) {
      if ((producto.nombre || '').toLowerCase() === nombreProducto.toLowerCase()) {
        return producto.codigo || '';
      }
    }
  }
  return '';
};

const diasHastaFecha = (fechaISO) => {
  if (!fechaISO) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return null;
  fecha.setHours(0, 0, 0, 0);
  return Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));
};

const obtenerEstadoStock = (cantidad) => {
  if (cantidad === 0) {
    return { clase: 'stock-critico', estado: 'Crítico', icon: '⚠️' };
  }
  if (cantidad <= 50) {
    return { clase: 'stock-bajo', estado: 'Bajo', icon: '⚡' };
  }
  return { clase: 'stock-normal', estado: 'Normal', icon: '✅' };
};

function App() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarModalNuevoCombo, setMostrarModalNuevoCombo] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [pasoRegistro, setPasoRegistro] = useState('');
  
  // Estados para modales de acciones
  const [modalAgregar, setModalAgregar] = useState({ abierto: false, producto: null });
  const [modalModificar, setModalModificar] = useState({ abierto: false, producto: null });
  const [modalInfo, setModalInfo] = useState({ abierto: false, producto: null });
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, producto: null });
  
  // Estados para manejar la selección de sección
  const [seccionActiva, setSeccionActiva] = useState(null); // 'combos', 'productos', 'salida', 'historial'

  // Estado para el buscador
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroVencimiento, setFiltroVencimiento] = useState('todos');
  const [filtroProveedor, setFiltroProveedor] = useState('todos');
  const [stockMin, setStockMin] = useState('');
  const [stockMax, setStockMax] = useState('');

  // Base de datos de productos
  const [productos, setProductos] = useState(
    productosData.map((producto) => ({
      ...producto,
      categoria: producto.categoria || obtenerCategoriaAutomatica(producto.nombre),
    }))
  );
  
  // Base de datos de combos
  const [combos, setCombos] = useState(combosData);
  
  // Base de datos del historial
  const [historial, setHistorial] = useState(historialData);

  // Hook para detectar alertas de stock y vencimiento
  // umbralStockMinimo: 50, diasAlerta: 7 (default)
  const alertas = useStockAlerts(productos, 50, 7);

  // Función para agregar al historial
  const agregarAlHistorial = (tipo, accion, detalle) => {
    const nuevaEntrada = {
      id: historial.length + 1,
      fecha: new Date().toLocaleString('es-CU', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ''),
      tipo,
      accion,
      detalle,
      usuario: usuario?.nombre || 'Sistema'
    };
    setHistorial([nuevaEntrada, ...historial]);
  };

  const handleLoginTrabajador = (datosUsuario) => {
    setUsuario(datosUsuario);
    setMostrarModalAuth(false);
    setPasoRegistro('');
    agregarAlHistorial('login', 'Inicio de Sesión', `Usuario ${datosUsuario.nombre} inició sesión`);
  };

  const handleAuthGerenteExitoso = () => {
    setPasoRegistro('registro');
  };

  const handleRegistroExitoso = (nuevoTrabajador) => {
    alert(`Trabajador ${nuevoTrabajador.nombre} registrado exitosamente`);
    setMostrarModalAuth(false);
    setPasoRegistro('');
    agregarAlHistorial('registro', 'Nuevo Trabajador', `Se registró a ${nuevoTrabajador.nombre}`);
  };

  const handleLogout = () => {
    agregarAlHistorial('logout', 'Cierre de Sesión', `Usuario ${usuario?.nombre} cerró sesión`);
    setUsuario(null);
    setSeccionActiva(null);
    setMostrarFormulario(false);
  };

  const abrirRegistro = () => {
    setPasoRegistro('auth');
    setMostrarModalAuth(true);
  };

  const abrirLogin = () => {
    setPasoRegistro('login');
    setMostrarModalAuth(true);
  };

  // Función de autenticación para trabajadores
  const autenticarTrabajador = async (formValues) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const usuario = buscarUsuario(formValues.username, formValues.password);
        if (usuario) {
          handleLoginTrabajador(usuario);
          resolve({ success: true, user: usuario });
        } else {
          resolve({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
      }, 500);
    });
  };

  const handleCombosClick = () => {
    setSeccionActiva('combos');
    setMostrarFormulario(false);
  };

  const handleProductosClick = () => {
    setSeccionActiva('productos');
    setMostrarFormulario(false);
  };

  const handleSalidaClick = () => {
    setSeccionActiva('salida');
    setMostrarFormulario(false);
  };
  
  const handleHistorialClick = () => {
    setSeccionActiva('historial');
    setMostrarFormulario(false);
  };

  const handleReportesClick = () => {
    setSeccionActiva('reportes');
    setMostrarFormulario(false);
  };

  const handleDashboardClick = () => {
    setSeccionActiva(null);
    setMostrarFormulario(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltroCategoria('todas');
    setFiltroProveedor('todos');
    setFiltroVencimiento('todos');
    setStockMin('');
    setStockMax('');
    setTerminoBusqueda('');
  };

  // Funciones para acciones de productos
  const agregarProducto = (nuevoProducto) => {
    const nuevoId = productos.length + 1;
    const productoConCategoria = {
      id: nuevoId,
      ...nuevoProducto,
      categoria: nuevoProducto.categoria || obtenerCategoriaAutomatica(nuevoProducto.nombre),
    };
    setProductos([...productos, productoConCategoria]);
    agregarAlHistorial('entrada', 'Nuevo Producto', 
      `Se agregó ${nuevoProducto.nombre} (${nuevoProducto.cantidad} ${nuevoProducto.unidad})`);
    setMostrarFormulario(false);
  };

  const agregarCantidad = (id, cantidadAgregar) => {
    const producto = productos.find(p => p.id === id);
    setProductos(productos.map(producto => 
      producto.id === id 
        ? { ...producto, cantidad: producto.cantidad + cantidadAgregar }
        : producto
    ));
    agregarAlHistorial('entrada', 'Entrada de Producto', 
      `Se agregaron ${cantidadAgregar} ${producto.unidad} a ${producto.nombre}`);
    setModalAgregar({ abierto: false, producto: null });
  };

  const modificarProducto = (id, productoModificado) => {
    const productoOriginal = productos.find(p => p.id === id);
    setProductos(productos.map(producto => 
      producto.id === id ? productoModificado : producto
    ));
    agregarAlHistorial('modificacion', 'Producto Modificado', 
      `Se modificó ${productoOriginal.nombre}`);
    setModalModificar({ abierto: false, producto: null });
  };

  const eliminarProducto = (id) => {
    const producto = productos.find(p => p.id === id);
    setProductos(productos.filter(producto => producto.id !== id));
    agregarAlHistorial('eliminacion', 'Producto Eliminado', 
      `Se eliminó ${producto.nombre}`);
    setModalEliminar({ abierto: false, producto: null });
  };

  // Función para crear nuevo combo
  const crearNuevoCombo = (nombreCombo, productosSeleccionados) => {
    const nuevoId = combos.length + 1;
    const nuevoCombo = {
      id: nuevoId,
      nombre: nombreCombo,
      productos: productosSeleccionados
    };
    setCombos([...combos, nuevoCombo]);
    agregarAlHistorial('creacion', 'Nuevo Combo', 
      `Se creó ${nombreCombo} con ${productosSeleccionados.length} productos`);
    setMostrarModalNuevoCombo(false);
  };

  // Función para modificar combo
  const modificarCombo = (comboModificado) => {
    setCombos(combos.map(combo => 
      combo.id === comboModificado.id ? comboModificado : combo
    ));
    agregarAlHistorial('modificacion', 'Combo Modificado', 
      `Se modificó ${comboModificado.nombre}`);
  };

  // Función para registrar salida múltiple
  const registrarSalidaMultiple = (items, tipoSalida = 'producto', comboInfo = null) => {
    let productosActualizados = [...productos];
    let detalle = '';
    
    if (tipoSalida === 'producto') {
      items.forEach(item => {
        productosActualizados = productosActualizados.map(producto => {
          if (producto.id === item.producto.id) {
            return {
              ...producto,
              cantidad: producto.cantidad - item.cantidad
            };
          }
          return producto;
        });
      });
      detalle = `Salida de ${items.length} productos (${items.map(i => `${i.cantidad} ${i.producto.nombre}`).join(', ')})`;
    } else {
      // Salida de combo
      comboInfo.productos.forEach(item => {
        productosActualizados = productosActualizados.map(producto => {
          if (producto.nombre === item.nombre) {
            return {
              ...producto,
              cantidad: producto.cantidad - item.cantidad
            };
          }
          return producto;
        });
      });
      detalle = `Salida de combo ${comboInfo.nombre} (${comboInfo.productos.length} productos)`;
    }
    
    setProductos(productosActualizados);
    agregarAlHistorial('salida', 'Salida de Inventario', detalle);
    alert(`Salida registrada exitosamente`);
    setSeccionActiva(null);
  };

  const productosEnriquecidos = productos.map((producto) => ({
    ...producto,
    categoria: producto.categoria || obtenerCategoriaAutomatica(producto.nombre),
    proveedor: producto.proveedor || producto.operador || 'Sin proveedor',
    codigoProducto: producto.codigoProducto || obtenerCodigoPorNombre(producto.nombre, combos),
  }));

  const proveedoresDisponibles = Array.from(
    new Set(productosEnriquecidos.map((p) => p.proveedor).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const categoriasDisponibles = Array.from(
    new Set(productosEnriquecidos.map((p) => p.categoria).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // Filtrar productos por texto, código, categoría, proveedor, vencimiento y rango de stock
  const productosFiltrados = productosEnriquecidos.filter((producto) => {
    const termino = terminoBusqueda.toLowerCase().trim();
    const coincideTexto =
      !termino ||
      producto.nombre.toLowerCase().includes(termino) ||
      (producto.codigoProducto || '').toLowerCase().includes(termino);

    const coincideCategoria =
      filtroCategoria === 'todas' || producto.categoria === filtroCategoria;

    const coincideProveedor =
      filtroProveedor === 'todos' || producto.proveedor === filtroProveedor;

    const cantidad = Number(producto.cantidad) || 0;
    const min = stockMin === '' ? null : Number(stockMin);
    const max = stockMax === '' ? null : Number(stockMax);
    const coincideStock =
      (min === null || cantidad >= min) && (max === null || cantidad <= max);

    const diasVencimiento = diasHastaFecha(producto.fechaVencimiento);
    let coincideVencimiento = true;
    if (filtroVencimiento === 'vencidos') {
      coincideVencimiento = diasVencimiento !== null && diasVencimiento < 0;
    } else if (filtroVencimiento === '7dias') {
      coincideVencimiento = diasVencimiento !== null && diasVencimiento >= 0 && diasVencimiento <= 7;
    } else if (filtroVencimiento === '30dias') {
      coincideVencimiento = diasVencimiento !== null && diasVencimiento >= 0 && diasVencimiento <= 30;
    } else if (filtroVencimiento === 'sinfecha') {
      coincideVencimiento = !producto.fechaVencimiento;
    }

    return (
      coincideTexto &&
      coincideCategoria &&
      coincideProveedor &&
      coincideStock &&
      coincideVencimiento
    );
  });

  const productosPorCategoria = productosFiltrados.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Sin categoria';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {});

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  };

  // Atajos de teclado
  useAtajosTeclado([
    {
      teclas: { ctrl: true, tecla: 'b' },
      callback: () => {
        setSeccionActiva('productos');
        setTerminoBusqueda('');
        setTimeout(() => document.querySelector('input[placeholder*="Buscar"]')?.focus(), 0);
      }
    },
    {
      teclas: { ctrl: true, tecla: 'l' },
      callback: () => {
        if (usuario) {
          handleLogout();
        } else {
          abrirLogin();
        }
      }
    },
    {
      teclas: { ctrl: true, tecla: 'n' },
      callback: () => {
        if (usuario && seccionActiva === 'productos') {
          setMostrarFormulario(true);
        }
      }
    },
    {
      teclas: { ctrl: true, tecla: 'h' },
      callback: handleDashboardClick
    }
  ]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${fondo})` }}
      ></div>
      
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src={logoFondo} 
          alt="Logo Fondo" 
          className="w-3/4 sm:w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 object-contain opacity-15"
        />
      </div>
      
      <div className="relative z-10">
        <Header 
          usuario={usuario}
          onLogout={handleLogout}
          onMostrarLogin={abrirLogin}
          onMostrarRegistro={abrirRegistro}
          onDashboardClick={handleDashboardClick}
          onCombosClick={handleCombosClick}
          onProductosClick={handleProductosClick}
          onSalidaClick={handleSalidaClick}
          onHistorialClick={handleHistorialClick}
          onReportesClick={handleReportesClick}
          seccionActiva={seccionActiva}
        />
        
        {/* Alertas de Stock y Vencimiento - Solo para usuarios autenticados */}
        {usuario && alertas.total > 0 && (
          <div className="mx-auto mt-4 mb-4 px-4 max-w-6xl">
            <AlertasNotificaciones 
              alertas={alertas}
              onVerProducto={(alerta) => {
                // Buscar el producto y abrirlo
                const producto = productos.find(p => p.id === alerta.id);
                if (producto) {
                  if (alerta.tipo === 'stock') {
                    setModalAgregar({ abierto: true, producto });
                  } else {
                    setModalInfo({ abierto: true, producto });
                  }
                }
              }}
              expandido={false}
            />
          </div>
        )}
        
        {/* Modales de autenticación */}
        {mostrarModalAuth && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setMostrarModalAuth(false);
                setPasoRegistro('');
              }}
            ></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
              {pasoRegistro === 'auth' && (
                <AuthGerenteForm 
                  onAuthExitoso={handleAuthGerenteExitoso}
                  onCancelar={() => {
                    setMostrarModalAuth(false);
                    setPasoRegistro('');
                  }}
                />
              )}
              
              {pasoRegistro === 'registro' && (
                <RegistroTrabajadorForm 
                  onRegistroExitoso={handleRegistroExitoso}
                  onCancelar={() => {
                    setMostrarModalAuth(false);
                    setPasoRegistro('');
                  }}
                />
              )}
              
              {pasoRegistro === 'login' && (
                <FormLogin 
                  tipo="trabajador"
                  onLogin={handleLoginTrabajador}
                  onCancelar={() => {
                    setMostrarModalAuth(false);
                    setPasoRegistro('');
                  }}
                  authFn={autenticarTrabajador}
                  subtitle="Acceso para trabajadores"
                />
              )}
            </div>
          </div>
        )}
        
        {/* Modal para nuevo combo */}
        {mostrarModalNuevoCombo && (
          <ModalNuevoCombo
            productos={productos}
            onCrearCombo={crearNuevoCombo}
            onCerrar={() => setMostrarModalNuevoCombo(false)}
          />
        )}
        
        {/* Modales de acciones de productos */}
        {modalAgregar.abierto && (
          <ModalAgregarCantidad
            producto={modalAgregar.producto}
            onAgregar={agregarCantidad}
            onCerrar={() => setModalAgregar({ abierto: false, producto: null })}
          />
        )}

        {modalModificar.abierto && (
          <ModalModificarProducto
            producto={modalModificar.producto}
            onModificar={modificarProducto}
            onCerrar={() => setModalModificar({ abierto: false, producto: null })}
          />
        )}

        {modalInfo.abierto && (
          <ModalInfoProducto
            producto={modalInfo.producto}
            onCerrar={() => setModalInfo({ abierto: false, producto: null })}
          />
        )}

        {modalEliminar.abierto && (
          <ModalConfirmarEliminar
            producto={modalEliminar.producto}
            onEliminar={eliminarProducto}
            onCerrar={() => setModalEliminar({ abierto: false, producto: null })}
          />
        )}
        
        {/* Sección Combos */}
        {seccionActiva === 'combos' && (
          <div className='mt-8 px-4 sm:px-6 md:px-8 pb-8'>
            <InterfazCombos 
              combos={combos} 
              setCombos={setCombos}
              productos={productos}
              onModificarCombo={modificarCombo}
              onAgregarAlHistorial={agregarAlHistorial}
              onAbrirNuevoCombo={() => setMostrarModalNuevoCombo(true)}
            />
          </div>
        )}
        
        {/* Sección Productos */}
        {seccionActiva === 'productos' && (
          <div className='mt-8 px-4 sm:px-6 md:px-8 pb-8'>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">Listado de Productos</h2>
              
              {/* Buscador */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base bg-white"
                  >
                    <option value="todas">Todas las categorias</option>
                    {categoriasDisponibles.map((categoria) => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>

                  <select
                    value={filtroProveedor}
                    onChange={(e) => setFiltroProveedor(e.target.value)}
                    className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base bg-white"
                  >
                    <option value="todos">Todos los proveedores</option>
                    {proveedoresDisponibles.map((proveedor) => (
                      <option key={proveedor} value={proveedor}>{proveedor}</option>
                    ))}
                  </select>

                  <select
                    value={filtroVencimiento}
                    onChange={(e) => setFiltroVencimiento(e.target.value)}
                    className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base bg-white"
                  >
                    <option value="todos">Todos los vencimientos</option>
                    <option value="vencidos">Vencidos</option>
                    <option value="7dias">Vencen en 7 dias</option>
                    <option value="30dias">Vencen en 30 dias</option>
                    <option value="sinfecha">Sin fecha de vencimiento</option>
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Stock min"
                      value={stockMin}
                      onChange={(e) => setStockMin(e.target.value)}
                      className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Stock max"
                      value={stockMax}
                      onChange={(e) => setStockMax(e.target.value)}
                      className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base"
                    />
                  </div>
                </div>

                <div className="relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o codigo..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    className="w-full p-3 pl-10 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base"
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
                <div className="flex items-center justify-between mt-2 gap-3">
                  <p className="text-sm text-gray-500">
                    {productosFiltrados.length} productos encontrados
                  </p>
                  <button
                    onClick={handleLimpiarFiltros}
                    className="px-4 py-2 bg-orange-200 hover:bg-orange-300 text-orange-800 font-semibold rounded-lg transition-colors duration-200"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
              
              {/* Tabla de productos con scroll */}
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto border-2 border-orange-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-orange-50 z-10">
                      <tr>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">ID</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Nombre</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Codigo</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Proveedor</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Categoria</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Cantidad</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Unidad</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Fecha Entrada</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Fecha Vencimiento</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.length > 0 ? (
                        Object.entries(productosPorCategoria).map(([categoria, items]) => (
                          <Fragment key={`grupo-${categoria}`}>
                            <tr key={`cat-${categoria}`} className="bg-orange-100/70">
                              <td colSpan="10" className="border-2 border-orange-200 p-2 text-xs font-bold text-orange-700 uppercase">
                                Categoria: {categoria} ({items.length})
                              </td>
                            </tr>
                            {items.map((producto) => {
                              const estadoStock = obtenerEstadoStock(producto.cantidad);
                              return (
                              <tr key={producto.id} className="hover:bg-orange-50/50">
                                <td className="border-2 border-orange-200 p-2 text-xs">{producto.id}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs font-medium">{producto.nombre}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs">{producto.codigoProducto || '—'}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs">{producto.proveedor || '—'}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs">{producto.categoria || 'Sin categoria'}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs">
                                  <Tooltip texto={`Stock ${estadoStock.estado}`} posicion="arriba">
                                    <div className={`p-2 rounded-lg text-center font-bold ${estadoStock.clase}`}>
                                      {estadoStock.icon} {producto.cantidad}
                                    </div>
                                  </Tooltip>
                                </td>
                                <td className="border-2 border-orange-200 p-2 text-xs">{producto.unidad}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs">{formatearFecha(producto.fechaEntrada)}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs">{formatearFecha(producto.fechaVencimiento)}</td>
                                <td className="border-2 border-orange-200 p-2">
                                  <div className="flex gap-1 animate-fade-in">
                                    <Tooltip texto="Agregar cantidad" posicion="arriba">
                                      <button 
                                        onClick={() => setModalAgregar({ abierto: true, producto })}
                                        className="px-2 py-1 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-all duration-300 text-[10px]"
                                      >
                                        Agr
                                      </button>
                                    </Tooltip>
                                    <Tooltip texto="Modificar producto" posicion="arriba">
                                      <button 
                                        onClick={() => setModalModificar({ abierto: true, producto })}
                                        className="px-2 py-1 border-2 border-blue-500 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-all duration-300 text-[10px]"
                                      >
                                        Mod
                                      </button>
                                    </Tooltip>
                                    <Tooltip texto="Ver informaci\u00f3n" posicion="arriba">
                                      <button 
                                        onClick={() => setModalInfo({ abierto: true, producto })}
                                        className="px-2 py-1 border-2 border-purple-500 bg-purple-50 text-purple-700 font-bold rounded-lg hover:bg-purple-100 transition-all duration-300"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </Tooltip>
                                    <Tooltip texto="Eliminar producto" posicion="arriba">
                                      <button 
                                        onClick={() => setModalEliminar({ abierto: true, producto })}
                                        className="px-2 py-1 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-[10px]"
                                      >
                                        Del
                                      </button>
                                    </Tooltip>
                                  </div>
                                </td>
                              </tr>
                            );
                            })}
                          </Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center p-4 text-gray-500 text-sm">
                            No se encontraron productos que coincidan con la búsqueda
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Tooltip texto="Agregar nuevo producto (Ctrl+N)" posicion="arriba">
                  <button
                    onClick={() => setMostrarFormulario(true)}
                    className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl animate-slide-in"
                  >
                    + Nuevo Producto
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Sección Salida */}
        {seccionActiva === 'salida' && (
          <div className='mt-8 px-4 sm:px-6 md:px-8 pb-8'>
            <InterfazSalida
              productos={productos}
              combos={combos}
              onRegistrarSalida={registrarSalidaMultiple}
              onCancelar={() => setSeccionActiva(null)}
            />
          </div>
        )}
        
        {/* Sección Historial */}
        {seccionActiva === 'historial' && (
          <div className='mt-8 px-4 sm:px-6 md:px-8 pb-8'>
            <InterfazHistorial historial={historial} />
          </div>
        )}

        {seccionActiva === 'reportes' && (
          <SeccionReportes historial={historial} productos={productos} />
        )}

        {/* Dashboard principal */}
        {usuario && !seccionActiva && (
          <DashboardPrincipal
            productos={productos}
            historial={historial}
            combos={combos}
            alertas={alertas}
          />
        )}
        
        {/* Formulario de nuevos productos */}
        {mostrarFormulario && usuario && seccionActiva === 'productos' && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setMostrarFormulario(false)}
            ></div>
            <div className="relative z-10">
              <Formulario onAgregarProducto={agregarProducto} onCerrar={() => setMostrarFormulario(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;