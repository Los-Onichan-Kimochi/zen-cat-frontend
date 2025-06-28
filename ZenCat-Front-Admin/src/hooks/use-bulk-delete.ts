import { useToast } from '@/context/ToastContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseBulkDeleteOptions<T> {
  queryKey: string[];
  deleteFn: (ids: string[]) => Promise<void>;
  entityName: string;
  entityNamePlural: string;
  getId: (item: T) => string;
  onSuccess?: (items: T[]) => void;
}

export function useBulkDelete<T>({
  queryKey,
  deleteFn,
  entityName,
  entityNamePlural,
  getId,
  onSuccess,
}: UseBulkDeleteOptions<T>) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutate: bulkDelete, isPending: isBulkDeleting } = useMutation({
    mutationFn: (items: T[]) => deleteFn(items.map(getId)),
    onSuccess: (_, items) => {
      toast.success(
        `${entityNamePlural.charAt(0).toUpperCase() + entityNamePlural.slice(1)} Eliminados`,
        {
          description: `Los ${entityNamePlural} seleccionados han sido eliminados exitosamente.`,
        },
      );
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(items);
    },
    onError: (err: any) => {
      toast.error(
        `Error al Eliminar ${entityNamePlural.charAt(0).toUpperCase() + entityNamePlural.slice(1)}`,
        {
          description:
            err.message || `No se pudieron eliminar los ${entityNamePlural}.`,
        },
      );
    },
  });

  const handleBulkDelete = (items: T[]) => {
    bulkDelete(items);
  };

  return {
    handleBulkDelete,
    isBulkDeleting,
  };
}
