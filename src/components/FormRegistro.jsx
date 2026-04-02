import { useState } from 'react';
import Button from './UI/Button';
import Input from './UI/Input';
import { useForm } from '../hooks/useForm';

/**
 * Componente FormRegistro unificado
 * Reemplaza RegistroForm y RegistroTrabajadorForm
 * 
 * Props:
 * @param {string} tipo - 'trabajador' o 'chef'
 * @param {Function} onRegistroExitoso - Callback cuando registro exitoso
 * @param {Function} onCancelar - Callback para cancelar
 * @param {Function} onCambiarALogin - Callback para ir a login (opcional)
 * @param {Function} registroFn - Función personalizada de registro (opcional)
 */
const FormRegistro = ({ 
  tipo = 'trabajador',
  onRegistroExitoso,
  onCancelar,
  onCambiarALogin,
  registroFn
}) => {
  const [loading, setLoading] = useState(false);

  // Configuración según tipo
  const config = {
    trabajador: {
      title: 'Registrar Nuevo Trabajador',
      fields: ['nombre', 'username', 'password', 'confirmPassword'],
      fieldLabels: {
        nombre: 'Nombre Completo',
        username: 'Nombre de Usuario',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña'
      },
      fieldPlaceholders: {
        nombre: 'Nombre del trabajador',
        username: 'usuario',
        password: '********',
        confirmPassword: '********'
      },
      minPasswordLength: 4,
      endpoint: 'http://localhost:5228/user'
    },
    chef: {
      title: 'Crear Cuenta',
      fields: ['nombre', 'email', 'password', 'confirmPassword'],
      fieldLabels: {
        nombre: 'Nombre Completo',
        email: 'Email',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña'
      },
      fieldPlaceholders: {
        nombre: 'Tu nombre',
        email: 'correo@ejemplo.com',
        password: '********',
        confirmPassword: '********'
      },
      minPasswordLength: 6,
      endpoint: 'http://localhost:5228/user' // Cambiar si el endpoint para chef es otro
    }
  };

  const currentConfig = config[tipo];

  // Valores iniciales
  const initialValues = currentConfig.fields.reduce((acc, field) => {
    acc[field] = '';
    return acc;
  }, {});

  // Validación personalizada
  const validateFormRegistro = (values) => {
    const newErrors = {};

    if (!values.nombre || values.nombre.trim() === '') {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (tipo === 'trabajador' && (!values.username || values.username.trim() === '')) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (tipo === 'chef' && (!values.email || values.email.trim() === '')) {
      newErrors.email = 'El email es requerido';
    } else if (tipo === 'chef' && values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!values.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (values.password.length < currentConfig.minPasswordLength) {
      newErrors.password = `La contraseña debe tener al menos ${currentConfig.minPasswordLength} caracteres`;
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  const { 
    values, 
    errors, 
    generalError,
    handleChange,
    setGeneralError
  } = useForm(initialValues, async () => {});

  // ========== FUNCIÓN DE REGISTRO POR DEFECTO (CON TOKEN) ==========
  const defaultRegistroFn = async (formValues, setErrorCallback) => {
    try {
      // 1. Obtener token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Inicie sesión nuevamente.');
      }

      // 2. Mapear campos al formato que espera el backend
      const payload = {
        fullName: formValues.nombre,
        userName: tipo === 'trabajador' ? formValues.username : formValues.email, // Ajusta según tu backend
        password: formValues.password
      };

      // 3. Realizar la petición
      const response = await fetch(currentConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // 4. Manejar respuesta
      if (response.ok) {
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        return { success: true, user: data };
      } else {
        let errorMsg;
        try {
          errorMsg = await response.text();
        } catch {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  // Usar la función pasada por prop o la por defecto
  const handleRegistro = registroFn || defaultRegistroFn;

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');

    // Validar formulario
    const validationErrors = validateFormRegistro(values);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      setGeneralError(firstError);
      return;
    }

    setLoading(true);

    handleRegistro(values, setGeneralError)
      .then((resultado) => {
        if (resultado.success) {
          onRegistroExitoso(resultado.user);
        } else {
          setGeneralError(resultado.error || 'Error al registrar');
        }
        setLoading(false);
      })
      .catch((error) => {
        setGeneralError(error.message);
        setLoading(false);
      });
  };

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-6">
        {currentConfig.title}
      </h2>

      {generalError && (
        <div 
          className="bg-red-600 text-white text-center p-3 text-sm uppercase font-bold mb-4 rounded-lg"
          role="alert"
        >
          <p>{generalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentConfig.fields.map(field => {
          if (field === 'nombre' || field === 'email' || field === 'username') {
            return (
              <Input
                key={field}
                label={currentConfig.fieldLabels[field]}
                id={field}
                name={field}
                type={field === 'email' ? 'email' : 'text'}
                placeholder={currentConfig.fieldPlaceholders[field]}
                value={values[field]}
                onChange={handleChange}
                error={errors[field]}
                disabled={loading}
                required
              />
            );
          } else if (field === 'password' || field === 'confirmPassword') {
            return (
              <Input
                key={field}
                label={currentConfig.fieldLabels[field]}
                id={field}
                name={field}
                type="password"
                placeholder={currentConfig.fieldPlaceholders[field]}
                value={values[field]}
                onChange={handleChange}
                error={errors[field]}
                disabled={loading}
                required
              />
            );
          }
          return null;
        })}

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
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </div>
      </form>

      {onCambiarALogin && tipo === 'chef' && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button 
              onClick={onCambiarALogin}
              className="text-orange-600 font-bold hover:underline"
              disabled={loading}
              type="button"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default FormRegistro;