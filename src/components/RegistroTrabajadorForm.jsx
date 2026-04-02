import FormRegistro from './FormRegistro';

const RegistroTrabajadorForm = ({ onRegistroExitoso, onCancelar }) => {
  
  const registrarTrabajador = async (formValues) => {
    try {
      // Obtener token de autenticación (guardado previamente en el login)
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa. Inicie sesión nuevamente.');
      }

      // Preparar payload según lo que espera el backend
      const payload = {
        fullName: formValues.nombre,
        userName: formValues.username,
        password: formValues.password
      };
      console.log('Token a enviar:', token); 
      // Realizar petición POST
      const response = await fetch('http://localhost:5228/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Manejar respuesta (el backend NO devuelve token, solo éxito o error)
      if (response.ok) {
        // Puede devolver JSON con datos del usuario o texto plano
        let data = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        // Registro exitoso
        return { success: true, user: data };
      } else {
        // Error devuelto por el backend
        let errorMsg;
        try {
          errorMsg = await response.text();
        } catch {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error de red o token:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <FormRegistro 
      tipo="trabajador"
      onRegistroExitoso={onRegistroExitoso}
      onCancelar={onCancelar}
      registroFn={registrarTrabajador}
    />
  );
};

export default RegistroTrabajadorForm;