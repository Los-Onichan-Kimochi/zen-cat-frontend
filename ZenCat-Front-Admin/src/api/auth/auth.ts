import { User } from "@/types/user";
import { dummyUsers } from "@/data/dummy-users";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function decodeJwt(token: string): { email: string; name?: string } {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error("Token JWT inválido");
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(payload);
  try {
    return JSON.parse(decoded);
  } catch {
    throw new Error("Payload JWT no es JSON válido");
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    await delay(1000);
    const user = dummyUsers.find(u => u.email === email);
    if (!user) throw new Error("Usuario no encontrado");
    if (password !== user.password) throw new Error("Contraseña incorrecta");
    user.isAuthenticated = true;
    return user;
  },

  async getCurrentUser(): Promise<User | null> {
    return dummyUsers.find(u => u.isAuthenticated) || null;
  },

  async logout(): Promise<void> {
    await delay(500);
    dummyUsers.forEach(u => (u.isAuthenticated = false));
  },

  async getAllUsers(): Promise<User[]> {
    await delay(1000);
    return [...dummyUsers];
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(500);
    return dummyUsers.find(u => u.id === id) || null;
  },

  async loginWithGoogle(token: string): Promise<User> {
    await delay(1000);
    const { email, name } = decodeJwt(token);
    const safeName = name ?? "";
    let user = dummyUsers.find(u => u.email === email);
    if (!user) {
      user = {
        id: String(dummyUsers.length + 1),
        email,
        name: safeName,
        role: "user",
        password: "",
        isAuthenticated: true,
        permissions: ["read"],
        avatar: ""
      };
      dummyUsers.push(user);
    } else {
      user.isAuthenticated = true;
      if (!user.name) user.name = safeName;
    }
    return user;
  }
};
