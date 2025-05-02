import { User } from "@/types/user";
import { dummyUsers } from "@/data/dummy-users";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  // Simulate login
  async login(email: string, password: string): Promise<User> {
    await delay(1000); // Simulate network delay
    
    const user = dummyUsers.find(u => u.email === email);
    if (!user) {
      throw new Error("User not found");
    }
    
    // In a real app, we would verify the password here
    if (password !== "password") {
      throw new Error("Invalid password");
    }
    user.isAuthenticated = true;
    return user;
  },

  // Simulate getting current user
  async getCurrentUser(): Promise<User | null> {
    // In a real app, this would check a token or session
    // For now, we'll just return the first user
    return dummyUsers[0];
  },

  // Simulate logout
  async logout(): Promise<void> {
    await delay(500); // Simulate network delay
    // In a real app, this would clear tokens/session
  },

  // Simulate getting all users (admin only)
  async getAllUsers(): Promise<User[]> {
    await delay(1000); // Simulate network delay
    return dummyUsers;
  },

  // Simulate getting user by ID
  async getUserById(id: string): Promise<User | null> {
    await delay(500); // Simulate network delay
    return dummyUsers.find(user => user.id === id) || null;
  }
}; 