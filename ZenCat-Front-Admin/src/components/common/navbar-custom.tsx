import '../../styles/shadcn/sidebarCustom.css';
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
  ChartPie
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// Menu items.
const items = [
  {
    title: 'Comunidades',
    url: '#',
    icon: PersonStanding,
  },
  {
    title: 'Servicios',
    url: '#',
    icon: Package,
  },
  {
    title: 'Sesiones',
    url: '#',
    icon: Pencil,
  },
  {
    title: 'Profesionales',
    url: '#',
    icon: Users,
  },
  {
    title: 'Locales',
    url: '#',
    icon: MapPinned,
  },
  {
    title: 'Planes de Membresía',
    url: '#',
    icon: Tags,
  },
  {
    title: 'Membresías',
    url: '#',
    icon: Gem,
  },
  {
    title: 'Roles y Permisos',
    url: '#',
    icon: LockOpen,
  },
  {
    title: 'Auditoría',
    url: '#',
    icon: List,
  },
  {
    title: 'Reportes',
    url: '#',
    icon: ChartPie,
  },
  {
    title: 'Log de Errores',
    url: '#',
    icon: TriangleAlert,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
