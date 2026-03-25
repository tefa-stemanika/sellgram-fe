'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { KeyRound, LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

import { removeToken } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import { logout } from '@/services/user'

type HomeLayoutProps = {
  children: React.ReactNode
  token?: string
}

const navigation = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Produk', href: '/products', icon: Package },
  { title: 'Bot Config', href: '/bot-config', icon: Settings },
  { title: 'Credentials', href: '/bot-credentials', icon: KeyRound },
  { title: 'Order', href: '/orders', icon: ShoppingCart }
]

const HomeLayout = ({ children, token }: HomeLayoutProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      if (token) {
        await logout(token)
      }
    } catch {
      // Keep logout flow resilient even if backend request fails.
    } finally {
      await removeToken()
      toast.success('Berhasil logout')
      router.replace('/login')
      router.refresh()
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Order Bot Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut />
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default HomeLayout
