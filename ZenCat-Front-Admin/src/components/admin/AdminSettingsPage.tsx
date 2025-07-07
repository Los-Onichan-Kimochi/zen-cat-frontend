import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Edit,
  Shield
} from 'lucide-react';
import { ChangeNameModal } from './modals/ChangeNameModal';
import { ChangeEmailModal } from './modals/ChangeEmailModal';
import { ChangePasswordModal } from './modals/ChangePasswordModal';
import { ChangePhotoModal } from './modals/ChangePhotoModal';

export function AdminSettingsPage() {
  const { user } = useAuth();
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Administrador</h1>
            <p className="text-gray-600">Gestiona tu información personal y configuraciones de seguridad</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Información del Usuario
          </CardTitle>
          <CardDescription>
            Tu información actual como administrador del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar || user?.image_url} alt={user?.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user?.name || 'Administrador'}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-green-600 font-medium mt-1">
                {user?.rol === 'ADMINISTRATOR' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-600" />
              Foto de Perfil
            </CardTitle>
            <CardDescription>
              Actualiza tu imagen de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar || user?.image_url} alt={user?.name} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Imagen actual</p>
                  <p className="text-sm text-gray-500">Formato: JPG, PNG</p>
                </div>
              </div>
              <Button 
                onClick={() => setPhotoModalOpen(true)}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Name Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Nombre de Usuario
            </CardTitle>
            <CardDescription>
              Actualiza tu nombre de usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500">Nombre actual</p>
              </div>
              <Button 
                onClick={() => setNameModalOpen(true)}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Correo Electrónico
            </CardTitle>
            <CardDescription>
              Actualiza tu dirección de correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.email || 'Sin email'}</p>
                <p className="text-sm text-gray-500">Email actual</p>
              </div>
              <Button 
                onClick={() => setEmailModalOpen(true)}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Contraseña
            </CardTitle>
            <CardDescription>
              Actualiza tu contraseña de acceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">••••••••••••</p>
                <p className="text-sm text-gray-500">Contraseña actual</p>
              </div>
              <Button 
                onClick={() => setPasswordModalOpen(true)}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ChangeNameModal 
        open={nameModalOpen}
        onOpenChange={setNameModalOpen}
      />
      <ChangeEmailModal 
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
      />
      <ChangePasswordModal 
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
      />
      <ChangePhotoModal 
        open={photoModalOpen}
        onOpenChange={setPhotoModalOpen}
      />
    </div>
  );
} 