import { agregarTrabajador } from '../data/usuarios';
import FormRegistro from './FormRegistro';

const RegistroTrabajadorForm = ({ onRegistroExitoso, onCancelar }) => {
  // Función de registro para trabajadores
  const registrarTrabajador = async (formValues) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const nuevoTrabajador = agregarTrabajador(
            formValues.nombre,
            formValues.username,
            formValues.password
          );
          resolve({ success: true, user: nuevoTrabajador });
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      }, 500);
    });
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