import React, { useState } from 'react';
import { User } from '@/types/user';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ErrorModal } from '@/components/custom/common/error-modal';
import { useNavigate,Link } from '@tanstack/react-router'
import { dividirNombreCompleto } from "@/utils/nameparser";
import { authService } from '@/api/auth/auth-service';
import { useAuth } from '@/context/AuthContext';

export function SignupForm(){
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isModalOpen2, setIsModalOpen2] = useState(false);//modal para registro exitoso

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //evita el refresh por defecto
        
        // Validar campos vacíos
        if (!name.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
            setError("Todos los campos son obligatorios.");
            setIsModalOpen(true);
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setIsModalOpen(true);
            return;
        }

        setLoading(true);
        setError(null);
        setIsModalOpen(false);

        try {
            // Separar apellidos
            const lastNameParts = lastName.trim().split(/\s+/);
            const firstLastName = lastNameParts[0];
            const secondLastName = lastNameParts.length > 1 ? lastNameParts.slice(1).join(" ") : '';

            console.log('SignupForm: Attempting registration...');

            // Usar el nuevo authService
            const response = await authService.register({
                name: name.trim(),
                first_last_name: firstLastName,
                second_last_name: secondLastName || '',
                email: email.trim(),
                password: password,
                image_url: "https://preview.redd.it/sleepy-chaewon-v0-mc8zvaqg8ghe1.jpg?width=640&crop=smart&auto=webp&s=7848544793550f6754ba5eb69d3c1e90f56190d9"
            });

            console.log('SignupForm: Registration successful:', response);

            // Validar que la respuesta tenga la estructura esperada
            if (!response.user || !response.tokens?.access_token) {
                throw new Error('Respuesta del servidor inválida - faltan datos de usuario o tokens');
            }

            // El authService ya guarda los tokens en cookies
            // Crear el objeto de usuario para el contexto
            const userData = {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                imageUrl: response.user.image_url || '',
                role: response.user.rol.toLowerCase(),
                isAuthenticated: true
            };

            console.log('SignupForm: Setting user in context:', userData);
            login(userData);

            // Redirigir al home después del registro exitoso
            navigate({ to: "/" });
        } catch (err: any) {
            console.error('SignupForm: Registration error:', err);
            
            let errorMessage = 'Error al crear la cuenta';
            
            if (err.message) {
                if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    errorMessage = 'Ya existe una cuenta con este email';
                } else if (err.message.includes('500')) {
                    errorMessage = 'Error del servidor - Inténtalo de nuevo más tarde';
                } else {
                    errorMessage = err.message;
                }
            }
            
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
                    <h2 className="text-2xl font-bold text-center">Registrarse</h2>
                    <p className="text-gray-500 text-sm text-center">Ingrese sus datos</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <div className="grid gap-1">
                            <label className="block text-gray-700 text-sm">Nombres</label>
                            <Input
                                type="text"
                                placeholder="Ingrese su nombre completo"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="block text-gray-700 text-sm">Apellidos</label>
                            <Input
                                type="text"
                                placeholder="Ingrese su apellido completo"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="block text-gray-700 text-sm">Correo electrónico</label>
                            <Input
                                type="email"
                                placeholder="Ingrese su correo electrónico"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
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
                        <div className="grid gap-1">
                            <label className="block text-gray-700 text-sm">Confirmar su contraseña</label>
                            <Input
                                type="password"
                                placeholder="Ingrese su contraseña otra vez"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-500">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                            Iniciar sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <ErrorModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Error al intentar registrarse"
                description={error || 'Ha ocurrido un error.'}
            />
        </>
    );
}