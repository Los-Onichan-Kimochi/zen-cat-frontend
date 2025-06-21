import React from 'react';
import { User } from '@/types/user';
import { ChevronDown, User as UserIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface TopBarProps {
    user: User;
}

export function TopBar({ user }: TopBarProps) {
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            {/* Logo o título (opcional) */}
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">Panel de Administración</h1>
            </div>

            {/* Usuario dropdown */}
            <div className="flex items-center space-x-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-4 w-4 text-gray-600" />
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate({ to: '/perfil' })}
                            className="cursor-pointer"
                        >
                            <UserIcon className="mr-2 h-4 w-4" />
                            Mi Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigate({ to: '/mis-comunidades' })}
                            className="cursor-pointer"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            Mis Comunidades
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
