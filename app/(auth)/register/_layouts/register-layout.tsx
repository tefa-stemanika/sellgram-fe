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
    <div className="flex items-center justify-center h-screen w-full">
      <div className="max-w-lg w-full bg-background rounded-lg p-8 drop-shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-8">
          Welcome to <br /> the app
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="shadcn" {...field} />
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
