'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Mock auth — real JWT verification lands in Task #4.
const ADMIN_TOKEN_COOKIE = 'admin-token'
const ONE_DAY_SECONDS = 60 * 60 * 24

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(32, 'Username maksimal 32 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  function onSubmit(_values: LoginValues) { // eslint-disable-line @typescript-eslint/no-unused-vars
    setSubmitting(true)
    // Mock: any username/pass matching schema is accepted for now.
    // Task #4 replaces this with server-side verify + HttpOnly cookie.
    document.cookie = `${ADMIN_TOKEN_COOKIE}=mock-admin-token; path=/; max-age=${ONE_DAY_SECONDS}; SameSite=Lax`
    toast.success('Login berhasil', {
      description: 'Mengarahkan ke dashboard…',
    })
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 400)
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Adnanpay Admin
          </p>
        </div>

        <Card className="border-border/60 shadow-lg shadow-black/[0.03] backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">
              Masuk Dashboard
            </CardTitle>
            <CardDescription>
              Gunakan kredensial admin untuk mengakses panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            autoComplete="username"
                            placeholder="admin"
                            className="pl-9"
                          />
                        </div>
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
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••"
                            className="pl-9"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Memproses…' : 'Masuk'}
                  {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo build · kredensial apa pun yang valid secara skema diterima.
        </p>
      </div>
    </div>
  )
}
