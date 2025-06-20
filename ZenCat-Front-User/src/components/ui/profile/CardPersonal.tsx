import { useState } from 'react';
import { Input } from '../input';
import { Card, CardContent, CardHeader } from '../card';
import { StaticDropdown } from './StaticDropdown';


const DocumentTypeList = [
    { value: "dni", label: "DNI" },
    { value: "ce", label: "CE" }
];
const GenderList = [
    { value: "dni", label: "DNI" },
    { value: "ce", label: "CE" }
];

interface CardPersonalProps {
    isOnGray: boolean;
    currentEmail: string;
    setCEmail: (value: string) => void;
    currentPhone: string;
    setCPhone: (value: string) => void;
    currentGender: string;
    setCGender: (value: string) => void;
    name: string;
    document: string;
    documentType: string;
    birthDay: string;
}

const CardPersonal: React.FC<CardPersonalProps> = ({
    isOnGray = true,
    currentEmail,
    setCEmail,
    currentPhone,
    setCPhone,
    currentGender,
    setCGender,
    name,
    document,
    documentType,
    birthDay
}) => {


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('handleSubmit called');
        console.log('---------------------');
    };

    return (

        <Card className="w-full bg-white shadow-md">
            <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
                <h2 className="text-2xl font-bold text-center">Datos personales</h2>
                <p className="text-gray-500 text-sm text-center">
                    Estos son sus datos personales registrado en nuestro sistema
                </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <form id="personal_form" onSubmit={handleSubmit} className="grid gap-4">
                    {/* First row - Always disabled */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm">Nombres y apellidos</label>
                            <Input
                                value={name}
                                onChange={(e) => { }}
                                disabled
                                className="disabled:opacity-100 disabled:cursor-default bg-gray-50"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm">Documento</label>
                            <StaticDropdown
                                list={DocumentTypeList}
                                selectedValue={documentType}
                                onSelect={() => { }}
                                placeholder={documentType}
                                triggerTextColor="disabled:opacity-100 disabled:cursor-default bg-gray-50"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm">Número de documento</label>
                            <Input
                                value={document}
                                onChange={(e) => { }}
                                disabled
                                className="disabled:opacity-100 disabled:cursor-default bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Second row - Modifiable when editing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm">Correo electrónico</label>
                            <Input
                                type="email"
                                value={currentEmail}
                                onChange={(e) => setCEmail(e.target.value)}
                                disabled={isOnGray}
                                className={isOnGray ? "disabled:opacity-100 disabled:cursor-default bg-gray-50" : ""}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm">Teléfono celular</label>
                            <Input
                                type="number"
                                value={currentPhone}
                                onChange={(e) => setCPhone(e.target.value)}
                                disabled={isOnGray}
                                className={isOnGray ? "disabled:opacity-100 disabled:cursor-default bg-gray-50" : ""}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm">Fecha de nacimiento</label>
                            <Input
                                type="date"
                                value={birthDay}
                                onChange={(e) => { }}
                                disabled
                                className={isOnGray ? "disabled:opacity-100 disabled:cursor-default bg-gray-50" : ""}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-gray-700 text-sm">Género</label>
                            <StaticDropdown
                                list={GenderList}
                                selectedValue={currentGender}
                                onSelect={setCGender}
                                disable={isOnGray}
                                placeholder={currentGender}
                                triggerTextColor="disabled:opacity-100 disabled:cursor-default bg-gray-50"
                            />
                        </div>
                    </div>


                </form>
            </CardContent>
        </Card>
    );
};

export default CardPersonal;