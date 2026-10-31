'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreditCard, KeyRound, LayoutDashboard, LogOut, Megaphone, MessageCircle, Moon, Package, Settings, ShoppingCart, Sparkles, Sun, TicketCheck, Users, Variable, Zap } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { removeToken } from '@/actions/auth'
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
  { title: 'Template', href: '/templates', icon: Variable },
  { title: 'Tiket', href: '/tickets', icon: TicketCheck },
  { title: 'Fulfillment', href: '/fulfillment', icon: Zap },
  { title: 'Langganan', href: '/plan', icon: CreditCard },
  { title: 'Bot config', href: '/bot-config', icon: Settings },
  { title: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { title: 'Credentials', href: '/bot-credentials', icon: KeyRound }
]

type HomeLayoutContentProps = HomeLayoutProps

const HomeLayoutContent = ({ children, token }: HomeLayoutContentProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
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
      toast.success('Berhasil keluar')
      router.replace('/login')
      router.refresh()
      setIsLoggingOut(false)
    }
  }

  const navGroups = [
    {
      label: 'Menu utama',
      items: navigation.slice(0, 8)
    },
    {
      label: 'Pengaturan',
      items: navigation.slice(8)
    }
  ]

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-sidebar-accent">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-sidebar-primary">
              <Sparkles className="size-4.5 text-sidebar-primary-foreground" aria-hidden />
            </span>
            <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-small-header text-sidebar-foreground">Sellgram</span>
              <span className="truncate text-caption text-sidebar-foreground/55">Control Center</span>
            </span>
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

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={resolvedTheme === 'dark' ? 'Mode terang' : 'Mode gelap'} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
                <span>{resolvedTheme === 'dark' ? 'Mode terang' : 'Mode gelap'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70 hover:bg-error/10 hover:text-error" tooltip="Keluar" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut />
                <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6 md:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-9 w-9" />
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[0.5rem] bg-sidebar-primary">
              <Sparkles className="size-4 text-sidebar-primary-foreground" aria-hidden />
            </span>
            <p className="text-small-header">Sellgram</p>
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
