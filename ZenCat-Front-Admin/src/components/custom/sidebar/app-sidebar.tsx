import React from 'react';
import { Cog, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { menuItems } from '@/types/navbar-items';
import { User as UserType } from '@/types/user';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import '@/styles/custom/no-scrollbar.css';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserType;
}

export function AppSidebar({ className, user, ...props }: AppSidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const activePath = routerState.location.pathname;
  const { logout } = useAuth();

  return (
    <Sidebar
      collapsible="none"
      className={cn(
        'border-none h-full w-80 bg-black text-white transition-all duration-300 font-montserrat hide-scrollbar',
        className,
      )}
      {...props}
    >
      <SidebarHeader className="flex h-[80px] items-center justify-center border-none bg-black my-5">
        <div className="flex items-center gap-2">
          <img src="/ico-astrozen.svg" alt="astrozen" className="h-16 w-16" />
          <span className="text-3xl font-black tracking-wider transition-opacity duration-300">
            ASTROCAT
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-0 bg-black">
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <button
              key={item.title}
              className={cn(
                'flex h-14 items-center justify-start gap-4 px-6 transition-all duration-200',
                'text-white cursor-pointer py-10',
                activePath.startsWith(item.path)
                  ? 'font-extrabold text-black bg-white hover:bg-gray-200'
                  : 'font-normal text-white bg-black hover:bg-zinc-900',
              )}
              onClick={() => navigate({ to: item.path })}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 min-w-5 transition-transform duration-300',
                  activePath.startsWith(item.path)
                    ? 'text-black scale-150'
                    : 'text-gray-300',
                )}
              />
              <span className="text-xl transition-opacity duration-300 ">
                {item.title}
              </span>
            </button>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-800 bg-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-lg border-2 border-white">
              {user.avatar || user.image_url ? (
                <img
                  src={user.avatar || user.image_url}
                  alt={user.name}
                  className="h-full w-full rounded-lg"
                />
              ) : (
                <UserIcon className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="text-xl font-bold transition-opacity duration-300 ">
              {user.name}
            </span>
          </div>
          <div className="flex items-center gap-2 transition-opacity duration-300 ">
            <button
              onClick={() => navigate({ to: '/admin/configuracion' })}
              className="hover:bg-zinc-800 p-1 rounded transition-colors cursor-pointer"
              title="Configuración"
            >
              <Cog className="h-5 w-5" />
            </button>
            <button
              onClick={() => logout()}
              className="hover:bg-zinc-800 p-1 rounded transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
