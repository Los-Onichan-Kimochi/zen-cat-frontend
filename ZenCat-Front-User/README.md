# ZenCat User Frontend

Frontend de usuario para ZenCat - Landing page con sistema de autenticación JWT integrado.

## Instalación y Configuración

1. Instalar dependencias:
```bash
bun install
```

2. Configurar variables de entorno:
```bash
# Crear archivo .env en la raíz del proyecto
VITE_API_BASE_URL=http://localhost:8098
```

3. Iniciar el servidor de desarrollo:
```bash
bun run dev
```

## Arquitectura de Autenticación

### 🌍 Páginas Públicas (Guest)
Estas páginas son accesibles para cualquier visitante:

- **`/`** - Landing page principal con hero, comunidades, planes, etc.
- **`/como-funciona`** - Información sobre cómo funciona el servicio
- **`/comunidades`** - Información de comunidades disponibles
- **`/contacto`** - Formulario de contacto
- **`/membresia`** - Información de planes y membresías
- **`/precios`** - Información de precios
- **`/login`** - Inicio de sesión (solo visible para no autenticados)
- **`/signup`** - Registro (solo visible para no autenticados)
- **`/forgot`** - Recuperar contraseña

### 🔒 Páginas Protegidas (Requieren Autenticación)
Estas páginas requieren que el usuario esté autenticado:

- **`/perfil`** - Gestión del perfil de usuario
- **`/reservas`** - Panel de reservas del usuario
- **`/reserva/gimnasio`** - Reserva específica de gimnasio
- **`/reserva/yoga`** - Reserva específica de yoga  
- **`/reserva/funcional`** - Reserva específica de entrenamiento funcional

### Credenciales de Prueba

Para probar el sistema, puedes usar estas credenciales:

- **Email**: `admin@zencat.com`
- **Password**: `admin123`

### Casos de Uso

#### Caso 1: Usuario No Autenticado (Guest)
1. Puede navegar libremente por todas las páginas públicas
2. Ve botones "Iniciar sesión" y "Comienza ahora" en el TopBar
3. Si intenta acceder a páginas protegidas, es redirigido a `/login`

#### Caso 2: Usuario Autenticado
1. Ve su información de perfil en el TopBar (nombre/email + avatar)
2. Ve enlace adicional "Mis Reservas" en el menú
3. Puede acceder a páginas protegidas como `/perfil` y `/reservas`
4. Si intenta acceder a `/login` o `/signup`, es redirigido a `/` (home)

#### Caso 3: Login/Registro
1. **Login exitoso**: Redirige a `/` (home) con estado autenticado
2. **Login fallido**: Muestra error y permanece en login
3. **Registro exitoso**: Redirige automáticamente a `/` con usuario logueado
4. **Registro fallido**: Muestra error específico

#### Caso 4: Logout
1. Usuario hace click en el icono de logout
2. Es redirigido a `/` (home) como visitante no autenticado
3. Ya no puede acceder a páginas protegidas

## Componentes de Autenticación

### Protección de Rutas

```tsx
// Para páginas que requieren autenticación
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function MiPaginaProtegida() {
  return (
    <ProtectedRoute>
      <div>Contenido solo para usuarios autenticados</div>
    </ProtectedRoute>
  );
}
```

```tsx
// Para páginas que solo se muestran a no autenticados
import { GuestOnlyRoute } from '@/components/auth/GuestOnlyRoute';

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
