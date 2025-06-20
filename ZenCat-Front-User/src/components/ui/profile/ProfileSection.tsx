import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { useState, useEffect } from 'react';
import { Card } from '../card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import ChangePasswordDialog from './ChangePassword';
import { Input } from '../input';
import CardTest from './CardTest';
import CardPersonal from './CardPersonal';
import CardDirection from './CardDirection';

const ProfileSection: React.FC = () => {
    const [name, setName] = useState('xd');
    // States for personal form
    const [email, setEmail] = useState('email@default.com');
    const [phone, setPhone] = useState('123456789');
    const [gender, setGender] = useState('marica');

    const [currentEmail, setCEmail] = useState(email);
    const [currentPhone, setCPhone] = useState(phone);
    const [currentGender, setCGender] = useState(gender);
    // States for direction form
    const [city, setCity] = useState('lima');
    const [district, setDistrict] = useState('limon');
    const [address, setAddress] = useState('la iglesia');
    const [postal, setPostal] = useState('123');

    const [currentCity, setCCity] = useState(city);
    const [currentDistrict, setCDistrict] = useState(district);
    const [currentAddress, setCAddress] = useState(address);
    const [currentPostal, setCPostal] = useState(postal);
    // States for control
    const [current_form, setCurrentForm] = useState('personal_form');
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isChanged, setisChanged] = useState(false);
    const [isOnGray, setisOnGray] = useState(true);

    //debuggin
    useEffect(() => {
        console.log('Save Dialog State:', isSaveDialogOpen);
        console.log('On gray State:', isOnGray);
        console.log('Change State:', isChanged);
        console.log('address:', address);
        console.log('currentAddress:', currentAddress);
        console.log('---------------------');

    }, [isSaveDialogOpen, isOnGray, isChanged]);

    const saveChanges = () => {
        setEmail(currentEmail);
        setPhone(currentPhone);
        setGender(currentGender);

        setCity(currentCity)
        setAddress(currentAddress);
        setPostal(currentPostal);
        setDistrict(currentDistrict);
        // api call
    }

    const verifyChanges = () => {
        if (email !== currentEmail ||
            phone !== currentPhone ||
            gender !== currentGender ||

            address !== currentAddress ||
            city !== currentCity ||
            postal !== currentPostal ||
            district !== currentDistrict
        ) {
            setisChanged(true);
            return true;
        } else {
            setisChanged(false);
            return false;
        }
    };

    const rollbackChanges = () => {
        setCEmail(email);
        setCPhone(phone);
        setCGender(gender);

        setCCity(city);
        setCAddress(address);
        setCPostal(postal);
        setCDistrict(district);
    }
    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('handleSaveChanges called');
        console.log('Save Dialog State:', isSaveDialogOpen);
        console.log('On gray State:', isOnGray);
        console.log('Change State:', isChanged);
        console.log('---------------------');
        if (isChanged) {
            saveChanges();

            setIsSaveDialogOpen(false);
            setisChanged(false);
            setisOnGray(true);
        }

    };

    const handleCancel = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('handleSaveChanges called');
        console.log('Save Dialog State:', isSaveDialogOpen);
        console.log('On gray State:', isOnGray);
        console.log('Change State:', isChanged);
        console.log('---------------------');
        if (isChanged) {
            rollbackChanges();

            setIsSaveDialogOpen(false);
            setisChanged(false);
            setisOnGray(true);
        }

    };

    return (
        <section className=" pb-16">
            {/* 1. Encabezado */}
            <div className="max-w-4xl mx-auto px-6 text-center mb-8">
                <p className="text-2xl font-black text-gray-900 mb-2">Mi perfil</p>
                <h2 className="text-6xl font-black text-gray-900 mb-4">
                    Bienvenido, {name}
                </h2>

                <div className="flex items-center justify-center bg-blue-100 rounded-full w-54 h-54 mb-2 mx-auto">
                    <img src="/ico-astrocat.svg" alt="logo" className="w-50 h-50" />
                </div>
            </div>
            {/* 2. Contenedor de Tabs */}
            <div className="max-w-8xl mx-auto px-6 mb-6">
                <Tabs defaultValue="personal" className="">
                    <TabsList className="w-3/5 mx-auto grid grid-cols-2 rounded-full bg-gray-200 p-1.5 h-14">
                        <TabsTrigger
                            value="personal"
                            className="rounded-full text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 data-[state=active]:bg-white data-[state=active]:shadow-md h-full flex items-center justify-center"
                            onClick={() => {
                                setCurrentForm('personal_form');
                                if (verifyChanges()) {
                                    setIsSaveDialogOpen(true);
                                } else {
                                    setisOnGray(true);
                                    setisChanged(false);
                                }
                            }}
                        >
                            Personal
                        </TabsTrigger>
                        <TabsTrigger
                            value="direction"
                            className="rounded-full text-base font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 data-[state=active]:bg-white data-[state=active]:shadow-md h-full flex items-center justify-center"
                            onClick={() => {
                                setCurrentForm('direction_form');
                                if (verifyChanges()) {
                                    setIsSaveDialogOpen(true);
                                } else {
                                    setisOnGray(true);
                                    setisChanged(false);
                                }
                            }}
                        >
                            Dirección
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="mt-6">
                        <div className="max-w-6xl mx-auto px-6 mb-6">
                            <CardPersonal
                                isOnGray={isOnGray}
                                currentEmail={currentEmail}
                                setCEmail={setCEmail}
                                currentPhone={currentPhone}
                                setCPhone={setCPhone}
                                currentGender={currentGender}
                                setCGender={setCGender}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="direction" className="mt-6">
                        <div className="max-w-6xl mx-auto px-6 mb-6">
                            <CardDirection
                                isOnGray={isOnGray}
                                currentCity={currentCity}
                                setCCity={setCCity}
                                currentDistrict={currentDistrict}
                                setCDistrict={setCDistrict}
                                currentAddress={currentAddress}
                                setCAddress={setCAddress}
                                currentPostal={currentPostal}
                                setCPostal={setCPostal}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* 3. Action buttons */}
            <div className="flex flex-col items-center gap-4 pt-2">
                {/* First row */}
                <div className="flex justify-center gap-4 w-full">
                    <div className="w-[20%]">
                        {isOnGray ? (
                            <Button
                                form="xd"
                                variant="outline"
                                type="button"
                                className="w-full cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                    setisOnGray(false);
                                }}
                            >
                                Modificar
                            </Button>
                        ) : (
                            <Button
                                form={current_form}
                                type="submit"
                                className="w-full cursor-pointer"
                                onClick={() => {
                                    if (verifyChanges()) {
                                        setIsSaveDialogOpen(true);
                                    } else {
                                        setisOnGray(true);
                                        setisChanged(false);
                                    }
                                }}
                            >
                                Guardar cambios
                            </Button>
                        )}
                    </div>
                    <ChangePasswordDialog />
                </div>

                {/* Second row - only shows Cancel button when not in gray mode */}
                {!isOnGray && (
                    <div className="w-[20%]">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full cursor-pointer"
                            onClick={() => {
                                rollbackChanges();
                                setisOnGray(true);
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                )}
            </div>

            {/* 4. Dialog */}
            <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar cambios</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Está seguro que desea guardar los cambios realizados?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveChanges}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

export default ProfileSection;