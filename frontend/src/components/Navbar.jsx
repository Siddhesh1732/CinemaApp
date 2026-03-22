import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Film, Users, Search, User, LogOut, Shield, Home } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'text-amber-400 bg-amber-500/10'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#08080F]/95 backdrop-blur-md border-b border-[#1E1E2E]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center group-hover:bg-amber-400 transition-colors">
            <Film size={16} className="text-black" />
          </div>
          <span className="font-display text-xl text-slate-100 tracking-widest">CINEMA PREMI</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLink('/home', 'Explore', Home)}
          {navLink('/friends', 'Friends', Users)}
          {navLink('/search', 'Search Users', Search)}
          {isAdmin() && navLink('/admin', 'Admin', Shield)}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-slate-500 font-medium">
            {user?.username}
          </span>
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center hover:border-amber-500 transition-all"
          >
            <User size={15} className="text-amber-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors text-sm px-2 py-2 rounded-lg hover:bg-red-500/10"
          >
            <LogOut size={15} />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
