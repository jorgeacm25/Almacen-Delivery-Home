import { useState } from 'react';

const LoginForm = ({ onLogin, onCancelar, onCambiarARegistro }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validaciones básicas
    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    setCargando(true);
    
    // Simulación de autenticación (aquí conectarías con tu backend)
    setTimeout(() => {
      // Aquí iría la lógica real de autenticación
      if (email === 'demo@delivery.com' && password === '123456') {
        onLogin({
          nombre: 'Usuario Demo',
          email: email,
          rol: 'chef'
        });
      } else {
        setError('Credenciales incorrectas');
      }
      setCargando(false);
    }, 1000);
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-6">
        Iniciar Sesión
      </h2>
      
      {error && (
        <div className="bg-red-600 text-white text-center p-3 text-sm uppercase font-bold mb-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 uppercase font-bold text-sm mb-2">
            Email
          </label>
          <input 
            type="email" 
            id="email"
            placeholder="correo@ejemplo.com"
            className="border-2 border-white-200 w-full p-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 uppercase font-bold text-sm mb-2">
            Contraseña
          </label>
          <input 
            type="password" 
            id="password"
            placeholder="********"
            className="border-2 border-white-200 w-full p-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={cargando}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            className="w-full px-4 py-3 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-sm cursor-pointer"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="w-full px-4 py-3 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-all duration-300 text-sm cursor-pointer disabled:opacity-50"
            disabled={cargando}
          >
            {cargando ? 'Cargando...' : 'Entrar'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">
          ¿No tienes cuenta?{' '}
          <button 
            onClick={onCambiarARegistro}
            className="text-orange-600 font-bold hover:underline"
            disabled={cargando}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
      
      {/* Datos de demo (solo para pruebas) */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="font-bold">Demo:</p>
        <p>Email: demo@delivery.com</p>
        <p>Contraseña: 123456</p>
      </div>
    </div>
  );
};

export default LoginForm;