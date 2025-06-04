'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { servicesApi } from '@/api/services/services';
import { professionalsApi } from '@/api/professionals/professionals';
import HeaderDescriptor from '@/components/common/header-descriptor';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/servicios/servicio-ver')({
    component: SeeServicePageComponent,
});

export function SeeServicePageComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    // estados controlados para cada campo
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isVirtual, setIsVirtual] = useState('');

    const id = typeof window !== 'undefined'
        ? localStorage.getItem('currentService')
        : null;

    if (!id) {
        navigate({ to: '/servicios' });
        return null;
    }

    const { data: ser, isLoading, error } = useQuery({
        queryKey: ['service', id],
        queryFn: () => servicesApi.getServiceById(id!),
    });

    // inicializar estados al cargar prof
    useEffect(() => {
        if (ser) {
            setName(ser.name);
            setDescription(ser.description);
            setIsVirtual(ser.is_virtual === true ? 'Sí' : 'No');
        }
    }, [ser]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-12 h-12" /></div>;
    }
    if (error || !ser) {
        navigate({ to: '/servicios' });
        return null;
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <HeaderDescriptor title="Ver Servicio" />
            <Card>
                <CardHeader>
                    <CardTitle>Datos del servicio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} disabled={!isEditing} />
                    </div>
                    <div>
                        <Label htmlFor="description">Descripcion</Label>
                        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} disabled={!isEditing} />
                    </div>
                    <div>
                        <Label htmlFor="second_last_name">¿Es Virtual?</Label>
                        <Input id="second_last_name" value={isVirtual} onChange={e => setIsVirtual(e.target.value)} disabled={!isEditing} />
                    </div>
                    
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="secondary" onClick={() => navigate({ to: '/profesionales' })}>
                        Volver
                    </Button>
                    <Button
                        variant="default"
                        onClick={async() => {
                            if (isEditing) {

                                await servicesApi.updateService(id!, {
                                    name,
                                    description,
                                    is_virtual: isVirtual === 'Sí' ? true : isVirtual === 'No' ? false : undefined,
                                });
                                await queryClient.invalidateQueries({ queryKey: ['services'] });
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
