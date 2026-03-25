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
    <div className="flex items-center justify-center h-screen w-full">
      <div className="max-w-lg w-full bg-background rounded-lg p-8 drop-shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-8">
          Welcome to <br /> the app
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="shadcn" {...field} />
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
                    <Input type="password" placeholder="shadcn" {...field} />
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
                    <FormLabel className="cursor-pointer">Remember me</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default LoginLayout
