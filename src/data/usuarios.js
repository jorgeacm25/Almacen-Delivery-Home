// Simulación de base de datos de usuarios
export const usuarios = [
  {
    id: 1,
    nombre: 'Gerente General',
    username: 'gerente',
    password: 'admin123',
    rol: 'gerente'
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    username: 'juan',
    password: '123456',
    rol: 'trabajador'
  },
  {
    id: 3,
    nombre: 'María García',
    username: 'maria',
    password: '123456',
    rol: 'trabajador'
  }
];

// Función para buscar usuario por username y password
export const buscarUsuario = (username, password) => {
  return usuarios.find(u => u.username === username && u.password === password);
};

// Función para verificar si es gerente
export const verificarGerente = (username, password) => {
  const usuario = buscarUsuario(username, password);
  return usuario && usuario.rol === 'gerente';
};

// Función para agregar nuevo trabajador
export const agregarTrabajador = (nombre, username, password) => {
  const nuevoId = usuarios.length + 1;
  const nuevoTrabajador = {
    id: nuevoId,
    nombre,
    username,
    password,
    rol: 'trabajador'
  };
  usuarios.push(nuevoTrabajador);
  return nuevoTrabajador;
};