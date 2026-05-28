# NutriLeo

App web para gestionar pacientes y consultas en una clínica nutricional.

Los datos viven en **sessionStorage** del navegador. Si cierras la pestaña, se pierden.

## Desarrollo local

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Despliegue en Netlify

1. Conecta el repo https://github.com/LeoVD29S/NutriLeo
2. Netlify detecta `netlify.toml` automáticamente
3. Publica la rama `master`

Configuración del build:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`

## Estructura

```
frontend/src/
  components/
  context/
  pages/
  utils/
  styles/
```
