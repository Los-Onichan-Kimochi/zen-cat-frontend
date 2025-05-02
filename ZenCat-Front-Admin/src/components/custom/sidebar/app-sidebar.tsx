import React from "react"
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
    Globe,
    Cog,
    User
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("Comunidades")

  const menuItems = [
    { title: "Comunidades", icon: PersonStanding },
    { title: "Servicios", icon: Package },
    { title: "Sesiones", icon: Pencil },
    { title: "Profesionales", icon: Users },
    { title: "Locales", icon: MapPinned },
    { title: "Planes de membresia", icon: Tags },
    { title: "Membresias", icon: Gem },
    { title: "Roles y Permisos", icon: LockOpen },
    { title: "Auditoria", icon: List },
    { title: "Reportes", icon: ChartPie },
    { title: "Log de Errores", icon: TriangleAlert },
  ]

  return (
    <Sidebar
      className={cn("border-none  bg-black text-white transition-all duration-300", className)}
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="flex h-[80px] items-center justify-center border-none bg-black p-4">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-white"></div>
            <div className="absolute inset-[3px] rounded-full bg-black"></div>
            <div className="absolute left-[60%] top-[20%] h-1 w-1 rounded-full bg-white"></div>
          </div>
          <span className="text-xl font-bold tracking-wider transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
            ASTROCAT
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0 bg-black">
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <button
              key={item.title}
              className={cn(
                "flex h-14 items-center gap-4 px-6 transition-all duration-200",
                "text-white  cursor-pointer",
                activeItem === item.title ? "font-bold text-black bg-white hover:bg-gray-200" : "font-normal text-white bg-black hover:bg-zinc-900",
              )}
              onClick={() => setActiveItem(item.title)}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 min-w-5 transition-transform duration-300",
                  activeItem === item.title ? "text-black scale-120" : "text-gray-300",
                )}
              />
              <span className="text-base transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
                {item.title}
              </span>
            </button>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-800 bg-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full border-2 border-white">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
              Litus
            </span>
          </div>
          <div className="flex items-center gap-2 transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
            <Cog className="h-5 w-5" />
            <Globe className="h-5 w-5" />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
