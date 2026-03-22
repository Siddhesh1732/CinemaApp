import { Link } from 'react-router-dom'
import { Film, Tag, Users, ChevronRight, Shield } from 'lucide-react'

const PANELS = [
  { to: '/admin/movies', icon: Film, label: 'Movies', desc: 'Add, edit and delete movies in the database' },
  { to: '/admin/genres', icon: Tag, label: 'Genres', desc: 'Manage genre categories for movies' },
  { to: '/admin/cast-members', icon: Users, label: 'Cast Members', desc: 'Add and manage actors, directors and crew' },
]

export default function AdminPanel() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="section-title leading-none">ADMIN PANEL</h1>
          <p className="text-slate-500 text-sm">Manage application content</p>
        </div>
      </div>

      <div className="grid gap-4">
        {PANELS.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-5 p-5 card hover:border-amber-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
              <Icon size={22} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-200 mb-0.5">{label}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
            <ChevronRight size={18} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}
