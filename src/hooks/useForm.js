import { useState } from 'react';

/**
 * Hook useForm centraliza la lógica de manejo de formularios
 * Elimina duplicación de lógica en LoginForm y RegistroForm
 * 
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} onSubmit - Callback al enviar el formulario
 * @param {Function} validate - Función de validación (opcional)
 * @returns {Object} - Estado del formulario y funciones de manejo
 */
export const useForm = (initialValues, onSubmit, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo cuando empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    setLoading(true);

    try {
      // Validación personalizada si existe
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }
      }

      // Ejecutar callback onSubmit
      await onSubmit(values, setGeneralError, setErrors);
    } catch (error) {
      setGeneralError(error.message || 'Error al procesar el formulario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setGeneralError('');
  };

  const setFieldValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setFieldError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  return {
    values,
    errors,
    loading,
    generalError,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setGeneralError,
  };
};
