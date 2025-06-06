import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseBulkDeleteOptions<T> {
  queryKey: string[];
  deleteFn: (ids: string[]) => Promise<void>;
  entityName: string;
  entityNamePlural: string;
  getId: (item: T) => string;
}

export function useBulkDelete<T>({
  queryKey,
  deleteFn,
  entityName,
  entityNamePlural,
  getId,
}: UseBulkDeleteOptions<T>) {
  const queryClient = useQueryClient();

  const { mutate: bulkDelete, isPending: isBulkDeleting } = useMutation({
    mutationFn: (items: T[]) => deleteFn(items.map(getId)),
    onSuccess: (_, items) => {
      toast.success(`${entityNamePlural} eliminados`, {
        description: `${items.length} ${entityNamePlural} eliminados`,
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(`Error al eliminar ${entityNamePlural}`, { 
        description: err.message 
      });
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