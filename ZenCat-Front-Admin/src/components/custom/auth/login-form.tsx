import React, { useState } from 'react';
import { User } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ErrorModal } from '@/components/custom/common/error-modal';
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext';


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
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [error2, setError2] = useState<string | null>(null);
  const [pingSuccess, setPingSuccess] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsModalOpen(false);
    try {
      const response = await fetch('http://localhost:8098/login/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        "email": email,
        "password": password
      }),
      });
      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody?.message || "Error al loguear usuario");
      }
      const json = await response.json();
      const user= json.user;
      console.log(user)
      login(user)
      navigate({ to: "/" }); // Redirige si todo va bien
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido, comunicate con tu jefe.';
      setError(errorMessage);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const { login } = useAuth();

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading2(true);
    setError2(null);
    setIsModalOpen2(false);
    setPingSuccess(false); // Reset success state
    try {
      const response = await fetch('http://localhost:8098/login/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        "email": email,
        "password": password
      }),
      });
      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody?.message || "Error al loguear usuario");
      }
      const json = await response.json();
      const user= json.user;
      console.log(user)
      onLoginSuccess(user);
      login(user)
      navigate({ to: "/" }); // Redirige si todo va bien
    } catch (err: any) {
      console.error("Error en Ping:", err); 
      setError2(err.message || 'Error al conectar con el servidor de ping.');
      setPingSuccess(false); // Indicate error
      setIsModalOpen2(true);
    } finally {
      setLoading2(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseModal2 = () => {
    setIsModalOpen2(false);
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
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <form onSubmit={handlePing}>
          <Button type="submit" className="w-full mt-4 bg-blue-800 hover:bg-blue-700 cursor-pointer" disabled={loading2}>
              {loading2 ? 'Pingeando datos...' : 'Ping de datos'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            ¿No tienes una cuenta? <a href="#" className="underline">Comunícate con tu jefe</a>
          </div>
          {/* TODO: Add remember me, forgot password links here */}
        </CardContent>
      </Card>

      <ErrorModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Error al intentar iniciar sesión"
        description={error || 'Ha ocurrido un error.'}
      />

      <ErrorModal 
        isOpen={isModalOpen2}
        onClose={handleCloseModal2}
        title={pingSuccess ? "Ping Exitoso! Respuesta:" : "Error en Ping de Datos"} 
        description={error2 || 'Ha ocurrido un error.'}
      />
    </>
  );
} 