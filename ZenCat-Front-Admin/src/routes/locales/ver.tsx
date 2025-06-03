'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller, set } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { localsApi } from '@/api/locals/locals';
import HeaderDescriptor from '@/components/common/header-descriptor';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import regions from '@/types/ubigeo_peru_2016_departamentos.json';
import provinces from '@/types/ubigeo_peru_2016_provincias.json';
import districts from '@/types/ubigeo_peru_2016_distritos.json';

export const Route = createFileRoute('/locales/ver')({
    component: SeeLocalPageComponent,
});

export function SeeLocalPageComponent(){
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
    const [initialValues, setInitialValues] = useState({
        local_name: '',
        street_name: '',
        building_number: '',
        district: '',
        province: '',
        region: '',
        reference: '',
        capacity: 0,
        image_url: '',
    });
    const [local_name,setLocalName] = useState('');
    const [street_name, setStreetName] = useState('');
    const [building_number, setBuildingNumber] = useState('');
    const [district, setDistrict] = useState('');
    const [province, setProvince] = useState('');
    const [region, setRegion] = useState('');
    const [reference, setReference] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [image_url, setImageUrl] = useState('');

    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
      const filteredProvinces = provinces.filter(
        (province) => province.department_id === selectedRegion
      );
    
      const filteredDistricts = districts.filter(
        (district) => district.province_id === selectedProvince
      );
    const id = typeof window !== 'undefined'
        ? localStorage.getItem('currentLocal')
        : null;
    if(!id){
        navigate({ to: '/locales' });
    }
    const { data: local, isLoading } = useQuery({
        queryKey: ['local', id],
        queryFn: () => localsApi.getLocalById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (local && initialValues.local_name === '') {
            setLocalName(local.local_name);
            setStreetName(local.street_name);
            setBuildingNumber(local.building_number);
            setDistrict(local.district);
            setProvince(local.province);
            setRegion(local.region);
            setReference(local.reference);
            setCapacity(local.capacity);
            setImageUrl(local.image_url);
            setInitialValues({
                local_name: local.local_name,
                street_name: local.street_name,
                building_number: local.building_number,
                district: local.district,
                province: local.province,
                region: local.region,
                reference: local.reference,
                capacity: local.capacity,
                image_url: local.image_url
            })
        }
        const selectedReg = regions.find(r => r.name === local?.region);
        setSelectedRegion(selectedReg?.id || '');

        const selectedProv = provinces.find(p => p.name === local?.province);
        setSelectedProvince(selectedProv?.id || '');

        const selectedDist = districts.find(d => d.name === local?.district);
        setSelectedDistrict(selectedDist?.id || '');
    }, [local, initialValues.local_name]);
    if(isLoading){
        return(
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" />
            </div>
        )
    }
    const hasChanges =
        local_name !== initialValues.local_name ||
        street_name !== initialValues.street_name ||
        building_number !== initialValues.building_number ||
        district !== initialValues.district ||
        province !== initialValues.province ||
        region !== initialValues.region ||
        reference !== initialValues.reference ||
        capacity !== initialValues.capacity ||
        image_url !== initialValues.image_url;
    return(
        <>
        <div className="p-2 md:p-6 h-full flex flex-col font-montserrat">
            <HeaderDescriptor title="LOCALES" subtitle="VER LOCAL" />
            <Card className="mt-6 flex-grow">
                <CardHeader>
                        <CardTitle>Datos del local</CardTitle>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="grid grid-cols-1 gap-y-6">
                                <div>
                                    <Label htmlFor="local_name">Nombre del Local</Label>
                                    <Input
                                        id="local_name"
                                        value={local_name}
                                        onChange={e => setLocalName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="street_name">Calle</Label>
                                    <Input
                                        id="street_name"
                                        value={street_name}
                                        onChange={e => setStreetName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="building_number">N°</Label>
                                    <Input
                                        id="building_number"
                                        value={building_number}
                                        onChange={e => setBuildingNumber(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="region" className="mb-2">Región</Label>
                                    {isEditing ? (
                                        <Select onValueChange={(val) => {
                                            const selected = regions.find(r => r.id === val);
                                            setSelectedRegion(selected?.id || '');
                                            setRegion(selected?.name || '');
                                            setSelectedProvince('');
                                            setProvince('');
                                            setSelectedDistrict('');
                                            setDistrict('');
                                        }}
                                            value = {regions.find(r => r.id === selectedRegion)?.name || ''}
                                            defaultValue={region}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una región" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regions.map((region) => (
                                                    <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input value={region} disabled />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="province" className="mb-2">Provincia</Label>
                                    {isEditing ? (
                                        <Select  onValueChange={(val) => {
                                            const selected = filteredProvinces.find((p) => p.id === val);
                                            setSelectedProvince(selected?.id || '');
                                            setProvince(selected?.name || '');
                                            setSelectedDistrict('');
                                            setDistrict('');
                                        }} 
                                            value={provinces.find(p => p.id === selectedProvince)?.name || ''}
                                            defaultValue={province}  
                                            disabled={!region}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una provincia" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredProvinces.map((province) => (
                                                    <SelectItem key={province.id} value={province.id}>{province.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input value={province} disabled />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="district" className="mb-2">Distrito</Label>
                                    {isEditing ? (
                                        <Select onValueChange={(val) => {
                                            const selected = filteredDistricts.find((d) => d.id === val);
                                            setSelectedDistrict(selected?.id || '');
                                            setDistrict(selected?.name || ''); // ← guardar el name
                                        }}
                                        value= {districts.find(d => d.id === selectedDistrict)?.name || ''} 
                                        defaultValue={district}
                                        disabled={!province}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un distrito" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredDistricts.map((district) => (
                                                    <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input value={district} disabled />
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="reference">Referencia</Label>
                                    <Input
                                        id="reference"
                                        value={reference}
                                        onChange={e => setReference(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="capacity">Capacidad</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={capacity}
                                        onChange={e => setCapacity(Number(e.target.value))}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <Label htmlFor="ImageUrl" className="mb-2 self-start">
                                    Foto del local
                                </Label>
                                <div className="w-full h-100 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 mb-4">
                                    <UploadCloud size={48} className="text-gray-400" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="secondary" onClick={() => navigate({ to: '/locales' })}>
                                Volver
                            </Button>
                            <Button
                                variant="default"
                                onClick={() => {
                                    if (!isEditing) {
                                        setIsEditing(true);
                                    } else if (hasChanges) {
                                        setIsEditConfirmOpen(true);
                                    } else {
                                        setIsEditing(false);
                                    }
                                }}
                            >
                                {isEditing ? 'Guardar' : 'Editar'}
                            </Button>
                        </CardFooter>
                </CardHeader>
            </Card>
        </div>
        <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar modificaciones</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro que deseas guardar los cambios realizados?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsEditConfirmOpen(false)}>
                            Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction asChild> 
                        <Button
                                variant="destructive"
                                onClick={() => {
                                    localsApi.updateLocal(id!,{
                                        local_name: local_name,
                                        street_name: street_name,
                                        building_number: building_number,
                                        district: district,
                                        province: province,
                                        region: region,
                                        reference: reference,
                                        capacity: capacity,
                                        image_url: image_url
                                    })
                                    setInitialValues({
                                        local_name: local_name,
                                        street_name: street_name,
                                        building_number: building_number,
                                        district: district,
                                        province: province,
                                        region: region,
                                        reference: reference,
                                        capacity: capacity,
                                        image_url: image_url
                                    })
                                    setIsEditing(false);
                                    setIsEditConfirmOpen(false);
                                    navigate({ to: '/locales' });
                                }}
                        >
                            Confirmar
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog> 
        </>
    );
}