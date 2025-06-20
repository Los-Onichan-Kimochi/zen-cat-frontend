import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';

const ChangePasswordDialog = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Password change submitted', { currentPassword, newPassword, confirmPassword });
        // Add your password change logic here
    };

    return (
        <div className="w-[20%]">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full cursor-pointer bg-white text-gray-700 hover:bg-gray-50"
                    >
                        Cambiar contraseña
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cambio de contraseña</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ingrese su contraseña actual, la nueva contraseña y la verificación de la nueva contraseña.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <form id="passwordForm" onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                            <label htmlFor="currentPassword" className="sr-only">Contraseña actual</label>
                            <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Contraseña actual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="sr-only">Nueva contraseña</label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirmar nueva contraseña</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </form>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction type="submit" form="passwordForm">
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ChangePasswordDialog;