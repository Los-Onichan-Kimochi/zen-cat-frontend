import { createFileRoute } from '@tanstack/react-router';
import ProfileSection from '@/components/ui/profile/ProfileSection.tsx';

export const Route = createFileRoute('/profile')({
    component: ProfileComponent,
});


import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';
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
import { userApi } from '@/api/user/user';


export function ProfileComponent() {
    const { user: authUser, isAuthenticated } = useAuth();


    const updateData: CreateUserPayload = {
        email: 'test-1@zen-cat.com',       // Required
        name: 'xdd ddd',               // Required
        role: 'user',                   // Required
        password: 'test123',  // Required
        phone: '321654',             // Optional
        onboarding: {                   // Optional
            phoneNumber: '321654',
            address: '123 Main St'
        }
    };

    async function updateProfile() {
        try {
            console.log('Updating profile with:', updateData);
            const userId = authUser?.id; // Replace with actual user ID
            const updatedUser = await userApi.updateUser(authUser?.id, updateData);
            console.log('Update successful!', updatedUser);
        } catch (error) {
            console.error('Update failed:', error);
        }
    }

    return (
        <div className="bg-white">

            <ProfileSection />
        </div>
    );
}
