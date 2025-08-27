import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from './useAuth'
import { useAuthContext } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from '@/shared/components/Snackbar'
import logoSrc from '@/assets/images/logo.png'

const AppLogo = () => (
  <div className="w-20 h-20 rounded-full overflow-hidden">
    <img
      src={logoSrc}
      alt="Logo Perusahaan"
      className="w-full h-full object-cover"
    />
  </div>
)

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth()
  const { user } = useAuthContext()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      showSnackbar('error', 'Email dan password tidak boleh kosong!')
      return
    }

    const success = await login(email, password)
    if (success) {
      showSnackbar('success', 'Login berhasil, selamat datang kembali! 👋')
      navigate('/')
    } else {
      showSnackbar(
        'error',
        'Login gagal, periksa kembali email & password Anda ⚠️',
      )
    }
  }

  return (
    <div className="flex min-h-screen w-screen bg-white">
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-brand/80 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col items-center text-center text-white px-10">
          <h1 className="text-5xl font-extrabold tracking-tight !leading-tight">
            Satu Langkah Lagi, Admin!
          </h1>
          <p className="mt-4 text-xl font-light max-w-lg">
            Mari mulai hari yang produktif.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <AppLogo />
          </div>

          <div className="p-8 bg-white shadow-2xl rounded-2xl border border-gray-100">
            <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
              Selamat Datang
            </h2>
            <p className="mb-8 text-center text-gray-500">
              Masuk untuk melanjutkan
            </p>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 shadow-sm transition duration-150 ease-in-out"
                    placeholder="nama@mail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 shadow-sm transition duration-150 ease-in-out"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-brand"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-brand py-3 px-4 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-accent hover:text-brand focus:outline-none disabled:bg-brand/50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Hubungi admin utama jika ada kendala masuk
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
