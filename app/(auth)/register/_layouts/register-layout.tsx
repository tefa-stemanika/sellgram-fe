'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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
      toast.success('Register berhasil')
      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal register'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl p-6 sm:p-8">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Order Bot Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Akun Baru</h1>
          <p className="text-sm text-muted-foreground">Mulai kelola bisnis Anda dengan dashboard yang lebih terstruktur.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama bisnis / owner"
                      {...field}
                      className="h-10 bg-white/20 backdrop-blur-xl border border-white/20"
                    />
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
                    <Input
                      type="email"
                      placeholder="owner@example.com"
                      {...field}
                      className="h-10 bg-white/20 backdrop-blur-xl border border-white/20"
                    />
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
                    <Input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      {...field}
                      className="h-10 bg-white/20 backdrop-blur-xl border border-white/20"
                    />
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Ulangi password"
                      {...field}
                      className="h-10 bg-white/20 backdrop-blur-xl border border-white/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Daftar'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default RegisterLayout
