# NutriLeo

App web para gestionar pacientes y consultas en una clínica nutricional.

Los datos viven en **sessionStorage** del navegador. Si cierras la pestaña, se pierden.

## Cómo correrlo

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Docker

```powershell
docker compose up --build
```

Abre http://localhost:3000

## Estructura

```
frontend/src/
  components/     PatientPanel, ConsultationPanel, Loading
  context/        AuthContext
  pages/          Login, Dashboard
  utils/          bmi.js, data.js
  styles/         global.css
```
