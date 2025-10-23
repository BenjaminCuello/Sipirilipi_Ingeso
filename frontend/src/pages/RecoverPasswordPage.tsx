import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Recuperar acceso</h1>
          <p className="text-sm text-slate-600">
            Ingresa tu correo registrado. Te enviaremos una clave provisional para que puedas ingresar nuevamente.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Listo. Enviamos una clave provisional a <strong>{email}</strong>. Revisa tu bandeja de entrada y sigue las instrucciones.
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Volver al login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-left">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="tucorreo@empresa.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Enviar clave provisional
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
