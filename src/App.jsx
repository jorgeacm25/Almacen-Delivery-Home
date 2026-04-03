import Header from './components/Header.jsx'
import Formulario from './components/Formulario.jsx'
import InterfazSalida from './components/InterfazSalida.jsx'
import InterfazHistorial from './components/InterfazHistorial.jsx'
import AuthGerenteForm from './components/AuthGerenteForm.jsx'
import RegistroTrabajadorForm from './components/RegistroTrabajadorForm.jsx'
// Eliminamos la importación de FormLogin
// import FormLogin from './components/FormLogin.jsx'
import LoginTrabajadorForm from './components/LoginTrabajadorForm.jsx'  // 👈 NUEVO
import ModalAgregarCantidad from './components/ModalAgregarCantidad.jsx'
import ModalModificarProducto from './components/ModalModificarProducto.jsx'
import ModalInfoProducto from './components/ModalInfoProducto.jsx'
import ModalConfirmarEliminar from './components/ModalConfirmarEliminar.jsx'
import ModalNuevoCombo from './components/ModalNuevoCombo.jsx'
import InterfazCombos from './components/InterfazCombos.jsx'
import AlertasNotificaciones from './components/AlertasNotificaciones.jsx'
import DashboardPrincipal from './components/DashboardPrincipal.jsx'
import SeccionReportes from './components/SeccionReportes.jsx'
import { Fragment, useEffect, useState } from 'react'
import { useStockAlerts } from './hooks/useStockAlerts.js'
import { useAtajosTeclado } from './hooks/useAtajosTeclado.js'
import Tooltip from './components/UI/Tooltip.jsx'
import fondo from './assets/fondo.png'
import logoFondo from './assets/LogoFondo.png'
import { productosData, combosData } from './data/almacenData.js'
import { historialData } from './data/historialData.js'
// Ya no necesitamos buscarUsuario porque el login se hace con fetch
// import { buscarUsuario } from './data/usuarios.js'

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
  const [productos, setProductos] = useState([]);
  
  // Base de datos de combos
  const [combos, setCombos] = useState(combosData);
  
  // Base de datos del historial
  const [historial, setHistorial] = useState(historialData);
  useEffect(() => {
  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5228/api/product', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();

      const productosMapeados = data.map(prod => ({
        id: prod.id,
        nombre: prod.name,
        cantidad: prod.quantity,
        unidad: prod.unity,
        fechaVencimiento: prod.endDate ? prod.endDate.split('T')[0] : null,
        operador: prod.nameUserorAdmin,
        categoria: prod.category || obtenerCategoriaAutomatica(prod.name),
        proveedor: prod.nameUserorAdmin || 'Sin proveedor',
        fechaEntrada: new Date().toISOString().split('T')[0],
      }));
      setProductos(productosMapeados);
    } catch (error) {
      console.error('Error fetching productos:', error);
      // Opcional: cargar datos locales de respaldo si falla la API
    }
  };
  cargarProductos();
}, []);

  // Hook para detectar alertas de stock y vencimiento
  const alertas = useStockAlerts(productos, 50, 7);

  // Función para agregar al historial
  const agregarAlHistorial = (tipo, accion, detalle, datos = {}) => {
    const nuevaEntrada = {
      id: Date.now() + Math.floor(Math.random() * 1000000),
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
      usuario: usuario?.nombre || 'Sistema',
      datos
    };
    setHistorial((prevHistorial) => [nuevaEntrada, ...prevHistorial]);
  };

  const handleLoginTrabajador = (datosUsuario) => {
    // datosUsuario contiene: { nombre, token, username }
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
    localStorage.removeItem('token'); // Limpiar token al cerrar sesión
  };

  const abrirRegistro = () => {
    setPasoRegistro('auth');
    setMostrarModalAuth(true);
  };

  const abrirLogin = () => {
    setPasoRegistro('login');
    setMostrarModalAuth(true);
  };

  // Ya no necesitamos autenticarTrabajador porque LoginTrabajadorForm maneja el fetch
  // La función ha sido eliminada.

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
      `Se agregó ${nuevoProducto.nombre} (${nuevoProducto.cantidad} ${nuevoProducto.unidad})`,
      {
        movimiento: 'entrada',
        producto_id: nuevoId,
        producto_nombre: nuevoProducto.nombre,
        cantidad: nuevoProducto.cantidad,
        unidad: nuevoProducto.unidad,
        categoria: productoConCategoria.categoria
      }
    );
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
      `Se agregaron ${cantidadAgregar} ${producto.unidad} a ${producto.nombre}`,
      {
        movimiento: 'entrada',
        producto_id: id,
        producto_nombre: producto.nombre,
        cantidad_anterior: producto.cantidad,
        cantidad_agregada: cantidadAgregar,
        cantidad_nueva: producto.cantidad + cantidadAgregar,
        unidad: producto.unidad
      }
    );
    setModalAgregar({ abierto: false, producto: null });
  };

  const modificarProducto = (id, productoModificado) => {
    const productoOriginal = productos.find(p => p.id === id);
    const cambios = {};
    Object.keys(productoModificado).forEach(key => {
      if (productoOriginal[key] !== productoModificado[key]) {
        cambios[key] = {
          anterior: productoOriginal[key],
          nuevo: productoModificado[key]
        };
      }
    });
    
    setProductos(productos.map(producto => 
      producto.id === id ? productoModificado : producto
    ));
    agregarAlHistorial('modificacion', 'Producto Modificado', 
      `Se modificó ${productoOriginal.nombre}`,
      {
        producto_id: id,
        producto_nombre: productoOriginal.nombre,
        cambios_realizados: cambios
      }
    );
    setModalModificar({ abierto: false, producto: null });
  };

  const eliminarProducto = (id) => {
    const producto = productos.find(p => p.id === id);
    setProductos(productos.filter(producto => producto.id !== id));
    agregarAlHistorial('eliminacion', 'Producto Eliminado', 
      `Se eliminó ${producto.nombre}`,
      {
        producto_id: id,
        producto_nombre: producto.nombre,
        cantidad: producto.cantidad,
        unidad: producto.unidad,
        categoria: producto.categoria
      }
    );
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
      `Se creó ${nombreCombo} con ${productosSeleccionados.length} productos`,
      {
        combo_id: nuevoId,
        combo_nombre: nombreCombo,
        cantidad_productos: productosSeleccionados.length,
        productos_detalle: productosSeleccionados
      }
    );
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
  const registrarSalidaMultiple = (items, tipoSalida = 'producto', comboInfo = null, datosSalida = {}) => {
    let productosActualizados = [...productos];
    const motivoTexto = datosSalida?.motivo ? ` | Motivo: ${datosSalida.motivo}` : '';
    const clienteTexto = datosSalida?.cliente ? ` | Cliente: ${datosSalida.cliente}` : '';

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

        agregarAlHistorial(
          'salida',
          'Salida de Producto',
          `Salida: ${item.cantidad} ${item.producto.unidad} de ${item.producto.nombre}${motivoTexto}${clienteTexto}`,
          {
            movimiento: 'salida',
            tipo_salida: 'producto',
            producto_id: item.producto.id,
            producto_nombre: item.producto.nombre,
            cantidad: item.cantidad,
            unidad: item.producto.unidad,
            motivo: datosSalida?.motivo || 'No especificado',
            cliente: datosSalida?.cliente || 'No especificado'
          }
        );
      });
    } else {
      // Salida de combo
      const cantidadCombos = comboInfo.cantidadSalida || 1;
      comboInfo.productos.forEach(item => {
        const cantidadSalida = item.cantidad * cantidadCombos;
        let productoCoincidente = null;

        productosActualizados = productosActualizados.map(producto => {
          if (producto.nombre === item.nombre) {
            productoCoincidente = producto;
            return {
              ...producto,
              cantidad: producto.cantidad - cantidadSalida
            };
          }
          return producto;
        });

        if (productoCoincidente) {
          agregarAlHistorial(
            'salida',
            'Salida de Producto por Combo',
            `Salida: ${cantidadSalida} ${item.unidad} de ${item.nombre} (Combo: ${comboInfo.nombre})${motivoTexto}${clienteTexto}`,
            {
              movimiento: 'salida',
              tipo_salida: 'combo',
              combo_nombre: comboInfo.nombre,
              cantidad_combos: cantidadCombos,
              producto_id: productoCoincidente.id,
              producto_nombre: item.nombre,
              cantidad: cantidadSalida,
              unidad: item.unidad,
              motivo: datosSalida?.motivo || 'No especificado',
              cliente: datosSalida?.cliente || 'No especificado'
            }
          );
        }
      });
    }

    setProductos(productosActualizados);
    alert(`Salida registrada exitosamente`);
    setSeccionActiva(null);
  };

  const productosEnriquecidos = productos.map((producto) => ({
    ...producto,
    categoria: producto.categoria || obtenerCategoriaAutomatica(producto.nombre),
    proveedor: producto.proveedor || producto.operador || 'Sin proveedor'
  }));

  const proveedoresDisponibles = Array.from(
    new Set(productosEnriquecidos.map((p) => p.proveedor).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const categoriasDisponibles = Array.from(
    new Set(productosEnriquecidos.map((p) => p.categoria).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const clientesFrecuentes = Object.entries(
    historial.reduce((acc, entrada, index) => {
      const match = (entrada.detalle || '').match(/Cliente:\s*([^|]+)/i);
      if (!match) return acc;
      const cliente = match[1].trim();
      if (!cliente) return acc;

      if (!acc[cliente]) {
        acc[cliente] = { frecuencia: 0, indiceReciente: index };
      }
      acc[cliente].frecuencia += 1;
      acc[cliente].indiceReciente = Math.min(acc[cliente].indiceReciente, index);
      return acc;
    }, {})
  )
    .sort((a, b) => {
      const recienteA = a[1].indiceReciente;
      const recienteB = b[1].indiceReciente;
      if (recienteA !== recienteB) return recienteA - recienteB;
      if (a[1].frecuencia !== b[1].frecuencia) return b[1].frecuencia - a[1].frecuencia;
      return a[0].localeCompare(b[0]);
    })
    .map(([cliente]) => cliente)
    .slice(0, 15);

  // Filtrar productos
  const productosFiltrados = productosEnriquecidos.filter((producto) => {
    const termino = terminoBusqueda.toLowerCase().trim();
    const coincideTexto =
      !termino ||
      producto.nombre.toLowerCase().includes(termino);

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
        
        {/* Alertas de Stock y Vencimiento */}
        {usuario && alertas.total > 0 && (
          <div className="mx-auto mt-4 mb-4 px-4 max-w-6xl">
            <AlertasNotificaciones 
              alertas={alertas}
              onVerProducto={(alerta) => {
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
              
              {/* 🔁 AQUÍ ESTÁ EL CAMBIO: Usamos LoginTrabajadorForm en lugar de FormLogin */}
              {pasoRegistro === 'login' && (
                <LoginTrabajadorForm
                  onLogin={handleLoginTrabajador}
                  onCancelar={() => {
                    setMostrarModalAuth(false);
                    setPasoRegistro('');
                  }}
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
            usuario={usuario}
          />
        )}
        
        {/* Modales de acciones de productos */}
        {modalAgregar.abierto && (
          <ModalAgregarCantidad
  producto={modalAgregar.producto}
  onAgregar={agregarCantidad}
  onCerrar={() => setModalAgregar({ abierto: false, producto: null })}
  usuario={usuario}
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
                      placeholder="0"
                      value={stockMin}
                      onChange={(e) => setStockMin(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={stockMax}
                      onChange={(e) => setStockMax(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-full p-3 border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-600 text-base"
                    />
                  </div>
                </div>

                <div className="relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
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
              
              {/* Tabla de productos */}
              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto border-2 border-orange-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-orange-50 z-10">
                      <tr>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">ID</th>
                        <th className="border-2 border-orange-200 p-2 text-left text-xs font-bold">Nombre</th>
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
                              <td colSpan="9" className="border-2 border-orange-200 p-2 text-xs font-bold text-orange-700 uppercase">
                                Categoria: {categoria} ({items.length})
                              </td>
                            </tr>
                            {items.map((producto) => {
                              const estadoStock = obtenerEstadoStock(producto.cantidad);
                              return (
                              <tr key={producto.id} className="hover:bg-orange-50/50">
                                <td className="border-2 border-orange-200 p-2 text-xs">{producto.id}</td>
                                <td className="border-2 border-orange-200 p-2 text-xs font-medium">{producto.nombre}</td>
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
                          <td colSpan="9" className="text-center p-4 text-gray-500 text-sm">
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
              clientesFrecuentes={clientesFrecuentes}
              onRegistrarSalida={registrarSalidaMultiple}
              onCancelar={() => setSeccionActiva(null)}
            />
          </div>
        )}
        
        {/* Sección Historial */}
        {seccionActiva === 'historial' && (
          <div className='mt-8 px-4 sm:px-6 md:px-8 pb-8'>
            <InterfazHistorial/>
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
              <Formulario onAgregarProducto={agregarProducto} onCerrar={() => setMostrarFormulario(false)} usuario = {usuario}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;