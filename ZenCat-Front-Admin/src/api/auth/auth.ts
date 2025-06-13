// Legacy auth API - kept for backward compatibility
// New auth system is in auth-service.ts

import { User } from '@/types/user';
import { dummyUsers } from '@/data/dummy-users';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  // Simulate login - DEPRECATED: Use authService.login instead
  async login(email: string, password: string): Promise<User> {
    await delay(1000);

    const user = dummyUsers.find((u) => u.email === email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (password !== user.password) {
      throw new Error('Contraseña incorrecta');
    }
    user.isAuthenticated = true;
    return user;
  },

  async getCurrentUser(): Promise<User | null> {
    return dummyUsers[0];
  },

  // Simulate logout - DEPRECATED: Use authService.logout instead
  async logout(): Promise<void> {
    await delay(500);
  },

  async getAllUsers(): Promise<User[]> {
    await delay(1000);
    return dummyUsers;
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(500);
    return dummyUsers.find((user) => user.id === id) || null;
  },
};
