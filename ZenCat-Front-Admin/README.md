# ZenCat-Front-Admin

Este proyecto es el frontend administrativo de ZenCat, construido con React y TanStack Router.

## Estructura de Carpetas

```
src/
│
├── api/                # Lógica para interactuar con APIs (peticiones HTTP, endpoints, etc.)
│   └── auth/           # Endpoints y lógica de autenticación
│
├── components/         # Componentes reutilizables de la interfaz de usuario
│
├── context/            # Contextos de React para manejo de estado global (ej: usuario)
│
├── layouts/            # Componentes de layout (ej: MainLayout para la estructura principal)
│
├── routes/             # Definición de rutas y páginas principales de la app
│   └── __root.tsx      # Ruta raíz, maneja la autenticación y el layout principal
│
├── types/              # Definiciones TypeScript de tipos y modelos de datos
│
└── utils/              # Funciones utilitarias y helpers
```

## Primeros Pasos tras Clonar el Repositorio

1. **Instalar dependencias**

   Asegúrate de tener instalado Node.js (recomendado v18+). Luego ejecuta:

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto (si es necesario) y agrega las variables requeridas, por ejemplo:

   ```
   VITE_API_URL=https://tuservidor.api
   ```

   Consulta la documentación interna o pregunta al equipo si necesitas más detalles sobre las variables necesarias.

3. **Ejecutar la aplicación en modo desarrollo**

   ```bash
   npm run dev
   ```

   Esto levantará el servidor de desarrollo. Usualmente estará disponible en [http://localhost:5173](http://localhost:5173) (o el puerto que indique la terminal).

4. **Estructura de rutas y autenticación**

   - La ruta raíz (`/`) verifica si el usuario está autenticado.
   - Si no lo está, redirige automáticamente a `/login`.
   - Si el usuario intenta acceder a `/login` estando autenticado, será redirigido a la raíz.
   - El contexto de usuario (`UserContext`) está disponible en toda la app para acceder a la información del usuario autenticado.

5. **Construir para producción**

   ```bash
   npm run build
   ```

   Los archivos listos para producción estarán en la carpeta `dist/`.
