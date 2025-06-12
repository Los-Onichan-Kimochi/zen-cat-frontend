import React, { useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import PINInputs from '@/components/custom/PINInputs';
import { useNavigate } from '@tanstack/react-router';

interface PINCardProps {
  onComplete?: (pin: string) => void;
}

const PINCard: React.FC<PINCardProps> = ({ onComplete }) => {
  const length = 6;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const navigate = useNavigate();
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {

      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }

      setTimeout(() => {
      const pinArray = inputsRef.current.map((input) => input?.value || '');
        console.log(pinArray.length === length);
      if (pinArray.length === length && pinArray.every((char) => char !== '')) {
        console.log('Intento de verificacion');
        const pin= pinArray.join('');
        verifyPIN(pin);
      }
      }, 0);
    } else {
      e.target.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyPIN = (pin: string) => {
    const pinGuardado = localStorage.getItem('userPIN');
    if (pin === pinGuardado) {
      console.log('PIN correcto');
      onComplete?.(pin);
      navigate({ to: '/changepassword' }); // Redirige si todo va bien
    } else {
      alert('PIN incorrecto');
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-muted pt-24 px-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center -mt-12 shadow-md">
            <img src="/ico-astrocat.svg" alt="logo" className="w-20 h-20" />
          </div>
        </div>

        <CardHeader className="text-center mt-4">
          <CardTitle>Verificación de PIN</CardTitle>
          <CardDescription>Ingrese el código de seguridad</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <PINInputs
            length={length}
            inputsRef={inputsRef}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PINCard;
