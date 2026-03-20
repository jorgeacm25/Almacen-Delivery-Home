import { useState } from 'react';
import Button from './UI/Button';
import Input from './UI/Input';
import { useForm } from '../hooks/useForm';

/**
 * Componente FormLogin unificado
 * Reemplaza LoginForm y LoginTrabajadorForm eliminando 200+ líneas duplicadas
 * 
 * Props:
 * @param {Function} onLogin - Callback cuando login exitoso
 * @param {Function} onCancelar - Callback para cancelar
 * @param {Function} onCambiarARegistro - Callback para ir a registro (opcional)
 * @param {string} tipo - 'gerente' o 'trabajador'
 * @param {Function} validateFn - Función personalizada de validación
 * @param {Function} authFn - Función personalizada de autenticación
 */
const FormLogin = ({ 
  onLogin, 
  onCancelar, 
  onCambiarARegistro,
  tipo = 'gerente', // 'gerente' o 'trabajador'
  validateFn,
  authFn,
  subtitle = '',
  demoText = {}
}) => {
  const [loading, setLoading] = useState(false);
  
  // Configuración según tipo
  const config = {
    gerente: {
      title: 'Iniciar Sesión',
      fields: ['email', 'password'],
      fieldLabels: { email: 'Email', password: 'Contraseña' },
      fieldTypes: { email: 'email', password: 'password' },
      fieldPlaceholders: { email: 'correo@ejemplo.com', password: '********' },
      submitText: 'Entrar',
      demoUsers: demoText.gerente || [
        { label: 'Email: demo@delivery.com', value: 'demo@delivery.com' },
        { label: 'Contraseña: 123456', value: '123456' },
      ],
    },
    trabajador: {
      title: 'Iniciar Sesión',
      fields: ['username', 'password'],
      fieldLabels: { username: 'Usuario', password: 'Contraseña' },
      fieldTypes: { username: 'text', password: 'password' },
      fieldPlaceholders: { username: 'usuario', password: '********' },
      submitText: 'Entrar',
      demoUsers: demoText.trabajador || [
        { label: 'Usuario: juan', value: 'juan' },
        { label: 'Contraseña: 123456', value: '123456' },
      ],
    }
  };

  const currentConfig = config[tipo];
  
  // Valores iniciales del formulario
  const initialValues = currentConfig.fields.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {});

  // Hook useForm para manejar estado del formulario
  const { 
    values, 
    errors, 
    generalError, 
    handleChange, 
    resetForm 
  } = useForm(initialValues, async (formValues, setGeneralError) => {
    setLoading(true);
    try {
      const resultado = await authFn(formValues);
      if (resultado.success) {
        onLogin(resultado.user);
        resetForm();
      } else {
        setGeneralError(resultado.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setGeneralError(error.message);
    } finally {
      setLoading(false);
    }
  }, validateFn);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultado = await authFn(values);
      if (resultado.success) {
        onLogin(resultado.user);
        resetForm();
      } else {
        // El error se maneja internamente en useForm
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-6">
        {currentConfig.title}
      </h2>
      
      {subtitle && (
        <p className="text-center text-gray-600 mb-4 text-sm">
          {subtitle}
        </p>
      )}
      
      {generalError && (
        <div 
          className="bg-red-600 text-white text-center p-3 text-sm uppercase font-bold mb-4 rounded-lg"
          role="alert"
        >
          <p>{generalError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {currentConfig.fields.map(field => (
          <Input
            key={field}
            label={currentConfig.fieldLabels[field]}
            id={field}
            name={field}
            type={currentConfig.fieldTypes[field]}
            placeholder={currentConfig.fieldPlaceholders[field]}
            value={values[field]}
            onChange={handleChange}
            error={errors[field]}
            disabled={loading}
            required
          />
        ))}
        
        <div className="grid grid-cols-2 gap-3 mt-6">
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
            {loading ? 'Cargando...' : currentConfig.submitText}
          </Button>
        </div>
      </form>
      
      {onCambiarARegistro && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            ¿No tienes cuenta?{' '}
            <button 
              onClick={onCambiarARegistro}
              className="text-orange-600 font-bold hover:underline"
              disabled={loading}
              type="button"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="font-bold">Demo:</p>
        {currentConfig.demoUsers.map((user, idx) => (
          <p key={idx}>{user.label}</p>
        ))}
      </div>
    </div>
  );
};

export default FormLogin;
