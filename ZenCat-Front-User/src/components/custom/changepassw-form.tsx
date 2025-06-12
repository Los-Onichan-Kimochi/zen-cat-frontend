import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ErrorModal } from '@/components/custom/common/error-modal';
import { useNavigate, Link } from '@tanstack/react-router';

export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsModalOpen(false);
    try {
      //POST
    } catch (err: any) {
      const errorMessage =
        err.message || 'Error desconocido al cambiar contraseña.';
      setError(errorMessage);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="w-full max-w-md bg-white shadow-md">
        <CardHeader className="flex flex-col items-center gap-2 pt-2 pb-2">
          <div className="bg-blue-100 rounded-full p-2 mb-1">
            <img src="/ico-astrocat.svg" alt="logo" className="w-20 h-20" />
          </div>
          <h2 className="text-2xl font-bold text-center">
            Cambiar Contraseña
          </h2>
          <p className="text-gray-500 text-sm text-center">
            Elija una nueva contraseña
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-1">
                <label className="block text-gray-700 text-sm">Contraseña</label>
                <Input
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                />
            </div>
            <div className="grid gap-1">
                <label className="block text-gray-700 text-sm">
                Confirmar su contraseña
                </label>
                <Input
                type="password"
                placeholder="Ingrese su contraseña otra vez"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
            Confirmar
            </Button>
          </form>
        </CardContent>
      </Card>
      <ErrorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Error al intentar iniciar sesión"
        description={error || 'Ha ocurrido un error.'}
      />
    </>
  );
}
