import { User } from "@/types/user";

export interface UserWithExtra extends User {
  address?: string;
  district?: string;
  phone?: string;
  membershipsIds?: number[];
}

// Mock de membresías
export const mockMemberships = [
  {
    id: 1,
    comunidad: "Runners",
    tipo: "Mensual",
    costo: "$ 150",
    limiteReservas: "10",
    fechaInicio: "12 - 04 - 2025",
    fechaFin: "12 - 05 - 2025",
    estado: "Activo",
    estadoColor: "bg-green-400"
  },
  {
    id: 2,
    comunidad: "Los magníficos",
    tipo: "Anual",
    costo: "$ 1500",
    limiteReservas: "ilimitado",
    fechaInicio: "12 - 04 - 2025",
    fechaFin: "12 - 04 - 2026",
    estado: "Activo",
    estadoColor: "bg-green-400"
  },
  {
    id: 3,
    comunidad: "Egresados PUCP",
    tipo: "Mensual",
    costo: "$ 200",
    limiteReservas: "ilimitado",
    fechaInicio: "12 - 04 - 2025",
    fechaFin: "12 - 05 - 2025",
    estado: "Suspendida temporal",
    estadoColor: "bg-yellow-400"
  },
];

// Datos de ejemplo
let mockUsers: UserWithExtra[] = [
  {
    id: "1",
    name: "María López",
    email: "maria.lopez@mail.com",
    role: "user",
    password: "123456",
    isAuthenticated: false,
    permissions: ["read"],
    avatar: "",
    address: "Calle Falsa 123",
    district: "Miraflores",
    phone: "987654321",
    membershipsIds: [1],
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "juan.perez@mail.com",
    role: "user",
    password: "123456",
    isAuthenticated: false,
    permissions: ["read"],
    avatar: "",
    address: "Av. Los Héroes 456",
    district: "San Borja",
    phone: "912345678",
    membershipsIds: [1,2],
  },
  {
    id: "3",
    name: "Lucía Fernández",
    email: "lucia.fernandez@mail.com",
    role: "user",
    password: "123456",
    isAuthenticated: false,
    permissions: ["read"],
    avatar: "",
    address: "Jr. Las Flores 789",
    district: "Surco",
    phone: "934567890",
    membershipsIds: [3],
  },
  {
    id: "4",
    name: "Carlos Ramírez",
    email: "carlos.ramirez@mail.com",
    role: "user",
    password: "123456",
    isAuthenticated: false,
    permissions: ["read"],
    avatar: "",
    address: "Pasaje Sol 321",
    district: "La Molina",
    phone: "900123456",
    membershipsIds: [1],
  },
  {
    id: "5",
    name: "Ana Torres",
    email: "ana.torres@mail.com",
    role: "user",
    password: "123456",
    isAuthenticated: false,
    permissions: ["read"],
    avatar: "",
    address: "Av. Primavera 654",
    district: "San Isidro",
    phone: "955667788",
    membershipsIds: [2],
  },
];

// Función para obtener todos los usuarios
export const getUsers = (): UserWithExtra[] => {
  return [...mockUsers];
};

// Función para generar un nuevo ID
export const generateNewId = (): string => {
  const maxId = Math.max(...mockUsers.map(user => parseInt(user.id)));
  return (maxId + 1).toString();
};

// Función para agregar un nuevo usuario
export const addNewUser = (newUser: Omit<UserWithExtra, 'id'>): UserWithExtra[] => {
  const id = generateNewId();
  const userWithId = { ...newUser, id };
  mockUsers = [...mockUsers, userWithId];
  return [...mockUsers];
};

// Función para actualizar un usuario existente
export const updateUser = (updatedUser: UserWithExtra): UserWithExtra[] => {
  mockUsers = mockUsers.map(user => user.id === updatedUser.id ? updatedUser : user);
  return [...mockUsers];
};

// Función para eliminar un usuario
export const deleteUser = (userId: string): UserWithExtra[] => {
  mockUsers = mockUsers.filter(user => user.id !== userId);
  return [...mockUsers];
};

// Función para eliminar múltiples usuarios
export const deleteUsers = (userIds: string[]): UserWithExtra[] => {
  mockUsers = mockUsers.filter(user => !userIds.includes(user.id));
  return [...mockUsers];
};

// Exportar el array de usuarios
export { mockUsers }; 