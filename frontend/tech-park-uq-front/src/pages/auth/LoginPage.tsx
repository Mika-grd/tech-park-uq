import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTitle } from '../../hooks/useTitle'

const inputClass =
  'rounded-lg border border-white bg-black px-3 py-2 text-white outline-none focus:border-white'

export default function LoginPage() {
  useTitle('Iniciar sesión · tech-park-uq')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch {
      setError('Credenciales incorrectas o cuenta inactiva.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12">
      <h1 className="font-['Ghastly_Panic'] text-5xl tracking-wider text-white">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-white">Correo y contraseña de tu cuenta.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-white">
          Correo
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white">
        ¿No tienes cuenta?{' '}
        <Link to="/auth/register" className="text-white underline-offset-4 hover:underline">
          Registrarse
        </Link>
      </p>
    </div>
  )
}
