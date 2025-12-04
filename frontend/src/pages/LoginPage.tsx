import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiFetch } from '../lib/api'
import { login, TOKEN_KEY } from '../lib/auth'

const schema = z.object({
  email: z.string().email({ message: 'Email invalido' }),
  password: z.string().min(6, { message: 'Minimo 6 caracteres' }),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as { from?: { pathname?: string } } | null) ?? null
  const from = state?.from?.pathname || '/panel/products'
  const [submitError, setSubmitError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setSubmitError('')
    try {
      const res = await apiFetch<{
        token?: string
        user?: { id: number; name?: string; email: string; role: 'ADMIN' | 'SELLER' | 'CUSTOMER' }
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      })

      if (!res.token) {
        throw new Error('Respuesta sin token')
      }

      let finalUser = res.user

      if (!finalUser) {
        localStorage.setItem(TOKEN_KEY, res.token)
        try {
          finalUser = await apiFetch<{ id: number; name?: string; email: string; role: 'ADMIN' | 'SELLER' | 'CUSTOMER' }>(
            '/auth/me',
            { auth: true }
          )
        } catch (meError) {
          localStorage.removeItem(TOKEN_KEY)
          throw meError
        }
      }

      login(res.token, finalUser)
      navigate(from, { replace: true })
    } catch (e) {
      setSubmitError((e as Error)?.message || 'Error de inicio de sesion')
    }
  }

  return (
    <main className="relative min-h-dvh grid place-items-center bg-slate-50 p-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Volver al inicio"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al inicio
      </button>
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">Iniciar sesion</h1>
          <p className="mt-2 text-sm text-slate-600 text-center">Panel de administracion</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="vendedor@tienda.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              {...register('email')}
            />
            {errors.email?.message && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              {...register('password')}
            />
            {errors.password?.message && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {submitError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-white font-medium hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Iniciando sesion...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recuperar')}
            className="w-full text-sm text-indigo-600 hover:underline"
          >
            Olvide mi contraseña
          </button>
        </form>

      </div>
    </main>
  )
}
