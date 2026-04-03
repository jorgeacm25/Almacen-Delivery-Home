export const APP_ROUTES = {
  DASHBOARD: '/',
  DASHBOARD_ALT: '/dashboard',
  PRODUCTOS: '/productos',
  COMBOS: '/combos',
  SALIDA: '/salida',
  HISTORIAL: '/historial',
  REPORTES: '/reportes',
  LOGIN: '/login',
  REGISTRO: '/registro',
};

export const ALL_ROUTES = Object.values(APP_ROUTES);

const SECTION_BY_PATH = {
  [APP_ROUTES.DASHBOARD]: null,
  [APP_ROUTES.DASHBOARD_ALT]: null,
  [APP_ROUTES.PRODUCTOS]: 'productos',
  [APP_ROUTES.COMBOS]: 'combos',
  [APP_ROUTES.SALIDA]: 'salida',
  [APP_ROUTES.HISTORIAL]: 'historial',
  [APP_ROUTES.REPORTES]: 'reportes',
};

const PATH_BY_SECTION = {
  productos: APP_ROUTES.PRODUCTOS,
  combos: APP_ROUTES.COMBOS,
  salida: APP_ROUTES.SALIDA,
  historial: APP_ROUTES.HISTORIAL,
  reportes: APP_ROUTES.REPORTES,
};

export const pathToSection = (pathname) => SECTION_BY_PATH[pathname] ?? null;

export const sectionToPath = (section) => PATH_BY_SECTION[section] ?? APP_ROUTES.DASHBOARD;

export const pathToAuthMode = (pathname) => {
  if (pathname === APP_ROUTES.LOGIN) return 'login';
  if (pathname === APP_ROUTES.REGISTRO) return 'auth';
  return null;
};

export const isProtectedPath = (pathname) => {
  return [
    APP_ROUTES.DASHBOARD,
    APP_ROUTES.DASHBOARD_ALT,
    APP_ROUTES.PRODUCTOS,
    APP_ROUTES.COMBOS,
    APP_ROUTES.SALIDA,
    APP_ROUTES.HISTORIAL,
    APP_ROUTES.REPORTES,
  ].includes(pathname);
};
