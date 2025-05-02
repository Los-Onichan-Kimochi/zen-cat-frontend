import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/custom/sidebar/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className=" h-100">
      <AppSidebar/>
      <main>
        {children}
      </main>
    </SidebarProvider>
  )
}
