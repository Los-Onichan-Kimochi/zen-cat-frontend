import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ErrorModal } from '@/components/custom/common/error-modal';
import { useNavigate } from '@tanstack/react-router';

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsModalOpen(false);
    try {
      const response = await fetch('http://localhost:8098/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody?.message || 'Error al crear usuario');
      }
      const json = await response.json();
      localStorage.setItem('userPIN', json.pin);
      localStorage.setItem('pendingEmail', email);
      navigate({ to: '/pin' }); // Redirige si todo va bien
    } catch (err: any) {
      const errorMessage =
        err.message || 'Error desconocido al intentar ingresar correo.';
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
            Recuperacion de Contraseña
          </h2>
          <p className="text-gray-500 text-sm text-center">
            Ingrese el correo electronico con el que se registró
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-1">
              <label className="block text-gray-700 text-sm">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="Ingrese su correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              Recuperar
            </Button>
          </form>
        </CardContent>
      </Card>
      <ErrorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Ese Usuario no Existe"
        description={error || 'Ha ocurrido un error.'}
      />
    </>
  );
}
