import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { api, auth } from '../services/api'

const schema = yup.object({
  email: yup.string().email('Enter a valid email.').required('Email is required.'),
  password: yup.string().required('Password is required.'),
})

function AdminLogin() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    try {
      const response = await api.adminLogin(data)
      auth.setSession(response)
      setMessage('Admin logged in successfully.')
      navigate('/admin')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="bg-sand">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Admin</p>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Admin Login</h1>
          <p className="mt-4 text-lg text-muted">Access the product dashboard and uploads.</p>
        </div>
      </header>

      <section className="bg-sand px-6 py-16">
        <div className="mx-auto w-full max-w-4xl">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-slate-200/80 bg-clay/70 p-8 shadow-sm"
          >
            <div className="grid gap-5">
              <div>
                <label className="text-sm font-semibold text-ink">Email</label>
                <input
                  {...register('email')}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                  placeholder="admin@email.com"
                />
                {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
              <button type="submit" className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white">
                Login
              </button>
              {message && <p className="text-sm font-semibold text-emberDark">{message}</p>}
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default AdminLogin
