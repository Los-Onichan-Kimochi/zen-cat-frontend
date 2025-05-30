'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { professionalsApi } from '@/api/professionals/professionals';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';

export const Route = createFileRoute('/profesionales/ver')({
    component: SeeProfessionalPageComponent,
});

export function SeeProfessionalPageComponent() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState('');
    const [firstLast, setFirstLast] = useState('');
    const [secondLast, setSecondLast] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const id = typeof window !== 'undefined'
        ? localStorage.getItem('currentProfessional')
        : null;

    if (!id) {
        navigate({ to: '/profesionales' });
        return null;
    }

    const { data: prof, isLoading, error } = useQuery({
        queryKey: ['professional', id],
        queryFn: () => professionalsApi.getProfessionalById(id!),
    });

    useEffect(() => {
        if (prof) {
            setName(prof.name);
            setFirstLast(prof.first_last_name);
            setSecondLast(prof.second_last_name || '');
            setSpecialty(prof.specialty);
            setEmail(prof.email);
            setPhone(prof.phone_number);
        }
    }, [prof]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        );
    }
    if (error || !prof) {
        navigate({ to: '/profesionales' });
        return null;
    }

    return (
        <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
            <HeaderDescriptor title="PROFESIONALES" subtitle="VER PROFESIONALES" />

            <Card className="mt-6 flex-grow">
                <CardHeader>
                    <CardTitle>Datos del profesional</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="grid grid-cols-1 gap-y-6">
                        <div>
                            <Label htmlFor="name">Nombres</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="first_last_name">Primer Apellido</Label>
                            <Input id="first_last_name" value={firstLast} onChange={e => setFirstLast(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="second_last_name">Segundo Apellido</Label>
                            <Input id="second_last_name" value={secondLast} onChange={e => setSecondLast(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="specialty">Especialidad</Label>
                            <Input id="specialty" value={specialty} onChange={e => setSpecialty(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input id="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!isEditing} />
                        </div>
                        <div>
                            <Label htmlFor="phone_number">Teléfono</Label>
                            <Input id="phone_number" value={phone} type="text" inputMode="numeric" onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))} disabled={!isEditing} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Label htmlFor="profileImageFile" className="mb-2 self-start">Foto de perfil</Label>
                        <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4 relative">
                            <UploadCloud size={48} className="text-gray-400" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="secondary" onClick={() => navigate({ to: '/profesionales' })}>
                        Volver
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => {
                            if (isEditing) {
                                professionalsApi.updateProfessional(id!, {
                                    name,
                                    first_last_name: firstLast,
                                    second_last_name: secondLast,
                                    specialty,
                                    email,
                                    phone_number: phone,
                                });
                            }
                            setIsEditing(!isEditing);
                        }}
                    >
                        {isEditing ? 'Bloquear' : 'Editar'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
