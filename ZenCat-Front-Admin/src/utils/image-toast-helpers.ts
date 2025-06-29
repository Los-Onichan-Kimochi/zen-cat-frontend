import { ToastContextType } from '@/context/ToastContext';

/**
 * Mensajes estandarizados para toasts de imágenes S3
 */
const IMAGE_TOAST_MESSAGES = {
  UPLOAD_PROCESSING: {
    title: 'Procesando Imagen',
    description: 'Preparando imagen para subir.',
  },
  UPDATE_PROCESSING: {
    title: 'Procesando Imagen',
    description: 'Preparando imagen para actualizar.',
  },
  DELETE_PROCESSING: {
    title: 'Eliminando Imagen',
    description: 'Removiendo imagen.',
  },
  UPLOAD_SUCCESS: {
    title: 'Imagen Subida',
    description: 'La imagen se ha subido correctamente.',
  },
  UPDATE_SUCCESS: {
    title: 'Imagen Actualizada',
    description: 'La imagen se ha actualizado correctamente.',
  },
  DELETE_SUCCESS: {
    title: 'Imagen Eliminada',
    description: 'La imagen se ha eliminado correctamente.',
  },
  UPLOAD_ERROR: {
    title: 'Error al Subir Imagen',
    description: 'No se pudo subir la imagen. Intenta nuevamente.',
  },
  UPDATE_ERROR: {
    title: 'Error al Actualizar Imagen',
    description: 'No se pudo actualizar la imagen. Intenta nuevamente.',
  },
  DELETE_ERROR: {
    title: 'Error al Eliminar Imagen',
    description: 'No se pudo eliminar la imagen. Intenta nuevamente.',
  },
} as const;

/**
 * Funciones para mostrar toasts de procesamiento de imágenes
 */
export const showImageUploadProcessing = (toast: ToastContextType) =>
  toast.info(IMAGE_TOAST_MESSAGES.UPLOAD_PROCESSING.title, {
    description: IMAGE_TOAST_MESSAGES.UPLOAD_PROCESSING.description,
  });

export const showImageUpdateProcessing = (toast: ToastContextType) =>
  toast.info(IMAGE_TOAST_MESSAGES.UPDATE_PROCESSING.title, {
    description: IMAGE_TOAST_MESSAGES.UPDATE_PROCESSING.description,
  });

export const showImageDeleteProcessing = (toast: ToastContextType) =>
  toast.info(IMAGE_TOAST_MESSAGES.DELETE_PROCESSING.title, {
    description: IMAGE_TOAST_MESSAGES.DELETE_PROCESSING.description,
  });

/**
 * Funciones para mostrar toasts de éxito
 */
export const showImageUploadSuccess = (toast: ToastContextType) =>
  toast.success(IMAGE_TOAST_MESSAGES.UPLOAD_SUCCESS.title, {
    description: IMAGE_TOAST_MESSAGES.UPLOAD_SUCCESS.description,
  });

export const showImageUpdateSuccess = (toast: ToastContextType) =>
  toast.success(IMAGE_TOAST_MESSAGES.UPDATE_SUCCESS.title, {
    description: IMAGE_TOAST_MESSAGES.UPDATE_SUCCESS.description,
  });

export const showImageDeleteSuccess = (toast: ToastContextType) =>
  toast.success(IMAGE_TOAST_MESSAGES.DELETE_SUCCESS.title, {
    description: IMAGE_TOAST_MESSAGES.DELETE_SUCCESS.description,
  });

/**
 * Funciones para mostrar toasts de error
 */
export const showImageUploadError = (toast: ToastContextType) =>
  toast.error(IMAGE_TOAST_MESSAGES.UPLOAD_ERROR.title, {
    description: IMAGE_TOAST_MESSAGES.UPLOAD_ERROR.description,
  });

export const showImageUpdateError = (toast: ToastContextType) =>
  toast.error(IMAGE_TOAST_MESSAGES.UPDATE_ERROR.title, {
    description: IMAGE_TOAST_MESSAGES.UPDATE_ERROR.description,
  });

export const showImageDeleteError = (toast: ToastContextType) =>
  toast.error(IMAGE_TOAST_MESSAGES.DELETE_ERROR.title, {
    description: IMAGE_TOAST_MESSAGES.DELETE_ERROR.description,
  });
