import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { login as loginApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

function AuthLayout({ children, headline, sub }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--void)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
           style={{ background: 'rgba(11,15,26,0.5)', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 spotlight" />

        {/* Animated orbs */}
        {[
          { top: '20%', left: '30%', color: 'rgba(6,182,212,0.15)', size: 300, delay: 0 },
          { top: '60%', left: '60%', color: 'rgba(139,92,246,0.1)', size: 200, delay: 2 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: orb.delay }}
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size, background: orb.color, transform: 'translate(-50%,-50%)' }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative text-center"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.3)', '0 0 60px rgba(6,182,212,0.6)', '0 0 20px rgba(6,182,212,0.3)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(6,182,212,0.3)' }}
          >
            <Film size={40} className="text-cyan-400" />
          </motion.div>
          <h2 className="font-display text-4xl tracking-widest text-white mb-2">CINEMA-PAGLU</h2>
          <p className="font-mono text-xs text-slate-500 tracking-widest">YOUR MOVIE UNIVERSE</p>

          {/* HUD decorations */}
          <div className="mt-8 flex flex-col gap-1 items-center opacity-30">
            {['EXPLORING', '10,000+ FILMS', 'SOCIAL DISCOVERY'].map(txt => (
              <div key={txt} className="font-mono text-xs text-cyan-400 tracking-widest">{txt}</div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="font-display text-2xl tracking-widest text-white mb-1">{headline}</h1>
            <p className="text-slate-600 text-sm font-mono">{sub}</p>
            <div className="hud-line mt-4" />
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]               = useState({ email: '', password: '' })
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginApi(form)
      login(res.data.token, { username: res.data.username, email: res.data.email, role: res.data.role, profilePictureUrl: res.data.profilePictureUrl })
      toast.success(`Welcome back, ${res.data.username}`)
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout headline="SIGN IN" sub="// access your universe">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">EMAIL</label>
          <div className="relative">
            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input name="email" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com" required className="input-field pl-10" />
          </div>
        </div>
        <div>
          <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">PASSWORD</label>
          <div className="relative">
            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" required className="input-field pl-10 pr-10" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(6,182,212,0.5)' }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-3.5 mt-2 text-sm tracking-widest disabled:opacity-40">
          {loading ? 'AUTHENTICATING...' : 'ENTER'}
        </motion.button>
      </form>
      <p className="text-center text-sm text-slate-600 mt-6 font-mono">
        NEW USER?{' '}
        <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">REGISTER</Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]         = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { register } = await import('../api/authApi')
      const res = await register(form)
      login(res.data.token, { username: res.data.username, email: res.data.email, role: res.data.role })
      toast.success(`Welcome to CINEX, ${res.data.username}!`)
      navigate('/home')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout headline="REGISTER" sub="// initialize your universe">
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'USERNAME', name: 'username', type: 'text', placeholder: 'cooluser42', Icon: null },
          { label: 'EMAIL',    name: 'email',    type: 'email', placeholder: 'you@example.com', Icon: Mail },
        ].map(({ label, name, type, placeholder, Icon }) => (
          <div key={name}>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">{label}</label>
            <div className="relative">
              {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />}
              <input name={name} type={type} value={form[name]}
                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                placeholder={placeholder} required
                className={`input-field ${Icon ? 'pl-10' : 'pl-4'}`} />
            </div>
          </div>
        ))}
        <div>
          <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">PASSWORD</label>
          <div className="relative">
            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 6 characters" required minLength={6} className="input-field pl-10 pr-10" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(6,182,212,0.5)' }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-3.5 mt-2 text-sm tracking-widest disabled:opacity-40">
          {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
        </motion.button>
      </form>
      <p className="text-center text-sm text-slate-600 mt-6 font-mono">
        HAVE ACCOUNT?{' '}
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">SIGN IN</Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
