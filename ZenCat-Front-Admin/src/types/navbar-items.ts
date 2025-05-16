import {
    PersonStanding,
    Package,
    Users,
    Pencil,
    MapPinned,
    Tags,
    Gem,
    LockOpen,
    List,
    TriangleAlert,
    ChartPie,
} from "lucide-react"

// Function to generate slug from title
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^a-z0-9-]/g, '') // Remove non-ASCII chars, adjust if needed for accents
    .replace(/[?]/g, '') // Remove specific chars like ?
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[/\\:]/g, '-') // Replace / \ :
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const menuItems = [
    { title: "Comunidades", icon: PersonStanding, path: "/comunidades" },
    { title: "Servicios", icon: Package, path: "/servicios" },
    { title: "Sesiones", icon: Pencil, path: "/sesiones" },
    { title: "Profesionales", icon: Users, path: "/profesionales" },
    { title: "Locales", icon: MapPinned, path: "/locales" },
    { title: "Planes de membresia", icon: Tags, path: "/planes-membresia" },
    { title: "Usuarios", icon: Gem, path: "/usuarios" },
    { title: "Roles y Permisos", icon: LockOpen, path: "/roles-permisos" },
    { title: "Auditoria", icon: List, path: "/auditoria" },
    { title: "Reportes", icon: ChartPie, path: "/reportes" },
    { title: "Log de Errores", icon: TriangleAlert, path: "/log-errores" },
  ].map(item => ({ ...item, path: item.path || `/${slugify(item.title)}` })); // Add calculated path if missing