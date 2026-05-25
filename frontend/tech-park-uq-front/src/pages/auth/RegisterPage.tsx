import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTitle } from '../../hooks/useTitle'

const inputClass =
  'rounded-lg border border-white bg-black px-3 py-2 text-white outline-none focus:border-white'

export default function RegisterPage() {
  useTitle('Registro · tech-park-uq')
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [documento, setDocumento] = useState('')
  const [edad, setEdad] = useState('')
  const [estatura, setEstatura] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    const edadNum = Number.parseInt(edad, 10)
    const estaturaNum = Number.parseFloat(estatura)
    if (Number.isNaN(edadNum) || edadNum < 0) {
      setError('Indica una edad válida.')
      return
    }
    if (Number.isNaN(estaturaNum) || estaturaNum < 0) {
      setError('Indica una estatura válida (metros o cm según convención del parque).')
      return
    }

    setSubmitting(true)
    try {
      await registerUser({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        documento: documento.trim(),
        edad: edadNum,
        estatura: estaturaNum,
      })
      navigate('/')
    } catch (err: unknown) {
      console.error('Register error', err)
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const serverMsg = err.response?.data && (err.response?.data as any).message
        if (serverMsg) {
          setError(String(serverMsg))
          return
        }
        if (status === 409) {
          setError('Ese correo ya está registrado.')
          return
        }
        if (status === 400) {
          setError('Revisa los datos (campos obligatorios y contraseña de al menos 8 caracteres).')
          return
        }
      }
      setError('No se pudo completar el registro. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12">
      <h1 className="font-['Ghastly_Panic'] text-5xl tracking-wider text-white">Crear cuenta</h1>
      <p className="mt-2 text-sm text-white">Registro como visitante del parque.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-white">
          Nombre
          <input
            type="text"
            autoComplete="name"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass}
          />
        </label>
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
          Documento
          <input
            type="text"
            autoComplete="off"
            required
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className={inputClass}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-white">
            Edad
            <input
              type="number"
              min={0}
              required
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white">
            Estatura
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={estatura}
              onChange={(e) => setEstatura(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm text-white">
          Contraseña
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white">
          Confirmar contraseña
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
        >
          {submitting ? 'Creando cuenta…' : 'Registrarse'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white">
        ¿Ya tienes cuenta?{' '}
        <Link to="/auth/login" className="text-white underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
