import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/Group 6.jpg';
import { APP_ROUTES } from '../routes/appRoutes.js';

function Header({ usuario, onLogout, onMostrarLogin, onMostrarRegistro, onDashboardClick, onCombosClick, onProductosClick, onSalidaClick, onHistorialClick, onReportesClick, seccionActiva }) {
    const [mostrarMenu, setMostrarMenu] = useState(false);
        const location = useLocation();

    return (
        <header className="bg-white shadow-lg py-2 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full px-2 sm:px-4 gap-3">
                <button
                    type="button"
                    onClick={onDashboardClick}
                    className="self-center lg:self-auto flex items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                    title="Ir al dashboard"
                    aria-label="Ir al dashboard"
                >
                    <img src={logo} alt="Delivery Home" className="h-12 sm:h-14 md:h-16 w-auto" />
                </button>

                <h1 className="font-black text-lg sm:text-2xl md:text-3xl text-center leading-tight">
                    <span className="text-green-600">Almacen</span>{' '}
                    <span className="text-orange-500">Delivery Home</span>
                </h1>

                <div className="w-full lg:w-auto flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3">
                    {!usuario ? (
                        <>
                            <button 
                                onClick={onMostrarRegistro}
                                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 border-blue-700 bg-white text-blue-800 font-extrabold rounded-lg hover:bg-blue-100 text-xs sm:text-sm md:text-base"
                            >
                                Registro
                            </button>
                            <button 
                                onClick={onMostrarLogin}
                                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 border-green-700 bg-white text-green-800 font-extrabold rounded-lg hover:bg-green-100 text-xs sm:text-sm md:text-base"
                            >
                                Login
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={onCombosClick}
                                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 font-extrabold rounded-lg text-xs sm:text-sm md:text-base ${
                                    location.pathname === APP_ROUTES.COMBOS
                                        ? 'border-green-600 bg-green-600 text-white'
                                        : 'border-green-700 bg-white text-green-800 hover:bg-green-100'
                                }`}
                            >
                                Combos
                            </button>
                            <button 
                                onClick={onProductosClick}
                                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 font-extrabold rounded-lg text-xs sm:text-sm md:text-base ${
                                    location.pathname === APP_ROUTES.PRODUCTOS
                                        ? 'border-orange-600 bg-orange-600 text-white'
                                        : 'border-orange-700 bg-white text-orange-800 hover:bg-orange-100'
                                }`}
                            >
                                Productos
                            </button>
                            <button 
                                onClick={onSalidaClick}
                                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 font-extrabold rounded-lg text-xs sm:text-sm md:text-base ${
                                    location.pathname === APP_ROUTES.SALIDA
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-red-700 bg-white text-red-800 hover:bg-red-100'
                                }`}
                            >
                                Salida
                            </button>
                            <button 
                                onClick={onHistorialClick}
                                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 font-extrabold rounded-lg text-xs sm:text-sm md:text-base ${
                                    location.pathname === APP_ROUTES.HISTORIAL
                                        ? 'border-purple-600 bg-purple-600 text-white'
                                        : 'border-purple-700 bg-white text-purple-800 hover:bg-purple-100'
                                }`}
                            >
                                Historial
                            </button>

                            <div className="relative ml-0 sm:ml-2">
                                <button
                                    onClick={() => setMostrarMenu(!mostrarMenu)}
                                    className="flex items-center gap-2 border-2 border-orange-700 bg-white text-orange-800 font-extrabold rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 hover:bg-orange-100 text-xs sm:text-sm md:text-base"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <span>{usuario.username || 'Usuario'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${mostrarMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {mostrarMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-white border-2 border-orange-200 rounded-xl shadow-xl z-50">
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