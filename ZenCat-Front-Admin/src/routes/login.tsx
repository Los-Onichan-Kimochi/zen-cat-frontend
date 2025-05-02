import React, { useState } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { authApi } from '@/api/auth/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import '@/styles/custom/login.css';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

// TODO: Add a loading state and a error state and a success state
// TODO: Add a forgot password button
// TODO: Add a register button
// TODO: Add a social login buttons
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal 
// TODO: Add a social login buttons
// TODO: Add a remember me checkbox
// TODO: Add a forgot password modal
// TODO: Add a register modal

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.login(email, password);
      navigate({ to: '/' });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Background Image */}
      <div 
        className="hidden md:flex w-1/2 login-background bg-black items-center justify-center bg-cover bg-center" 
      >
        {/* Image tag is removed, the div itself has the background */}
      </div>
      {/* Right: Login Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="flex flex-col items-center gap-2 pt-8">
            <div className="bg-blue-100 rounded-full p-3 mb-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 className="text-2xl font-bold">Bienvenido</h2>
            <p className="text-gray-500 text-sm">Inicia sesión en tu cuenta para continuar</p>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="ejemplo@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-500">
              ¿No tienes una cuenta? <a href="#" className="underline">Regístrate</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
