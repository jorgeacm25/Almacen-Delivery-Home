import { useEffect } from 'react';

export const useAtajosTeclado = (atajos) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignorar si el usuario está escribiendo en un input
      if (event.target.matches('input, textarea, [contenteditable]')) {
        return;
      }

      for (const atajo of atajos) {
        const { teclas, callback } = atajo;
        
        const ctrlPresionado = event.ctrlKey || event.metaKey; // Ctrl en Windows/Linux, Cmd en Mac
        const shiftPresionado = event.shiftKey;
        const altPresionado = event.altKey;

        const teclaPresionada = event.key.toUpperCase();

        // Verificar si coincide el atajo
        if (
          (teclas.ctrl === undefined || teclas.ctrl === ctrlPresionado) &&
          (teclas.shift === undefined || teclas.shift === shiftPresionado) &&
          (teclas.alt === undefined || teclas.alt === altPresionado) &&
          teclas.tecla.toUpperCase() === teclaPresionada
        ) {
          event.preventDefault();
          callback();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [atajos]);
};
