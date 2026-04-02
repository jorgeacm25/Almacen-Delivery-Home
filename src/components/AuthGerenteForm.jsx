import { useState } from 'react';
import { verificarGerente } from '../data/usuarios';
import Button from './UI/Button';
import Input from './UI/Input';
import { useForm } from '../hooks/useForm';

const AuthGerenteForm = ({ onAuthExitoso, onCancelar }) => {
  const [loading, setLoading] = useState(false);

  const { 
    values, 
    errors, 
    generalError,
    handleChange,
    setGeneralError
  } = useForm(
    { username: '', password: '' },
    async () => {}
  );

 const handleSubmit = async (e) => {
  e.preventDefault();
  setGeneralError('');
  
  if (!values.username || !values.password) {
    setGeneralError('Todos los campos son obligatorios');
    return;
  }
  
  setLoading(true);

  try {
    const url = 'http://localhost:5228/api/admin/login';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: values.username,
        password: values.password,
      }),
    });

    if (response.ok) {
      // ✅ El token viene como texto plano
      const token = await response.text();
      console.log('Token guardado:', token); // Verifica que no sea vacío
      localStorage.setItem('token', token);
      onAuthExitoso();
    } else {
      const errorText = await response.text();
      setGeneralError(errorText || 'Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error de red:', error);
    setGeneralError('Error de conexión con el servidor');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-6">
        Autenticación de Gerente
      </h2>
      <p className="text-center text-gray-600 mb-4 text-sm">
        Solo la gerente puede registrar nuevos trabajadores
      </p>
      
      {generalError && (
        <div 
          className="bg-red-600 text-white text-center p-3 text-sm uppercase font-bold mb-4 rounded-lg"
          role="alert"
        >
          <p>{generalError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Usuario"
          id="username"
          name="username"
          type="text"
          placeholder="usuario"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          disabled={loading}
          required
        />
        
        <Input
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          placeholder="********"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          disabled={loading}
          required
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Button 
            variant="danger"
            size="full"
            type="button"
            onClick={onCancelar}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            size="full"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </Button>
        </div>
      </form>
      
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs sm:text-sm text-gray-600">
        <p className="font-bold">Demo Gerente:</p>
        <p>Usuario: gerente</p>
        <p>Contraseña: admin123</p>
      </div>
    </div>
  );
};

export default AuthGerenteForm;