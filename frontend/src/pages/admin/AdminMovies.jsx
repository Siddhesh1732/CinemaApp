import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, Search, Star, Film } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllMovies, searchMovies, createMovie, updateMovie, deleteMovie } from '../../api/movieApi'
import { getAllGenres } from '../../api/genreApi'
import { getAllCastMembers, searchCastMembers } from '../../api/castMemberApi'
import Modal from '../../components/Modal'
import Spinner from '../../components/Spinner'
import { toast } from 'react-toastify'

const STATUSES = ['RELEASED', 'UPCOMING', 'IN_PRODUCTION']

const emptyForm = {
  title: '',
  releaseYear: '',
  description: '',
  posterUrl: '',
  trailerUrl: '',
  language: '',
  country: '',
  durationMinutes: '',
  status: 'RELEASED',
  genreIds: [],
  castMemberIds: [],
}

export default function AdminMovies() {
  const [movies, setMovies]           = useState([])
  const [genres, setGenres]           = useState([])
  const [castMembers, setCastMembers] = useState([])
  const [castSearch, setCastSearch]   = useState('')
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [saving, setSaving]           = useState(false)
  const [searchResults, setSearchResults] = useState(null)

  // Fetch paginated movies
  const fetchMovies = async (p = 0) => {
    setLoading(true)
    try {
      const res = await getAllMovies(p, 10, 'id,desc')
      setMovies(res.data.content)
      setTotalPages(res.data.totalPages)
      setPage(p)
    } catch { toast.error('Failed to load movies') }
    finally { setLoading(false) }
  }

  // Fetch genres and cast members for the form dropdowns
  const fetchFormData = async () => {
    try {
      const [genreRes, castRes] = await Promise.all([
        getAllGenres(),
        getAllCastMembers(0, 100)
      ])
      setGenres(genreRes.data)
      setCastMembers(castRes.data.content || [])
    } catch { toast.error('Failed to load form data') }
  }

  useEffect(() => { fetchMovies(); fetchFormData() }, [])

  // Search movies
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) { setSearchResults(null); fetchMovies(0); return }
    setLoading(true)
    try {
      const res = await searchMovies(search.trim())
      setSearchResults(res.data)
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  const clearSearch = () => { setSearch(''); setSearchResults(null); fetchMovies(0) }

  // Search cast members inside modal
  const handleCastSearch = async (e) => {
    const val = e.target.value
    setCastSearch(val)
    if (!val.trim()) {
      const res = await getAllCastMembers(0, 100)
      setCastMembers(res.data.content || [])
      return
    }
    try {
      const res = await searchCastMembers(val)
      setCastMembers(res.data)
    } catch {}
  }

  // Open create modal
  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setCastSearch('')
    setModalOpen(true)
  }

  // Open edit modal — pre-fill with existing data
  const openEdit = (movie) => {
    setEditing(movie)
    setForm({
      title:           movie.title,
      releaseYear:     movie.releaseYear || '',
      description:     movie.description || '',
      posterUrl:       movie.posterUrl || '',
      trailerUrl:      movie.trailerUrl || '',
      language:        movie.language || '',
      country:         movie.country || '',
      durationMinutes: movie.durationMinutes || '',
      status:          movie.status || 'RELEASED',
      genreIds:        [], // We only have names, not IDs from MovieResponse
      castMemberIds:   [], // Same — admin can re-select if needed
    })
    setCastSearch('')
    setModalOpen(true)
  }

  // Toggle genre selection
  const toggleGenre = (id) => {
    setForm(f => ({
      ...f,
      genreIds: f.genreIds.includes(id)
        ? f.genreIds.filter(g => g !== id)
        : [...f.genreIds, id]
    }))
  }

  // Toggle cast member selection
  const toggleCast = (id) => {
    setForm(f => ({
      ...f,
      castMemberIds: f.castMemberIds.includes(id)
        ? f.castMemberIds.filter(c => c !== id)
        : [...f.castMemberIds, id]
    }))
  }

  // Save movie (create or update)
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      releaseYear:     form.releaseYear     ? parseInt(form.releaseYear)     : null,
      durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
    }
    try {
      if (editing) {
        const res = await updateMovie(editing.id, payload)
        setMovies(prev => prev.map(m => m.id === editing.id ? res.data : m))
        if (searchResults) setSearchResults(prev => prev.map(m => m.id === editing.id ? res.data : m))
        toast.success('Movie updated!')
      } else {
        const res = await createMovie(payload)
        setMovies(prev => [res.data, ...prev])
        toast.success('Movie created!')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save movie')
    } finally { setSaving(false) }
  }

  // Delete movie
  const handleDelete = async (id) => {
    if (!confirm('Delete this movie? This cannot be undone.')) return
    try {
      await deleteMovie(id)
      setMovies(prev => prev.filter(m => m.id !== id))
      if (searchResults) setSearchResults(prev => prev.filter(m => m.id !== id))
      toast.success('Movie deleted')
    } catch { toast.error('Failed to delete movie') }
  }

  const displayMovies = searchResults !== null ? searchResults : movies
  const placeholder = (title) => `https://placehold.co/60x90/10101A/F59E0B?text=${encodeURIComponent(title?.[0] || '?')}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="section-title leading-none">MOVIES</h1>
            <p className="text-slate-500 text-sm">Manage the movie database</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Movie
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search movies by title..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-secondary px-5">Search</button>
        {searchResults !== null && (
          <button type="button" onClick={clearSearch} className="btn-secondary px-4">Clear</button>
        )}
      </form>

      {/* Movie list */}
      {loading ? (
        <Spinner text="Loading movies..." />
      ) : displayMovies.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Film size={48} className="mx-auto mb-3 opacity-30" />
          <p>No movies found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {displayMovies.map(movie => (
              <div
                key={movie.id}
                className="flex items-center gap-4 p-4 card hover:border-slate-700 transition-all group"
              >
                {/* Poster thumbnail */}
                <img
                  src={movie.posterUrl || placeholder(movie.title)}
                  alt={movie.title}
                  className="w-10 rounded-lg object-cover flex-shrink-0"
                  style={{ height: '60px' }}
                  onError={e => { e.target.src = placeholder(movie.title) }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 text-sm truncate">{movie.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">{movie.releaseYear}</span>
                    {movie.language && <span className="text-xs text-slate-600">{movie.language}</span>}
                    <span className={`badge text-xs ${
                      movie.status === 'RELEASED'      ? 'badge-green' :
                      movie.status === 'UPCOMING'      ? 'badge-blue'  : 'badge-amber'
                    }`}>{movie.status}</span>
                    {movie.genres?.slice(0, 2).map(g => (
                      <span key={g} className="text-xs text-slate-600">{g}</span>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                {movie.averageRating > 0 && (
                  <div className="hidden sm:flex items-center gap-1 text-amber-400 flex-shrink-0">
                    <Star size={13} className="fill-amber-400" />
                    <span className="text-sm font-medium">{movie.averageRating?.toFixed(1)}</span>
                    <span className="text-xs text-slate-600">({movie.totalRatings})</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(movie)}
                    className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination — only when not in search mode */}
          {searchResults === null && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => fetchMovies(page - 1)}
                disabled={page === 0}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">
                Page <span className="text-amber-400 font-medium">{page + 1}</span> of {totalPages}
              </span>
              <button
                onClick={() => fetchMovies(page + 1)}
                disabled={page >= totalPages - 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit — ${editing.title}` : 'Add New Movie'}
      >
        <form onSubmit={handleSave} className="space-y-5">

          {/* Title + Year row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="Movie title"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Year *</label>
              <input
                type="number"
                value={form.releaseYear}
                onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))}
                required
                placeholder="2024"
                min="1900"
                max="2100"
                className="input-field"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Plot summary..."
              className="input-field resize-none"
            />
          </div>

          {/* Poster + Trailer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Poster URL</label>
              <input
                value={form.posterUrl}
                onChange={e => setForm(f => ({ ...f, posterUrl: e.target.value }))}
                placeholder="https://..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Trailer URL</label>
              <input
                value={form.trailerUrl}
                onChange={e => setForm(f => ({ ...f, trailerUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
                className="input-field"
              />
            </div>
          </div>

          {/* Language + Country + Duration + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Language</label>
              <input
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                placeholder="English"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Country</label>
              <input
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="USA"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Duration (mins)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                placeholder="148"
                min="1"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="input-field cursor-pointer"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Genres multi-select */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Genres
              {form.genreIds.length > 0 && (
                <span className="ml-2 text-amber-400 normal-case">{form.genreIds.length} selected</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-[#08080F] border border-[#1E1E2E] rounded-lg min-h-[48px]">
              {genres.map(g => {
                const selected = form.genreIds.includes(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      selected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {g.name}
                  </button>
                )
              })}
              {genres.length === 0 && (
                <p className="text-xs text-slate-600 italic">No genres available — add genres first</p>
              )}
            </div>
          </div>

          {/* Cast Members multi-select with search */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Cast & Crew
              {form.castMemberIds.length > 0 && (
                <span className="ml-2 text-amber-400 normal-case">{form.castMemberIds.length} selected</span>
              )}
            </label>

            {/* Cast search box */}
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                value={castSearch}
                onChange={handleCastSearch}
                placeholder="Search cast members..."
                className="input-field pl-8 text-xs py-2"
              />
            </div>

            <div className="max-h-40 overflow-y-auto flex flex-col gap-1 p-2 bg-[#08080F] border border-[#1E1E2E] rounded-lg">
              {castMembers.map(c => {
                const selected = form.castMemberIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCast(c.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-left ${
                      selected
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        : 'hover:bg-white/5 text-slate-400 border border-transparent'
                    }`}
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selected ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-slate-600'}`}>
                      {c.primaryRole}
                    </span>
                  </button>
                )
              })}
              {castMembers.length === 0 && (
                <p className="text-xs text-slate-600 italic px-2 py-1">No results found</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-[#1E1E2E]">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editing ? 'Update Movie' : 'Create Movie'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
