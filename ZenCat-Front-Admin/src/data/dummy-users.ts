import { User } from "@/types/user";

export const dummyUsers: User[] = [

  {
    id: "2",
    email: "moderator@astrocats.com",
    name: "Moderator Cat",
    role: "user",
    password: "moderator",
    isAuthenticated: false,
    permissions: ["read", "write", "moderate"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator"
  },
  {
    id: "3",
    email: "user@astrocats.com",
    name: "Regular Cat",
    role: "user",
    password: "user",
    isAuthenticated: false,
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
    isAuthenticated: false,
    permissions: ["read", "write", "delete", "manage_users", "manage_system"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=developer"
  },
  {
    id: "6",
    email: "fabipra19@gmail.com",
    name: "Fabian",
    role: "user",
    password: "fabian",
    isAuthenticated: false,
    permissions: ["read", "write"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fabipra19"
  }
];
