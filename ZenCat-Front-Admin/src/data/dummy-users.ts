import { User } from "@/types/user";

export const dummyUsers: User[] = [
  {
    id: "1",
    email: "admin@astrocats.com",
    name: "Litusuwu",
    role: "admin",
    password: "admin",
    isAuthenticated: false,
    permissions: ["read", "write", "delete", "manage_users"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "2",
    email: "moderator@astrocats.com",
    name: "Moderator Cat",
    role: "user",
    password: "moderator",
    isAuthenticated: true,
    permissions: ["read", "write", "moderate"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator"
  },
  {
    id: "3",
    email: "user@astrocats.com",
    name: "Regular Cat",
    role: "user",
    password: "user",
    isAuthenticated: true,
    permissions: ["read", "write"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
  },
  {
    id: "4",
    email: "guest@astrocats.com",
    name: "Guest Cat",
    role: "guest",
    password: "guest",
    isAuthenticated: false,
    permissions: ["read"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"
  },
  {
    id: "5",
    email: "developer@astrocats.com",
    name: "Developer Cat",
    role: "admin",
    password: "developer",
    isAuthenticated: true,
    permissions: ["read", "write", "delete", "manage_users", "manage_system"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=developer"
  },
]; 