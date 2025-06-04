import { User } from "@/types/user";
import { dummyClients } from "@/data/dummy-clients";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  // Simulate login
  async login(email: string, password: string): Promise<User> {
    await delay(1000);
    
    const user = dummyClients.find(u => u.email === email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    if (password !== user.password) {
      throw new Error("Contraseña incorrecta");
    }
    user.isAuthenticated = true;
    return user;
  },

  async getCurrentUser(): Promise<User | null> {
    return dummyClients[0];
  },

  // Simulate logout
  async logout(): Promise<void> {
    await delay(500);
  },

  async getAllUsers(): Promise<User[]> {
    await delay(1000);
    return dummyClients;
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(500);
    return dummyClients.find(user => user.id === id) || null;
  }
}; 