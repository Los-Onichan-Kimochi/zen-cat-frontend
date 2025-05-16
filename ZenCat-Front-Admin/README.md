# ZenCat-Front-Admin 🚀

Este proyecto es el frontend administrativo de ZenCat. Ha sido desarrollado utilizando **React (v19)** ⚛️, **Vite** ⚡ como herramienta de compilación y **TypeScript** 🔵. Para el enrutamiento, se utiliza **TanStack Router** 🗺️, y para la gestión del estado del servidor y caching de datos se emplea **TanStack Query** 🔄. La interfaz de usuario se construye con **Tailwind CSS** 🎨 y componentes de **Radix UI** ⚫, junto con iconos de **Lucide React** ✨.

## 📁 Estructura de Carpetas (dentro de `src/`)

```
src/
│
├── api/                # Lógica para interactuar con APIs (peticiones HTTP, endpoints)
│   └── auth/           # Endpoints y lógica específica de autenticación
│
├── assets/             # Archivos estáticos como fuentes, etc. (si no están en public/)
│
├── components/         # Componentes UI reutilizables (ej: botones, inputs, modales)
│   └── ui/             # Componentes UI básicos, a menudo basados en Radix UI (shadcn/ui style)
│
├── config/             # Archivos de configuración de la aplicación
│
├── context/            # Contextos de React para manejo de estado global (ej: UserContext)
│
├── data/               # Mock data o datos estáticos para la aplicación
│
├── hooks/              # Custom Hooks de React para lógica reutilizable
│
├── images/             # Imágenes utilizadas en la aplicación
│
├── layouts/            # Componentes de layout (ej: MainLayout para la estructura principal de páginas)
│
├── lib/                # Funciones utilitarias y helpers generales (ej: cn para classnames)
│
├── providers/          # Componentes proveedores de React (ej: React Query Provider, Router Provider)
│
├── routes/             # Definición de rutas y componentes de página (TanStack Router)
│   └── __root.tsx      # Ruta raíz, usualmente maneja autenticación y layout principal
│
├── services/           # Lógica de negocio o servicios específicos (puede solaparse con api/)
│
├── styles/             # Archivos de estilos globales o específicos de componentes
│
├── types/              # Definiciones TypeScript (interfaces, tipos)
│
└── utils/              # Funciones utilitarias específicas
```
*Nota: Algunas carpetas como `assets/`, `data/`, `images/`, `styles/`, `config/`, `services/` pueden variar en su uso exacto o no estar presentes en todos los proyectos basados en esta estructura.*

## 🏁 Primeros Pasos tras Clonar el Repositorio

1.  **📋 Requisitos Previos**
    *   [Bun](https://bun.sh/) (runtime de JavaScript y gestor de paquetes)

2.  **📦 Instalar dependencias**

    Navega a la raíz del proyecto en tu terminal y ejecuta:
    ```bash
    bun install
    ```

3.  **⚙️ Configurar variables de entorno**

    Crea un archivo `.env` en la raíz del proyecto copiando el archivo `.env.example` si existe, o creándolo desde cero.
    Este archivo contendrá variables específicas de tu entorno de desarrollo, como URLs de APIs:
    ```
    VITE_API_URL=https://tu.api.desarrollo
    ```
    Consulta la documentación interna o pregunta al equipo si necesitas más detalles sobre las variables requeridas.

4.  **▶️ Ejecutar la aplicación en modo desarrollo**
    ```bash
    bun run dev
    ```
    Esto iniciará el servidor de desarrollo de Vite. Por lo general, la aplicación estará disponible en [http://localhost:5173](http://localhost:5173) (o el puerto que indique la terminal). El servidor se recargará automáticamente al detectar cambios en el código.

5.  **🧹 Linting**

    Para revisar la calidad del código y aplicar formato, puedes usar:
    ```bash
    bun run lint
    ```
    Es recomendable configurar tu editor para que aplique las reglas de ESLint y Prettier automáticamente al guardar.

6.  **🔑 Estructura de rutas y autenticación (Ejemplo basado en el código previo)**
    *   La ruta raíz (`src/routes/__root.tsx`) maneja la lógica inicial, incluyendo la verificación de autenticación.
    *   Si un usuario no autenticado intenta acceder a una ruta protegida, será redirigido a `/login`.
    *   Si un usuario autenticado intenta acceder a `/login`, será redirigido a la página principal (ej: `/`).
    *   `UserContext` (en `src/context/UserContext.tsx`) probablemente provee la información del usuario autenticado al resto de la aplicación.
    *   La lógica de autenticación (`authApi.getCurrentUser()`) se encuentra en `src/api/auth/`.

7.  **📦 Construir para producción**
    ```bash
    bun run build
    ```
    Esto generará los archivos estáticos optimizados para producción en la carpeta `dist/`.

## 📜 Scripts Disponibles

En el archivo `package.json`, encontrarás varios scripts útiles que puedes ejecutar con `bun run <script>`:

*   `bun run dev`: Inicia el servidor de desarrollo.
*   `bun run build`: Compila la aplicación para producción.
*   `bun run lint`: Ejecuta ESLint para analizar el código.
*   `bun run preview`: Inicia un servidor local para previsualizar el build de producción.
