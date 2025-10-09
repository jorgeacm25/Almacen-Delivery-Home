# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Actualización automática de progreso

Este repositorio incluye un workflow de GitHub Actions (`.github/workflows/progress.yml`) que crea o actualiza un archivo `PROGRESS.md` en cada push.

Qué hace:
- Añade/actualiza `PROGRESS.md` con fecha UTC, commit actual, mensaje y archivos cambiados.
- Hace commit y push del archivo actualizado de nuevo a la misma rama (si hay cambios).

Cómo probarlo:
1. Haz cambios y haz commit y push a GitHub.
2. En la pestaña de Actions del repositorio verás la ejecución del workflow.
3. Si hay cambios, el workflow actualizará `PROGRESS.md` en la misma rama.

Notas:
- El commit del workflow incluye `[skip ci]` para evitar loops de workflows si tienes otras acciones.
- Si quieres limitar a ramas específicas, edita `.github/workflows/progress.yml`.
