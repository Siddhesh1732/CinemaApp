import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Film, Users, Search, User, LogOut, Shield, Compass } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [time, setTime]         = useState(new Date())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  const navItems = [
    { to: '/home',    label: 'EXPLORE', Icon: Compass },
    { to: '/friends', label: 'NETWORK', Icon: Users   },
    { to: '/search',  label: 'SEARCH',  Icon: Search  },
    ...(isAdmin() ? [{ to: '/admin', label: 'ADMIN', Icon: Shield }] : []),
  ]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 md:px-10"
      style={{
        background: scrolled ? 'rgba(5,5,8,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(30px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(6,182,212,0.1)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-3 mr-10 group">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
        >
          <Film size={17} className="text-white" />
        </motion.div>
        <span className="font-display text-lg font-bold tracking-widest text-white group-hover:text-cyan-400 transition-colors duration-300">
          CINEMA-PAGLU
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        {navItems.map(({ to, label, Icon }) => (
          <Link key={to} to={to}>
            <motion.div
              whileHover={{ y: -1 }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-widest transition-all duration-300 ${
                isActive(to) ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={13} />
              {label}
              {isActive(to) && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Right — time + user */}
      <div className="flex items-center gap-4 ml-auto">
        {/* HUD Clock */}
        <div className="hidden md:block text-right">
          <div className="font-mono text-xs text-slate-600 tracking-widest">
            {user?.username?.toUpperCase()}
          </div>
        </div>

        {/* Profile */}
        <Link to="/profile">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(6,182,212,0.3)',
              boxShadow: '0 0 15px rgba(6,182,212,0.2)',
            }}
          >
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.username}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span
              className="text-xs font-bold text-cyan-400 font-mono"
              style={{ display: user?.profilePictureUrl ? 'none' : 'flex' }}
            >
              {user?.username?.charAt(0).toUpperCase() ?? <User size={15} className="text-cyan-400" />}
            </span>
          </motion.div>
        </Link>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-600 hover:text-rose-400 transition-colors duration-300 p-2"
        >
          <LogOut size={15} />
        </motion.button>
      </div>
    </motion.nav>
  )
}
