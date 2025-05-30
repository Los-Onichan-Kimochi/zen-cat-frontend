import { User } from "@/types/user";

export const dummyClients: User[] = [
  {
    id: "101",
    email: "cli1@hotmail.com",
    name: "Kim Chaewon",
    role: "user",
    password: "cli1",
    isAuthenticated: false,
    permissions: ["view_products", "make_orders"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cliente1"
  },
  {
    id: "102",
    email: "cliente2@astrocats.com",
    name: "Cliente Dos",
    role: "user",
    password: "cliente2",
    isAuthenticated: true,
    permissions: ["view_products", "make_orders", "view_order_status"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cliente2"
  },
  {
    id: "103",
    email: "vip@astrocats.com",
    name: "Cliente VIP",
    role: "user",
    password: "vip",
    isAuthenticated: true,
    permissions: ["view_products", "make_orders", "priority_support"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vip"
  },
];
