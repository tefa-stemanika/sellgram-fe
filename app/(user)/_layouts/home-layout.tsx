'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreditCard, KeyRound, LayoutDashboard, LogOut, Megaphone, Package, Settings, ShoppingCart, Sparkles, TicketCheck, Users, Zap } from 'lucide-react'
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
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { logout } from '@/services/user'

type HomeLayoutProps = {
  children: React.ReactNode
  token?: string
}

const navigation = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Order', href: '/orders', icon: ShoppingCart },
  { title: 'Produk', href: '/products', icon: Package },
  { title: 'Pelanggan', href: '/customers', icon: Users },
  { title: 'Broadcast', href: '/broadcasts', icon: Megaphone },
  { title: 'Tiket', href: '/tickets', icon: TicketCheck },
  { title: 'Fulfillment', href: '/fulfillment', icon: Zap },
  { title: 'Langganan', href: '/plan', icon: CreditCard },
  { title: 'Bot Config', href: '/bot-config', icon: Settings },
  { title: 'Credentials', href: '/bot-credentials', icon: KeyRound }
]

type HomeLayoutContentProps = HomeLayoutProps

const HomeLayoutContent = ({ children, token }: HomeLayoutContentProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [isMobile, pathname, setOpenMobile])

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

  const navGroups = [
    {
      label: 'Menu Utama',
      items: navigation.slice(0, 5)
    },
    {
      label: 'Pengaturan',
      items: navigation.slice(5)
    }
  ]

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 p-3 transition-all hover:from-primary/90 hover:to-blue-600/90">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-bold text-white">Sellgram</span>
              <span className="truncate text-xs text-white/80">Control Center</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
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
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <Button
            variant="outline"
            className="h-10 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            disabled={isLoggingOut}>
            <LogOut />
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sm:px-6 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9" />
              <p className="text-sm font-semibold">Sellgram</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 min-w-0 flex-col p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </>
  )
}

const HomeLayout = ({ children, token }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <HomeLayoutContent token={token}>{children}</HomeLayoutContent>
    </SidebarProvider>
  )
}

export default HomeLayout
