# Guía de Implementación para Subida de Imágenes (S3)

Este documento sirve como una guía genérica para implementar la funcionalidad de subida y visualización de imágenes para cualquier módulo del proyecto.

## 1. Preparación de Tipos y API

El primer paso es asegurar que los tipos y la capa de la API estén listos para manejar imágenes.

- **En `src/types/<moduleName>.ts`**:
    1.  Asegúrate de que los payloads `Create<ModuleName>Payload` y `Update<ModuleName>Payload` incluyan el campo opcional: `image_bytes?: string;`.
    2.  Define una nueva interfaz para los datos que incluyen la imagen: `export interface <ModuleName>WithImage extends <ModuleName> { image_bytes?: string; }`.
- **En `src/config/api.ts`**:
    1.  Agrega un nuevo endpoint para obtener el recurso con su imagen: `WITH_IMAGE: (id: string) => \`/<moduleName>/${id}/image/\`,`.
- **En `src/api/<moduleName>s/<moduleName>s.ts`**:
    1.  Crea una nueva función `get<ModuleName>WithImage` que consuma el nuevo endpoint y devuelva el tipo `<ModuleName>WithImage`.

## 2. Creación de una Utilidad de Imagen Reutilizable

Para mantener el código modular, usamos una función central para convertir archivos a Base64.

- **Archivo**: `src/utils/imageUtils.ts`
- **Función**: `fileToBase64`. Esta función toma un `File` y devuelve una `Promise<string>` con el contenido en Base64.

## 3. Implementación en la Pantalla de Creación (`agregar.tsx`)

- **Archivo**: `src/routes/<moduleName>s/agregar.tsx`
- **Lógica de `onSubmit`**:
    1.  Si el usuario selecciona una imagen (`imageFile`), actualiza el `payload` antes de enviarlo:
        - El campo `image_url` se rellena con el nombre del archivo (`imageFile.name`).
        - Se usa la utilidad `fileToBase64` para convertir el archivo y el resultado se asigna a `image_bytes`.

## 4. Implementación en Pantallas de Visualización y Edición

### Patrón A: "Ver" y "Editar" en archivos separados (`ver.tsx`, `editar.tsx`)

Este patrón se usó en el módulo de **Locales**.

- **En `ver.tsx`**:
    1.  **Llamada a la API**: Usa `get<ModuleName>WithImage` para obtener los datos.
    2.  **Clave de Caché Única**: Para evitar colisiones, usa una clave específica como `['<moduleName>', id, 'withImage']`.
    3.  **Visualización**: Convierte los `image_bytes` recibidos a una URL de datos (`data:image/jpeg;base64,...`) para mostrar la imagen.
- **En `editar.tsx`**:
    1.  **Manejo de Archivo**: Usa `useState` para `imageFile` y `imagePreview` y una función `handleImageChange` para actualizar estos estados cuando el usuario selecciona un archivo.
    2.  **Lógica de Mutación**: En la función de la mutación de actualización, si existe un `imageFile`, añade `image_url` y `image_bytes` al payload.
    3.  **Invalidación de Caché**: En `onSuccess`, invalida la caché con `queryClient.invalidateQueries({ queryKey: ['<moduleName>', id] })` y `queryClient.invalidateQueries({ queryKey: ['<moduleName>s'] })`. Esto refrescará automáticamente todas las vistas relacionadas.

### Patrón B: "Ver" y "Editar" en el mismo archivo (`ver.tsx`)

Este patrón se usó en el módulo de **Profesionales**.

- **Archivo**: `src/routes/<moduleName>s/ver.tsx`
- **Lógica Combinada**:
    1.  **Obtención de Datos**: Igual que en el Patrón A, usa `get<ModuleName>WithImage` con una `queryKey` única.
    2.  **Manejo de Estado**: El componente necesita todos los estados para la edición (los campos del formulario, `isEditing`, `imageFile`, `imagePreview`) y la función `handleImageChange`.
    3.  **Renderizado Condicional**: La UI cambia según el estado de `isEditing`. El `input` para subir archivos solo es visible y funcional cuando `isEditing` es `true`. La imagen mostrada se basa en `imagePreview` (si se acaba de seleccionar una nueva) o en los `image_bytes` que vienen de la API.
    4.  **Lógica de Guardado**: La mutación de actualización se activa al guardar y, al igual que en el Patrón A, solo añade los datos de la imagen al payload si se ha subido un archivo nuevo.
    5.  **Invalidación de Caché**: La invalidación en `onSuccess` es idéntica al Patrón A para garantizar la consistencia de los datos.

```typescript
// src/utils/imageUtils.ts
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
```

```typescript
// src/routes/locales/agregar.tsx (resumen del onSubmit)
const onSubmit = async (data: any) => {
  try {
    const payload: CreateLocalPayload = { ...data };

    if (imageFile) {
      payload.image_url = imageFile.name;
      const base64Image = await fileToBase64(imageFile);
      payload.image_bytes = base64Image;
    }

    await createLocalMutation.mutateAsync(payload);
    // ... notificaciones y navegación ...
  } catch (err: any) {
    // ... manejo de error ...
  }
};
```

```typescript
// src/routes/locales/ver.tsx (resumen de la lógica)
const { data: local } = useQuery({
  queryKey: ['local', id, 'withImage'],
  queryFn: () => localsApi.getLocalWithImage(id!),
});

const imagePreviewUrl = useMemo(() => {
  if (local && local.image_bytes) {
    return `data:image/jpeg;base64,${local.image_bytes}`;
  }
  return null;
}, [local]);

// En el JSX:
<LocalForm
  imagePreview={imagePreviewUrl}
  // ... otras props ...
/>
```

```typescript
// src/routes/locales/editar.tsx (resumen de la lógica)
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }
};

// ... en la mutación ...
const updateMutation = useMutation({
  mutationFn: async (data: UpdateLocalPayload) => {
    const payload: UpdateLocalPayload = { ...data };

    if (imageFile) {
      payload.image_url = imageFile.name;
      const base64Image = await fileToBase64(imageFile);
      payload.image_bytes = base64Image;
    }

    return localsApi.updateLocal(id!, payload);
  },
  // ...
});
```

```typescript
// src/routes/locales/ver.tsx (solución)
const { data: local } = useQuery({
  queryKey: ['local', id, 'withImage'],
  queryFn: () => localsApi.getLocalWithImage(id!),
});
``` 