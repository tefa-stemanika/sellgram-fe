'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { KeyRound, LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { removeToken } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator
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
      <Sidebar className="border-r border-sidebar-border/70">
        <SidebarHeader>
          <div className="rounded-xl border border-sidebar-border/80 bg-sidebar-accent/60 p-3">
            <div className="flex items-center gap-2 text-sidebar-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Order Bot</p>
                <p className="text-xs text-sidebar-foreground/70">Control Center</p>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.15em] text-sidebar-foreground/60">
              Main Navigation
            </SidebarGroupLabel>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-10 rounded-lg transition-all data-[active=true]:shadow-sm data-[active=true]:ring-1 data-[active=true]:ring-sidebar-primary/30">
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
        <SidebarSeparator />
        <SidebarFooter>
          <Button
            variant="outline"
            className="h-10 w-full justify-start border-sidebar-border/80 bg-sidebar-accent/30"
            onClick={handleLogout}
            disabled={isLoggingOut}>
            <LogOut />
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="min-h-svh p-4 sm:p-6">
          <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur sm:p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default HomeLayout
