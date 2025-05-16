import React, { useState } from 'react';
import { User } from '@/types/user';
import { authApi } from '@/api/auth/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ErrorModal } from '@/components/custom/common/error-modal';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

// TODO: Add a loading state and a error state and a success state
// TODO: Add a forgot password button
// TODO: Add a register button
// TODO: Add a social login buttons
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading2, setLoading2] = useState(false);
  const [error2, setError2] = useState<string | null>(null);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsModalOpen(false);
    try {
      const user = await authApi.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error desconocido, comunícate con tu jefe.');
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res: CredentialResponse) => {
    setLoading(true);
    setError(null);
    setIsModalOpen(false);
    try {
      const user = await authApi.loginWithGoogle(res.credential!);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error en login con Google.');
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Error al autenticar con Google.');
    setIsModalOpen(true);
  };

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading2(true);
    setError2(null);
    setIsModalOpen2(false);
    setPingSuccess(false);
    try {
      const response = await fetch('http://localhost:8098/health-check/', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setError2(JSON.stringify(data, null, 2));
      setPingSuccess(true);
    } catch (err: any) {
      setError2(err.message || 'Error al conectar con el servidor de ping.');
      setPingSuccess(false);
    } finally {
      setIsModalOpen2(true);
      setLoading2(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader className="flex flex-col items-center gap-2 pt-8">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <img src="/ico-astrocat.svg" alt="logo" className="w-20 h-20" />
          </div>
          <h2 className="text-2xl font-bold">Bienvenido :)</h2>
          <p className="text-gray-500 text-sm">Inicia sesión en tu cuenta para continuar</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="nena@maldicion.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="contraseña nena :V"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="px-2 text-gray-500">o</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          <form onSubmit={handlePing}>
            <Button
              type="submit"
              className="w-full mt-4 bg-blue-800 hover:bg-blue-700"
              disabled={loading2}
            >
              {loading2 ? 'Pingeando datos...' : 'Ping de datos'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="underline">Comunícate con tu jefe</a>
          </div>
        </CardContent>
      </Card>

      <ErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Error al intentar iniciar sesión"
        description={error || 'Ha ocurrido un error.'}
      />

      <ErrorModal
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
        title={pingSuccess ? 'Ping Exitoso! Respuesta:' : 'Error en Ping de Datos'}
        description={error2 || 'Ha ocurrido un error.'}
      />
    </>
  );
}
