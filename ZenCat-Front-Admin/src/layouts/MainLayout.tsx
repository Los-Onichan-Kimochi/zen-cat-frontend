import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/custom/sidebar/app-sidebar"
import { User } from "@/types/user"

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <SidebarProvider className="flex h-screen w-full">
      <AppSidebar user={user}/>
      <main className="flex-grow p-6 overflow-auto">
        {children}
      </main>
    </SidebarProvider>
  )
}
