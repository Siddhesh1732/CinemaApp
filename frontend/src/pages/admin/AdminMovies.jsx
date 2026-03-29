import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronLeft, Search, Film, Star, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllMovies, searchMovies, createMovie, updateMovie, deleteMovie } from '../../api/movieApi'
import { getAllGenres } from '../../api/genreApi'
import { getAllCastMembers, searchCastMembers } from '../../api/castMemberApi'
import { BlurModal, Spinner, GradientButton } from '../../components/UI'
import { toast } from 'react-toastify'

const STATUSES = ['RELEASED', 'UPCOMING', 'IN_PRODUCTION']
const emptyForm = {
  title: '', releaseYear: '', description: '', posterUrl: '', trailerUrl: '',
  language: '', country: '', durationMinutes: '', status: 'RELEASED',
  genreIds: [], castMemberIds: [],
}

export default function AdminMovies() {
  const [movies, setMovies]       = useState([])
  const [genres, setGenres]       = useState([])
  const [cast, setCast]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModal]     = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [castSearch, setCastSearch] = useState('')

  const fetchMovies = async (p = 0) => {
    setLoading(true)
    try {
      const r = await getAllMovies(p, 10, 'id,desc')
      setMovies(r.data.content); setTotalPages(r.data.totalPages); setPage(p)
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }
  const fetchFormData = async () => {
    try {
      const [gr, cr] = await Promise.all([getAllGenres(), getAllCastMembers(0, 100)])
      setGenres(gr.data); setCast(cr.data.content || [])
    } catch {}
  }
  useEffect(() => { fetchMovies(); fetchFormData() }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) { setSearchResults(null); fetchMovies(0); return }
    setLoading(true)
    try { const r = await searchMovies(search.trim()); setSearchResults(r.data) }
    catch { toast.error('Search failed') } finally { setLoading(false) }
  }

  const handleCastSearch = async (e) => {
    const v = e.target.value; setCastSearch(v)
    if (!v.trim()) { const r = await getAllCastMembers(0, 100); setCast(r.data.content || []); return }
    try { const r = await searchCastMembers(v); setCast(r.data) } catch {}
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setCastSearch(''); setModal(true) }
  const openEdit   = (m) => {
    setEditing(m)
    setForm({
      title: m.title, releaseYear: m.releaseYear || '', description: m.description || '',
      posterUrl: m.posterUrl || '', trailerUrl: m.trailerUrl || '', language: m.language || '',
      country: m.country || '', durationMinutes: m.durationMinutes || '', status: m.status || 'RELEASED',
      genreIds: [], castMemberIds: [],
    })
    setCastSearch(''); setModal(true)
  }

  const toggleGenre = (id) => setForm(f => ({
    ...f, genreIds: f.genreIds.includes(id) ? f.genreIds.filter(g => g !== id) : [...f.genreIds, id]
  }))
  const toggleCast = (id) => setForm(f => ({
    ...f, castMemberIds: f.castMemberIds.includes(id) ? f.castMemberIds.filter(c => c !== id) : [...f.castMemberIds, id]
  }))

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = {
      ...form,
      releaseYear:     form.releaseYear     ? parseInt(form.releaseYear)     : null,
      durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
    }
    try {
      if (editing) {
        const r = await updateMovie(editing.id, payload)
        setMovies(prev => prev.map(m => m.id === editing.id ? r.data : m))
        if (searchResults) setSearchResults(prev => prev.map(m => m.id === editing.id ? r.data : m))
        toast.success('Movie updated!')
      } else {
        const r = await createMovie(payload)
        setMovies(prev => [r.data, ...prev])
        toast.success('Movie created!')
      }
      setModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this movie?')) return
    try {
      await deleteMovie(id)
      setMovies(prev => prev.filter(m => m.id !== id))
      if (searchResults) setSearchResults(prev => prev.filter(m => m.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const display = searchResults !== null ? searchResults : movies
  const placeholder = (t) => `https://placehold.co/60x90/0B0F1A/06B6D4?text=${encodeURIComponent(t?.[0] || '?')}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="fixed inset-0 grid-bg opacity-15 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <motion.div whileHover={{ x: -3 }} className="p-2 rounded-xl text-slate-600 hover:text-cyan-400 transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <ChevronLeft size={16} />
            </motion.div>
          </Link>
          <div>
            <h1 className="font-display text-xl tracking-widest text-white">MOVIES</h1>
            <p className="font-mono text-xs text-slate-600 mt-0.5">MANAGE FILM DATABASE</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
          whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs tracking-widest">
          <Plus size={14} /> ADD MOVIE
        </motion.button>
      </motion.div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH MOVIES..." className="input-field pl-11 font-mono text-sm tracking-wide" />
        </div>
        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-ghost text-xs font-mono tracking-widest px-5">SEARCH</motion.button>
        {searchResults !== null && (
          <motion.button type="button" whileHover={{ scale: 1.02 }}
            onClick={() => { setSearch(''); setSearchResults(null); fetchMovies(0) }}
            className="btn-ghost text-xs font-mono px-4">CLEAR</motion.button>
        )}
      </form>

      {/* List */}
      {loading ? <Spinner text="LOADING" /> : display.length === 0 ? (
        <div className="text-center py-20 text-slate-800">
          <Film size={48} className="mx-auto mb-3 opacity-15" />
          <p className="font-display tracking-widest text-sm">NO MOVIES FOUND</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {display.map((movie, i) => (
              <motion.div key={movie.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}
              >
                <img src={movie.posterUrl || placeholder(movie.title)} alt={movie.title}
                     className="w-10 rounded-lg object-cover flex-shrink-0"
                     style={{ height: '60px' }}
                     onError={e => { e.target.src = placeholder(movie.title) }} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-slate-300 truncate">{movie.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-xs text-slate-600">{movie.releaseYear}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      movie.status === 'RELEASED' ? 'badge-green' : movie.status === 'UPCOMING' ? 'badge-cyan' : 'badge-amber'
                    }`}>{movie.status}</span>
                    {movie.genres?.slice(0,2).map(g => (
                      <span key={g} className="text-xs text-slate-700 font-mono">{g}</span>
                    ))}
                  </div>
                </div>
                {movie.averageRating > 0 && (
                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-mono text-xs text-amber-400">{movie.averageRating?.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEdit(movie)}
                    className="p-2 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors"
                    style={{ background: 'rgba(6,182,212,0.08)' }}>
                    <Pencil size={13} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(movie.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                    style={{ background: 'rgba(244,63,94,0.08)' }}>
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {searchResults === null && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => fetchMovies(page - 1)} disabled={page === 0}
                className="btn-ghost text-xs font-mono tracking-widest flex items-center gap-1.5 disabled:opacity-30">
                <ChevronLeft size={13} /> PREV
              </motion.button>
              <span className="font-mono text-xs text-slate-600">
                <span className="text-cyan-400">{page + 1}</span> / {totalPages}
              </span>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => fetchMovies(page + 1)} disabled={page >= totalPages - 1}
                className="btn-ghost text-xs font-mono tracking-widest flex items-center gap-1.5 disabled:opacity-30">
                NEXT <ChevronRight size={13} />
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <BlurModal isOpen={modalOpen} onClose={() => setModal(false)}
        title={editing ? `EDIT — ${editing.title?.toUpperCase()}` : 'ADD NEW MOVIE'} wide>
        <form onSubmit={handleSave} className="space-y-5">
          {/* Title + Year */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">TITLE *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required placeholder="Movie title" className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">YEAR *</label>
              <input type="number" value={form.releaseYear} onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))}
                required placeholder="2024" min="1900" max="2100" className="input-field" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">SYNOPSIS</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Plot summary..." className="input-field resize-none text-sm font-light" />
          </div>

          {/* Poster + Trailer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">POSTER URL</label>
              <input value={form.posterUrl} onChange={e => setForm(f => ({ ...f, posterUrl: e.target.value }))}
                placeholder="https://..." className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">TRAILER URL</label>
              <input value={form.trailerUrl} onChange={e => setForm(f => ({ ...f, trailerUrl: e.target.value }))}
                placeholder="https://youtube.com/..." className="input-field" />
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'LANGUAGE', key: 'language', placeholder: 'English' },
              { label: 'COUNTRY',  key: 'country',  placeholder: 'USA' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder} className="input-field" />
              </div>
            ))}
            <div>
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">DURATION (MIN)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                placeholder="148" min="1" className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">STATUS</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="input-field cursor-pointer font-mono text-sm">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">
              GENRES
              {form.genreIds.length > 0 && <span className="ml-2 text-cyan-400">{form.genreIds.length} SELECTED</span>}
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[48px]"
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {genres.map(g => {
                const sel = form.genreIds.includes(g.id)
                return (
                  <motion.button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="text-xs px-3 py-1.5 rounded-full font-mono transition-all duration-200"
                    style={sel
                      ? { background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.5)', color: '#06B6D4' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }
                    }>
                    {g.name}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Cast */}
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">
              CAST & CREW
              {form.castMemberIds.length > 0 && <span className="ml-2 text-cyan-400">{form.castMemberIds.length} SELECTED</span>}
            </label>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700" />
              <input value={castSearch} onChange={handleCastSearch}
                placeholder="SEARCH CAST..." className="input-field pl-9 text-xs font-mono py-2" />
            </div>
            <div className="max-h-44 overflow-y-auto rounded-xl no-scrollbar"
                 style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {cast.map(c => {
                const sel = form.castMemberIds.includes(c.id)
                return (
                  <motion.button key={c.id} type="button" onClick={() => toggleCast(c.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all duration-200 text-left"
                    style={sel
                      ? { background: 'rgba(6,182,212,0.1)', borderBottom: '1px solid rgba(6,182,212,0.1)' }
                      : { borderBottom: '1px solid rgba(255,255,255,0.03)' }
                    }
                    whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <span className={`font-mono ${sel ? 'text-cyan-400' : 'text-slate-500'}`}>{c.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${sel ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-slate-700'}`}>
                      {c.primaryRole}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <GradientButton type="submit" disabled={saving} className="flex-1 text-xs tracking-widest py-3.5">
              {saving ? 'SAVING...' : editing ? 'UPDATE MOVIE' : 'CREATE MOVIE'}
            </GradientButton>
            <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => setModal(false)}
              className="btn-ghost px-6 text-xs tracking-widest">CANCEL</motion.button>
          </div>
        </form>
      </BlurModal>
    </div>
  )
}
