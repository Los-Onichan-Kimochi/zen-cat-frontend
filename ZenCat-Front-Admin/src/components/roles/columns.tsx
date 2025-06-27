'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User } from '@/types/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, MapPin } from 'lucide-react'

interface GetRoleColumnsProps {
  onRoleChange: (userId: string, newRole: string) => void
  isChangingRole: boolean
}

export function getRoleColumns({
  onRoleChange,
  isChangingRole,
}: GetRoleColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'user',
      header: ({ column }) => (
        <div className="text-center font-bold">Usuario</div>
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || ''} alt={user.name || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name || 'Sin nombre'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
      meta: {
        displayName: 'Usuario',
      },
    },
    {
      accessorKey: 'rol',
      header: ({ column }) => (
        <div className="text-center font-bold">Rol Actual</div>
      ),
      cell: ({ row }) => {
        const role = row.original.rol
        const roleConfig = {
          admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-800 border-blue-200' },
          ADMINISTRATOR: { label: 'Administrador', color: 'bg-blue-100 text-blue-800 border-blue-200' },
          user: { label: 'Cliente', color: 'bg-green-100 text-green-800 border-green-200' },
          CLIENT: { label: 'Cliente', color: 'bg-green-100 text-green-800 border-green-200' },
          guest: { label: 'Invitado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
          GUEST: { label: 'Invitado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
        }
        
        const config = roleConfig[role] || { label: role, color: 'bg-gray-100 text-gray-800 border-gray-200' }
        
        return (
          <div className="text-center">
            <Badge variant="outline" className={config.color}>
              {config.label}
            </Badge>
          </div>
        )
      },
      meta: {
        displayName: 'Rol Actual',
      },
    },
    {
      accessorKey: 'changeRole',
      header: ({ column }) => (
        <div className="text-center font-bold">Cambiar Rol</div>
      ),
      cell: ({ row }) => {
        const user = row.original
        const currentRole = user.rol
        
        return (
          <div className="flex justify-center">
            <Select
              value={currentRole}
              onValueChange={(newRole) => onRoleChange(user.id, newRole)}
              disabled={isChangingRole}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        displayName: 'Cambiar Rol',
      },
    },
    {
      id: 'phone',
      accessorFn: (row) => row.phone || row.onboarding?.phoneNumber,
      header: ({ column }) => (
        <div className="text-center font-bold">Teléfono</div>
      ),
      cell: ({ row }) => {
        const user = row.original
        const phone = user.phone || user.onboarding?.phoneNumber || 'No disponible'
        return (
          <div className="flex items-center justify-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{phone}</span>
          </div>
        )
      },
      enableSorting: true,
      meta: {
        displayName: 'Teléfono',
      },
    },
    {
      id: 'location',
      accessorFn: (row) => `${row.city || row.onboarding?.city || ''} ${row.district || row.onboarding?.district || ''}`.trim(),
      header: ({ column }) => (
        <div className="text-center font-bold">Ubicación</div>
      ),
      cell: ({ row }) => {
        const user = row.original
        const city = user.city || user.onboarding?.city
        const district = user.district || user.onboarding?.district
        const location = [city, district].filter(Boolean).join(', ') || 'No disponible'
        
        return (
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{location}</span>
          </div>
        )
      },
      enableSorting: true,
      meta: {
        displayName: 'Ubicación',
      },
    },
  ]
} 