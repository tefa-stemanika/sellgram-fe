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
import { registerSchema } from '@/schemas/auth'
import { register } from '@/services/user'
import { setToken } from '@/actions/auth'
import { toast } from 'sonner'

const RegisterLayout = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: 'Konfirmasi password tidak sama'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await register(data.name, data.email, data.password)
      const rawToken = response.data.token
      const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken

      await setToken(token)
      toast.success('Berhasil daftar')
      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal daftar'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell headline="Buat akun baru" description="Mulai kelola produk, order, dan bot Telegram Anda dengan dashboard yang terstruktur.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Nama bisnis / owner" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Ulangi password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthShell>
  )
}

export default RegisterLayout
