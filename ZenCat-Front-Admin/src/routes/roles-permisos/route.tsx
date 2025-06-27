import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Users, Shield, UserCheck } from 'lucide-react'
import HeaderDescriptor from '@/components/common/header-descriptor'
import HomeCard from '@/components/common/home-card'
import { usuariosApi } from '@/api/usuarios/usuarios'
import type { User } from '@/types/user'
import { toast } from 'sonner'
import { RoleTable } from '@/components/roles/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/context/ToastContext'

export const Route = createFileRoute('/roles-permisos')({
  component: RolesPermisosPage,
})

function RolesPermisosPage() {
  const queryClient = useQueryClient()
  const toastContext = useToast()
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [roleChangeData, setRoleChangeData] = useState<{ userId: string; newRole: string; userName: string } | null>(null)

  // Consulta para obtener usuarios
  const { data: users, isLoading: usersLoading, refetch: refetchUsers, isFetching: isFetchingUsers } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosApi.getUsuarios,
  })

  // Calcular estadísticas basadas en los datos de usuarios
  const stats = React.useMemo(() => {
    if (!users) return { total_users: 0, admin_count: 0, client_count: 0, guest_count: 0 }
    
    const adminCount = users.filter(user => user.rol === 'admin' || user.rol === 'ADMINISTRATOR').length
    const clientCount = users.filter(user => user.rol === 'user' || user.rol === 'CLIENT').length
    const guestCount = users.filter(user => user.rol === 'guest' || user.rol === 'GUEST').length
    
    return {
      total_users: users.length,
      admin_count: adminCount,
      client_count: clientCount,
      guest_count: guestCount,
    }
  }, [users])

  const statsLoading = usersLoading

  // Mutación para cambiar rol
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Mapear rol del frontend al backend
      const backendRole = role === 'admin' ? 'ADMINISTRATOR' : role === 'user' ? 'CLIENT' : 'GUEST';
      
      // Actualizar el rol del usuario usando la API real
      return await usuariosApi.updateUsuario(userId, { rol: backendRole });
    },
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toastContext.success('Rol Actualizado', {
        description: `El rol del usuario ha sido actualizado a ${getRoleDisplayName(variables.role)}`,
      })
    },
    onError: (error: any) => {
      toastContext.error('Error al cambiar rol', {
        description: error.message || 'No se pudo actualizar el rol del usuario',
      })
    },
  })

  const handleRoleChange = (userId: string, newRole: string) => {
    const user = users?.find(u => u.id === userId)
    if (user) {
      setRoleChangeData({ userId, newRole, userName: user.name || user.email })
      setIsChangeRoleModalOpen(true)
    }
  }

  const confirmRoleChange = () => {
    if (roleChangeData) {
      changeRoleMutation.mutate({ userId: roleChangeData.userId, role: roleChangeData.newRole })
    }
    setIsChangeRoleModalOpen(false)
    setRoleChangeData(null)
  }

  const handleRefresh = async () => {
    const startTime = Date.now()
    
    const result = await refetchUsers()
    
    // Asegurar que pase al menos 1 segundo
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, 1000 - elapsedTime)
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
    
    return result
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'user':
        return 'Cliente'
      case 'guest':
        return 'Invitado'
      default:
        return role
    }
  }

  return (
    <div className="p-6 h-screen flex flex-col font-montserrat overflow-hidden">
      <HeaderDescriptor title="ROLES Y PERMISOS" subtitle="GESTIÓN DE ROLES DE USUARIO" />

      {/* Statistics Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center space-x-20 mt-2 font-montserrat min-h-[120px]">
          {statsLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          ) : (
            <>
              <HomeCard
                icon={<Users className="w-8 h-8 text-blue-600" />}
                iconBgColor="bg-blue-100"
                title="Total Usuarios"
                description={stats.total_users}
                descColor="text-blue-600"
                isLoading={isFetchingUsers}
              />
              <HomeCard
                icon={<Shield className="w-8 h-8 text-blue-600" />}
                iconBgColor="bg-blue-100"
                title="Administradores"
                description={stats.admin_count}
                descColor="text-blue-600"
                isLoading={isFetchingUsers}
              />
              <HomeCard
                icon={<UserCheck className="w-8 h-8 text-green-600" />}
                iconBgColor="bg-green-100"
                title="Clientes"
                description={stats.client_count}
                descColor="text-green-600"
                isLoading={isFetchingUsers}
              />
            </>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {usersLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-gray-500" />
          </div>
        ) : (
          <RoleTable
            data={users || []}
            isLoading={isFetchingUsers}
            onRoleChange={handleRoleChange}
            isChangingRole={changeRoleMutation.isPending}
            onRefresh={handleRefresh}
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={isChangeRoleModalOpen} onOpenChange={setIsChangeRoleModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Confirmar cambio de rol?
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cambiar el rol del usuario?
              <div className="mt-2 font-medium">
                Usuario: {roleChangeData?.userName}
              </div>
              <div className="mt-1 font-medium">
                Nuevo rol: {roleChangeData?.newRole ? getRoleDisplayName(roleChangeData.newRole) : ''}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <AlertDialogCancel onClick={() => setIsChangeRoleModalOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRoleChange}
              disabled={changeRoleMutation.isPending}
            >
              {changeRoleMutation.isPending ? 'Cambiando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
