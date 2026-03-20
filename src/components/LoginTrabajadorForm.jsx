import { useState } from 'react';
import { buscarUsuario } from '../data/usuarios';

const LoginTrabajadorForm = ({ onLogin, onCancelar }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    // Buscar usuario
    const usuario = buscarUsuario(username, password);
    
    if (usuario) {
      onLogin(usuario);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-6">
        Iniciar Sesión
      </h2>
      <p className="text-center text-gray-600 mb-4 text-sm">
        Acceso para trabajadores
      </p>
      
      {error && (
        <div className="bg-red-600 text-white text-center p-3 text-sm uppercase font-bold mb-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 uppercase font-bold text-sm mb-2">
            Usuario
          </label>
          <input 
            type="text" 
            id="username"
            placeholder="usuario"
            className="border-2 border-white-200 w-full p-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            className="w-full px-4 py-3 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-sm cursor-pointer"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="w-full px-4 py-3 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-all duration-300 text-sm cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </form>
      
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="font-bold">Trabajadores de prueba:</p>
        <p>Usuario: juan / Contraseña: 123456</p>
        <p>Usuario: maria / Contraseña: 123456</p>
      </div>
    </div>
  );
};

export default LoginTrabajadorForm;