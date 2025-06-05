import React, { useState } from 'react';
import { User } from '@/types/user';
import { authApi } from '@/api/auth/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ErrorModal } from '@/components/custom/common/error-modal';
import {GoogleLogin} from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useNavigate,Link } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext';


export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados y funciones para el "Ping de datos"
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
      const response = await fetch("http://localhost:8098/login/", {
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
      onLoginSuccess(user);
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

  const handlePing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading2(true);
    setError2(null);
    setIsModalOpen2(false);
    setPingSuccess(false); // Reset success state
    try {
      const response = await fetch('http://localhost:8098/health-check/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseString = JSON.stringify(data, null, 2);
      setError2(responseString);
      setPingSuccess(true);
      setIsModalOpen2(true);
    } catch (err: any) {
      console.error("Error en Ping:", err);
      setError2(err.message || 'Error al conectar con el servidor de ping.');
      setPingSuccess(false);
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

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log(credentialResponse);
    const decodedToken: any = jwtDecode(credentialResponse.credential);
    console.log(decodedToken)
    
    // Extraer solo nombre y primer apellido
    const fullName = decodedToken.name || '';
    const nameParts = fullName.split(' ');
    const shortName = nameParts[0] || fullName;

    login({
        id: decodedToken.sub,
        name: shortName,
        email: decodedToken.email,
        imageUrl: decodedToken.picture,
      });
    navigate({ to: '/' });
  };

  return (
    <>
      <Card className="w-full max-w-md bg-white shadow-md">
        <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <img src="/ico-astrocat.svg" alt="logo" className="w-20 h-20" />
          </div>
          <h2 className="text-2xl font-bold text-center">Bienvenido</h2>
          <p className="text-gray-500 text-sm text-center">Inicia sesión en tu cuenta para continuar</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label className="block text-gray-700 text-sm">Correo electrónico</label>
            <Input
              type="email"
              placeholder="Ingrese su correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="grid gap-1">
            <label className="block text-gray-700 text-sm">Contraseña</label>
            <Input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
            Iniciar sesión
          </Button>
          </form>

          {/* Sección "O puedes iniciar sesión con:" */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase text-gray-500">
              <span className="bg-white px-2">O puedes iniciar sesión con:</span>
            </div>
          </div>
          <div className="relative flex justify-center">
            <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Login failed")}
            theme="outline"
            size="large"
            width="2000"
            />
          </div>
          {/* Sección "¿Si no tienes cuenta te puedes registrar?" */}
          <div className="mt-6 text-center text-sm text-gray-500">
            ¿Si no tienes cuenta te puedes registrar? <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Registrarse</Link>
          </div>

          {/* Enlace "¿Olvidaste tu contraseña?" */}
          <div className="text-center text-sm text-gray-500 mt-2">
            <Link to="/forgot" className="hover:underline">¿Olvidaste tu contraseña? Presiona aquí</Link>
          </div>

          {/* Botón de "Ping de datos" reintegrado */}
          <form onSubmit={handlePing} className="mt-4">
            <Button type="submit" className="w-full cursor-pointer bg-blue-800 hover:bg-blue-700" disabled={loading2}>
              {loading2 ? 'Pingeando datos...' : 'Ping de datos'}
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

      {/* ErrorModal para el "Ping de datos" */}
      <ErrorModal
        isOpen={isModalOpen2}
        onClose={handleCloseModal2}
        title={pingSuccess ? "Ping Exitoso! Respuesta:" : "Error en Ping de Datos"}
        description={error2 || 'Ha ocurrido un error.'}
      />
    </>
  );
}