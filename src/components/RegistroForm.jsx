import FormRegistro from './FormRegistro';

const RegistroForm = ({ onRegistro, onCancelar, onCambiarALogin }) => {
  // Función de registro para chef/gerente
  const registrarChef = async (formValues) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const nuevoChef = {
            nombre: formValues.nombre,
            email: formValues.email,
            rol: 'chef'
          };
          resolve({ success: true, user: nuevoChef });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }, 1000);
    });
  };

  return (
    <FormRegistro 
      tipo="chef"
      onRegistroExitoso={onRegistro}
      onCancelar={onCancelar}
      onCambiarALogin={onCambiarALogin}
      registroFn={registrarChef}
    />
  );
};

export default RegistroForm;