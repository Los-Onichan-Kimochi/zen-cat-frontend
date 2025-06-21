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
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { User, CreateUserPayload } from '@/types/user';
import { userApi } from '@/api/user/user';

const ProfileSection: React.FC = () => {
    const { user: authUser, isAuthenticated } = useAuth();
    // Control states
    const [current_form, setCurrentForm] = useState('personal_form');
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isChanged, setisChanged] = useState(false);
    const [isOnGray, setisOnGray] = useState(true);

    // API CALL with loading state
    const {
        data: apiUserData,
        isLoading,
        isError
    } = useQuery<User, Error>({
        queryKey: ['user', authUser?.id],
        queryFn: async () => {
            if (!authUser?.id) throw new Error('No user ID available');
            console.log('Fetching user data for ID:', authUser.id);
            const response = await userApi.getUserById(authUser.id);
            console.log('API response:', response);
            return response;
        },
        enabled: isAuthenticated && !!authUser?.id,
        staleTime: Infinity,
        refetchOnWindowFocus: false
    });

    // Initialize all state with empty values
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('OTHER');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [address, setAddress] = useState('');
    const [postal, setPostal] = useState('');

    const [document, setDocument] = useState('default document');
    const [documentType, setDocumentType] = useState('default documentType');
    const [birthDay, setBirthDay] = useState('2000-01-01');

    // Current form values
    const [currentEmail, setCEmail] = useState(email);
    const [currentPhone, setCPhone] = useState(phone);
    const [currentGender, setCGender] = useState(gender);
    const [currentCity, setCCity] = useState(city);
    const [currentDistrict, setCDistrict] = useState(district);
    const [currentAddress, setCAddress] = useState(address);
    const [currentPostal, setCPostal] = useState(postal);

    // Initialize form when API data loads
    useEffect(() => {
        console.log('API User Data:', apiUserData);
        if (apiUserData) {
            // Transform API data to match your frontend interface
            const userData = apiUserData;
            const onboarding = userData.onboarding || {};

            // Base user info
            setName(userData.name || '');
            setEmail(userData.email || '');

            // Onboarding info - now using camelCase from the mapped data
            setPhone(onboarding.phoneNumber || '');
            setGender(onboarding.gender || 'OTHER');
            setCity(onboarding.city || '');
            setDistrict(onboarding.district || '');
            setAddress(onboarding.address || '');
            setPostal(onboarding.postalCode || '');

            setDocument(onboarding.documentNumber || '');
            setDocumentType(onboarding.documentType || 'DNI');
            setBirthDay(onboarding.birthDate || '2000-01-01');

            // Update current form values
            setCEmail(userData.email || '');
            setCPhone(onboarding.phoneNumber || '');
            setCGender(onboarding.gender || 'OTHER');
            setCCity(onboarding.city || '');
            setCDistrict(onboarding.district || '');
            setCAddress(onboarding.address || '');
            setCPostal(onboarding.postalCode || '');

            console.log('Mapped user data:', userData);
        }
    }, [apiUserData]);

    // Loading state
    if (isLoading) {
        return <div>Loading profile data...</div>;
    }

    // Error state
    if (isError) {
        return <div>Error loading profile data</div>;
    }

    async function updateProfile(updateData: CreateUserPayload) {
        try {
            console.log('Updating profile with:', updateData);
            console.log('IN:', apiUserData?.id);
            const userId = authUser?.id; // Replace with actual user ID
            const updatedUser = await userApi.updateUser(apiUserData?.id, updateData);
            console.log('Update successful!', updatedUser);
        } catch (error) {
            console.error('Update failed:', error);
        }
    }

    const saveChanges = async () => {

        // Update local state first
        setEmail(currentEmail);
        setPhone(currentPhone);
        setGender(currentGender);
        setCity(currentCity);
        setAddress(currentAddress);
        setPostal(currentPostal);
        setDistrict(currentDistrict);

        const updateData: CreateUserPayload = {
            email: currentEmail,
            name: name,
            role: 'user',
            phone: currentPhone,
            address: currentAddress,
            district: currentDistrict,
            password: apiUserData?.password || '',
            onboarding: {                   // Optional
                phoneNumber: currentPhone,
                address: currentAddress,
                city: currentCity,
                postalCode: currentPostal,
                district: currentDistrict,
            }
        };

        // API call to update user info
        await updateProfile(updateData);

        // Show success message or handle accordingly
        console.log('Changes saved successfully!', updateData);


    };

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
                                name={name}
                                document={document}
                                documentType={documentType}
                                birthDay={birthDay}
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
