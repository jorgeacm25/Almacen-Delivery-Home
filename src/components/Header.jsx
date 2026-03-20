import { useState } from 'react';
import logo from '../assets/Group 6.jpg';

function Header({ usuario, onLogout, onMostrarLogin, onMostrarRegistro, onDashboardClick, onCombosClick, onProductosClick, onSalidaClick, onHistorialClick, onReportesClick, seccionActiva }) {
    const [mostrarMenu, setMostrarMenu] = useState(false);

    return (
        <header className="bg-white shadow-lg py-2 w-full">
            <div className="flex items-center justify-between w-full px-2 sm:px-4">
                <button
                    type="button"
                    onClick={onDashboardClick}
                    className="flex items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    title="Ir al dashboard"
                    aria-label="Ir al dashboard"
                >
                    <img src={logo} alt="Delivery Home" className="h-12 sm:h-14 md:h-16 w-auto" />
                </button>

                <h1 className="font-black text-xl sm:text-2xl md:text-3xl text-center">
                    <span className="text-green-600">Almacen</span>{' '}
                    <span className="text-orange-500">Delivery Home</span>
                </h1>

                <div className="flex items-center gap-4">
                    {!usuario ? (
                        <>
                            <button 
                                onClick={onMostrarRegistro}
                                className="px-6 py-3 border-2 border-blue-700 bg-white text-blue-800 font-extrabold rounded-lg hover:bg-blue-100 text-base"
                            >
                                Registro
                            </button>
                            <button 
                                onClick={onMostrarLogin}
                                className="px-6 py-3 border-2 border-green-700 bg-white text-green-800 font-extrabold rounded-lg hover:bg-green-100 text-base"
                            >
                                Login
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={onCombosClick}
                                className={`px-6 py-3 border-2 font-extrabold rounded-lg text-base ${
                                    seccionActiva === 'combos'
                                        ? 'border-green-600 bg-green-600 text-white'
                                        : 'border-green-700 bg-white text-green-800 hover:bg-green-100'
                                }`}
                            >
                                Combos
                            </button>
                            <button 
                                onClick={onProductosClick}
                                className={`px-6 py-3 border-2 font-extrabold rounded-lg text-base ${
                                    seccionActiva === 'productos'
                                        ? 'border-orange-600 bg-orange-600 text-white'
                                        : 'border-orange-700 bg-white text-orange-800 hover:bg-orange-100'
                                }`}
                            >
                                Productos
                            </button>
                            <button 
                                onClick={onSalidaClick}
                                className={`px-6 py-3 border-2 font-extrabold rounded-lg text-base ${
                                    seccionActiva === 'salida'
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-red-700 bg-white text-red-800 hover:bg-red-100'
                                }`}
                            >
                                Salida
                            </button>
                            <button 
                                onClick={onHistorialClick}
                                className={`px-6 py-3 border-2 font-extrabold rounded-lg text-base ${
                                    seccionActiva === 'historial'
                                        ? 'border-purple-600 bg-purple-600 text-white'
                                        : 'border-purple-700 bg-white text-purple-800 hover:bg-purple-100'
                                }`}
                            >
                                Historial
                            </button>

                            <button 
                                onClick={onReportesClick}
                                className={`px-6 py-3 border-2 font-extrabold rounded-lg text-base ${
                                    seccionActiva === 'reportes'
                                        ? 'border-cyan-700 bg-cyan-700 text-white'
                                        : 'border-cyan-700 bg-white text-cyan-800 hover:bg-cyan-100'
                                }`}
                            >
                                Reportes
                            </button>

                            <div className="relative ml-1 sm:ml-2">
                                <button
                                    onClick={() => setMostrarMenu(!mostrarMenu)}
                                    className="flex items-center gap-2 border-2 border-orange-700 bg-white text-orange-800 font-extrabold rounded-lg px-6 py-3 hover:bg-orange-100 text-base"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden xs:inline">{usuario?.nombre?.split(' ')[0] || 'Chef'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${mostrarMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {mostrarMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-48 sm:w-56 md:w-64 bg-white border-2 border-orange-200 rounded-xl shadow-xl z-50">
                                        <div className="p-3 sm:p-4 border-b border-orange-100">
                                            <p className="font-bold text-gray-800 text-xs sm:text-sm">{usuario?.nombre || 'Operador'}</p>
                                            <p className="text-xs text-gray-600 mt-1 truncate">{usuario?.username || 'operador@deliveryhome.com'}</p>
                                        </div>
                                        <div className="p-2">
                                            <button className="w-full text-left px-6 py-3 text-gray-800 hover:bg-orange-50 rounded-lg font-bold text-base border-2 border-transparent">
                                                Ver Perfil
                                            </button>
                                            <button 
                                                className="w-full text-left px-6 py-3 text-red-700 hover:bg-red-100 rounded-lg font-extrabold text-base border-2 border-red-600 bg-white"
                                                onClick={onLogout}
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {mostrarMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setMostrarMenu(false)} />
            )}
        </header>
    );
}

export default Header;