'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AuthShell } from '@/components/shared/auth-shell'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { loginSchema } from '@/schemas/auth'
import { setToken } from '@/actions/auth'
import { Checkbox } from '@/components/ui/checkbox'
import { login } from '@/services/user'
import { toast } from 'sonner'

const LoginLayout = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    try {
      const response = await login(data.email, data.password)
      const rawToken = response.data.token
      const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken

      await setToken(token, data.remember)
      toast.success('Login berhasil')
      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal login'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell headline="Masuk ke dashboard" description="Kelola produk, order, dan konfigurasi bot Telegram Anda dari satu tempat.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="owner@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Masukkan password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-sm">Ingat saya</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthShell>
  )
}

export default LoginLayout
