import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/custom/sidebar/app-sidebar"
import { User } from "@/types/user"

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <SidebarProvider className=" h-100">
      <AppSidebar user={user} />
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}
