import { useState } from 'react';

const LoginTrabajadorForm = ({ onLogin, onCancelar }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);

    try {
      // 1. Login: obtener token
      const loginResponse = await fetch('http://localhost:5228/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password: password })
      });

      if (!loginResponse.ok) {
        const errorMsg = await loginResponse.text();
        throw new Error(errorMsg || 'Credenciales incorrectas');
      }

      const token = await loginResponse.text(); // texto plano
      localStorage.setItem('token', token);

      // 2. Obtener lista de usuarios
      const usersResponse = await fetch('http://localhost:5228/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersResponse.ok) throw new Error('Error al obtener datos de usuario');
      const users = await usersResponse.json();

      // 3. Buscar el usuario que coincida con el username usado en login
      const matchedUser = users.find(u => u.userName === username);
      if (!matchedUser) throw new Error('Usuario no encontrado en el sistema');

      // 4. Construir objeto usuario con id y nombre
      const usuario = {
        id: matchedUser.id,
        nombre: matchedUser.fullName || matchedUser.userName,
        username: matchedUser.userName,
        token: token
      };

      onLogin(usuario);
    } catch (error) {
      console.error(error);
      setError(error.message || 'Error de conexión');
    } finally {
      setLoading(false);
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            type="button"
            className="w-full px-4 py-3 border-2 border-red-500 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-all duration-300 text-sm cursor-pointer"
            onClick={onCancelar}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="w-full px-4 py-3 border-2 border-green-500 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-all duration-300 text-sm cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginTrabajadorForm;