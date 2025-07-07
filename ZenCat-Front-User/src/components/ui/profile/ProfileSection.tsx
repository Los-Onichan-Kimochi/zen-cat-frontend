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
import { userOnboardingApi } from '@/api/users/user-onboarding';
import { onboardingService } from '@/api/onboarding';
import { CreateOnboardingRequest, Gender, UpdateOnboardingRequest } from '@/types/onboarding';
import { set } from 'date-fns';
import { UpdateUserRequest } from '@/types/user';
import { userCommunitiesService } from '@/api/users/user-communities';

const ProfileSection: React.FC = () => {
    const { user: authUser, isAuthenticated } = useAuth();
    // Control states
    const [current_form, setCurrentForm] = useState('personal_form');
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isChanged, setisChanged] = useState(false);
    const [isOnGray, setisOnGray] = useState(true);

    // API CALL with loading state
    const { data: onboardingData } = useQuery({
        queryKey: ['user', authUser?.id],
        queryFn: () => {
            if (!authUser?.id) throw new Error('No user ID available');
            return userOnboardingApi.getUserOnboarding(authUser.id);
        },
        enabled: !!authUser?.id,
    });

    // Initialize all state with empty values
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('OTHER');
    const [province, setProvince] = useState('');
    const [region, setRegion] = useState('');
    const [district, setDistrict] = useState('');
    const [address, setAddress] = useState('');
    const [postal, setPostal] = useState('');
    const [document, setDocument] = useState('default document');
    const [documentType, setDocumentType] = useState('default documentType');
    const [birthDay, setBirthDay] = useState('2001-11-18');

    // Current form values
    const [currentEmail, setCEmail] = useState(email);
    const [currentPhone, setCPhone] = useState(phone);
    const [currentGender, setCGender] = useState(gender);
    const [currentProvince, setCProvince] = useState(province);
    const [currentDistrict, setCDistrict] = useState(district);
    const [currentAddress, setCAddress] = useState(address);
    const [currentPostal, setCPostal] = useState(postal);
    const [currentRegion, setCRegion] = useState(region);

    // Initialize form when API data loads
    useEffect(() => {
        if (onboardingData) {
            const userData = authUser;
            const onboarding = onboardingData;

            // Base user info
            setName(userData?.name || '');
            setEmail(userData?.email || '');
            setPhone(onboarding?.phone_number || '');
            setGender(onboarding?.gender || 'OTHER');
            setProvince(onboarding?.region || '');
            setDistrict(onboarding.district || '');
            setAddress(onboarding.address || '');
            setPostal(onboarding.postal_code || '');
            setDocument(onboarding.document_number || '');
            setDocumentType(onboarding.document_type || 'DNI');
            if (onboarding.birth_date) {
                const isoDate = onboarding.birth_date.split('T')[0];
                setBirthDay(isoDate);
            } else {
                setBirthDay('');
            }
            setRegion(onboarding.region || '');

            // Update current form values
            setCEmail(userData?.email || '');
            setCPhone(onboarding?.phone_number || '');
            setCGender(onboarding?.gender || 'OTHER');
            setCProvince(onboarding?.region || '');
            setCDistrict(onboarding.district || '');
            setCAddress(onboarding.address || '');
            setCPostal(onboarding.postal_code || '');
            setCRegion(onboarding.region || '');


        }
    }, [onboardingData]);


    //MODIFCAR
    async function updateOnboarding(user_id: string, updateData: UpdateOnboardingRequest) {
        if (!user_id) {
            console.error('User ID is required for updating profile');
            return;
        }
        try {
            const updatedData = await onboardingService.updateOnboardingForUser(
                user_id,
                updateData
            );
            console.log('Update onboarding successful:', updatedData);
        } catch (error) {
            console.error('Update failed:', error);
        }
    }

    async function updateProfile(user_id: string, updateData: UpdateUserRequest) {
        if (!user_id) {
            console.error('User ID is required for updating profile');
            return;
        }
        try {
            const updatedData = await userCommunitiesService.updateUser(
                user_id,
                updateData
            );
            console.log('Update user successful:', updatedData);
        } catch (error) {
            console.error('Update failed:', error);
        }
    }


    const saveChanges = async () => {
        console.log('Saving changes...', currentPhone);
        // Update local state first
        setPhone(currentPhone);
        setEmail(currentEmail);
        setPhone(currentPhone);
        setGender(currentGender);
        setProvince(currentProvince);
        setAddress(currentAddress);
        setPostal(currentPostal);
        setDistrict(currentDistrict);
        setRegion(currentRegion);
        authUser.email = currentEmail;

        const updateOnboardingData: UpdateOnboardingRequest = {
            //document_type: 'DNI', // Required by backend
            //document_number: document, // Required by backend
            phone_number: currentPhone,
            gender: currentGender as Gender,
            postal_code: currentPostal,
            address: currentAddress,
            district: currentDistrict, // Required by backend (not null)
            province: currentProvince, // Required by backend (not null)
            region: currentProvince, // Required by backend (not null)
            //birth_date?: string, // Format: ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
        };

        const updateData: UpdateUserRequest = {
            email: currentEmail,
            name: name,
        }
        // API call to update user info
        console.log('phone before:', currentEmail);
        await updateOnboarding(authUser?.id, updateOnboardingData);
        await updateProfile(authUser?.id, updateData);

        // Show success message or handle accordingly
        console.log('Changes saved successfully!', updateData);


    };

    const verifyChanges = () => {
        if (email !== currentEmail ||
            phone !== currentPhone ||
            gender !== currentGender ||

            address !== currentAddress ||
            province !== currentProvince ||
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

        setCProvince(province);
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
                <h2 className="text-6xl font-black text-gray-900 mb-4 gapy-20">
                    Hola, {name}
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
                                currentRegion={currentRegion}
                                setCRegion={setCRegion}
                                currentProvince={currentProvince}
                                setCProvince={setCProvince}
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
