# Pasos para la Implementación de Subida y Visualización de Imágenes en Locales

Este documento resume los pasos seguidos para implementar la funcionalidad de subida y visualización de imágenes para el módulo de "Locales" en el frontend.

## 1. Corrección del Componente de Formulario de Imagen

Antes de la implementación de la subida, se detectaron y corrigieron varios problemas en el componente `local-basic-form.tsx`:

- **Texto Superpuesto**: Se solucionó un problema en la vista de solo lectura (`ver.tsx`) donde se mostraban dos textos ("Vista previa" y "No se ha seleccionado ningún archivo") uno encima del otro. Se ajustó la lógica para mostrar un único mensaje ("No hay imagen disponible") cuando el formulario está en modo solo lectura y no hay imagen.
- **Tamaño del Contenedor**: Se corrigió el tamaño del contenedor de la imagen para que ocupe todo el alto de la columna derecha, asegurando una apariencia consistente y estéticamente agradable. Se usó `flex-grow` para que la altura se ajuste dinámicamente al contenido de la columna izquierda.

## 2. Creación de una Utilidad de Imagen Reutilizable

Para asegurar que la lógica de conversión de imágenes fuera modular y se pudiera usar en otras partes del proyecto, se creó un nuevo archivo:

- **Archivo**: `src/utils/imageUtils.ts`
- **Contenido**: Se añadió una función `fileToBase64` que convierte un objeto `File` en un string Base64.

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

## 3. Implementación de la Subida de Imagen en "Agregar Local"

Se modificó la pantalla de `agregar.tsx` para manejar la subida de imágenes reales al backend.

- **Archivo Modificado**: `src/routes/locales/agregar.tsx`
- **Lógica de `onSubmit`**:
    1.  Si el usuario selecciona una imagen (`imageFile`), se actualiza el `payload` de la siguiente manera:
        - El campo `image_url` se rellena con el nombre del archivo (`imageFile.name`).
        - Se llama a la utilidad `fileToBase64` para convertir el archivo.
        - El string Base64 resultante se asigna al campo `image_bytes`.
    2.  Se envía el `payload` completo al endpoint de creación del backend.

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

## 4. Implementación de la Visualización de Imagen en "Ver Local"

Finalmente, se actualizó la pantalla `ver.tsx` para mostrar la imagen del local obtenida desde el backend.

- **Archivo Modificado**: `src/routes/locales/ver.tsx`
- **Cambios Realizados**:
    1.  **Llamada a la API**: Se cambió la función de `useQuery` para que llamara a `localsApi.getLocalWithImage(id!)` en lugar de `getLocalById`. Esta función consume el endpoint que devuelve los datos del local junto con los bytes de la imagen.
    2.  **Construcción de la URL de la Imagen**: Se usó un hook `useMemo` para crear una URL de datos (`data:image/jpeg;base64,...`) a partir del campo `image_bytes` recibido de la API. Esto se hace solo si `image_bytes` existe.
    3.  **Visualización**: La URL de datos generada se pasa a la prop `imagePreview` del componente `LocalForm` para su renderizado.

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

## 5. Implementación de la Actualización de Imagen en "Editar Local"

Para completar el ciclo, se añadió la funcionalidad de cambiar la imagen de un local existente desde la pantalla de edición.

- **Archivo Modificado**: `src/routes/locales/editar.tsx`
- **Cambios Realizados**:
    1.  **Habilitar Selección de Imagen**: Se implementó la función `handleImageChange` y se conectó al componente `LocalForm`. Esto permite al usuario seleccionar un nuevo archivo de imagen y ver una vista previa instantánea.
    2.  **Actualizar la Mutación**: La lógica de `updateMutation` fue modificada. Ahora, si el usuario ha seleccionado una nueva `imageFile`:
        - Se asigna el nombre del nuevo archivo a `payload.image_url`.
        - Se utiliza la utilidad `fileToBase64` para convertir la imagen.
        - Se asigna el string Base64 resultante a `payload.image_bytes`.
    3.  **Llamada a la API**: El `payload` (con o sin los datos de la nueva imagen) se envía al backend para actualizar el local. Si no se selecciona una nueva imagen, la existente no se modifica.

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

## 6. Corrección de Bug de Caché Post-Actualización

Se detectó un bug donde, después de actualizar un local con una nueva imagen, la vista de "Ver Local" no mostraba la imagen actualizada hasta que se refrescaba la página manualmente (F5).

- **Causa**: Las páginas de "Ver" y "Editar" usaban la misma `queryKey` (`['local', id]`) para datos con estructuras diferentes (una con imagen y otra sin), causando una colisión en la caché de React Query. La aplicación servía datos obsoletos.
- **Solución**:
    1.  **Diferenciar la `queryKey`**: En `ver.tsx`, se cambió la clave a `['local', id, 'withImage']` para crear una entrada de caché única para los datos del local que incluyen la imagen.
    2.  **Invalidación de Caché**: La invalidación existente en `editar.tsx` (`queryClient.invalidateQueries({ queryKey: ['local', id] })`) es suficiente. Gracias a la concordancia parcial de React Query, invalida automáticamente todas las claves que comiencen con `['local', id]`, incluyendo la nueva, asegurando que los datos se refresquen correctamente.

```typescript
// src/routes/locales/ver.tsx (solución)
const { data: local } = useQuery({
  queryKey: ['local', id, 'withImage'],
  queryFn: () => localsApi.getLocalWithImage(id!),
});
``` 