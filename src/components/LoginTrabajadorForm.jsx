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
      const response = await fetch('http://localhost:5228/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: username, password: password })
      });

      if (response.ok) {
        let token;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          token = data.token || data;
        } else {
          token = await response.text();
        }

        if (!token) throw new Error('No se recibió token');

        localStorage.setItem('token', token);

        // Crear objeto usuario que el callback espera (con nombre)
        const usuario = {
          nombre: username,   // App espera 'nombre'
          token: token,
          username: username
        };
        onLogin(usuario);
      } else {
        let errorMsg;
        try {
          errorMsg = await response.text();
        } catch {
          errorMsg = `Error ${response.status}`;
        }
        setError(errorMsg || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error(error);
      setError('Error de conexión con el servidor');
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