# NutriLeo

Sistema web para personal clínico de la clínica nutricional **NutriLeo**. Gestiona pacientes, calcula IMC automáticamente y mantiene un historial cronológico de consultas.

Los datos se guardan en **sessionStorage** del navegador (sin base de datos). Al cerrar la pestaña o el navegador, la información se pierde.

## Funcionalidades

- **Acceso seguro:** login con nombre del nutricionista y rutas protegidas
- **Pacientes:** registro con IMC y diagnóstico automático, CRUD en la misma ventana
- **Consultas:** historial cronológico con actualización en tiempo real (sin F5)

## Inicio rápido

### Desarrollo

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173

### Docker

```powershell
docker compose up --build
```

Abre http://localhost:3000

## Stack

- React 18 + Vite
- sessionStorage (sin backend ni BD)
- Docker + Nginx

## Estructura

```
NutriLeo/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── context/
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```
