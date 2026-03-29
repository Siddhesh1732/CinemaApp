import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Compass, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllMovies, searchMovies } from '../api/movieApi'
import { getAllGenres } from '../api/genreApi'
import { getRecommendations } from '../api/recommendationApi'
import MovieCard from '../components/MovieCard'
import HorizontalScroller from '../components/HorizontalScroller'
import { Spinner } from '../components/UI'
import { toast } from 'react-toastify'

export default function HomePage() {
  const [movies, setMovies]               = useState([])
  const [genres, setGenres]               = useState([])
  const [recs, setRecs]                   = useState([])
  const [recsLoading, setRecsLoading]     = useState(true)
  const [loading, setLoading]             = useState(true)
  const [query, setQuery]                 = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [page, setPage]                   = useState(0)
  const [totalPages, setTotalPages]       = useState(1)
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sort, setSort]                   = useState('releaseYear,desc')
  const [showFilters, setShowFilters]     = useState(false)

  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllMovies(page, 12, sort)
      setMovies(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch { toast.error('Failed to load movies') }
    finally { setLoading(false) }
  }, [page, sort])

  useEffect(() => { fetchMovies() }, [fetchMovies])

  useEffect(() => {
    getAllGenres().then(r => setGenres(r.data)).catch(() => {})
    getRecommendations().then(r => setRecs(r.data)).catch(() => setRecs([])).finally(() => setRecsLoading(false))
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) { setSearchResults(null); return }
    setLoading(true)
    try {
      const res = await searchMovies(query.trim())
      setSearchResults(res.data)
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  const displayMovies = searchResults !== null
    ? (selectedGenre ? searchResults.filter(m => m.genres?.includes(selectedGenre)) : searchResults)
    : (selectedGenre ? movies.filter(m => m.genres?.includes(selectedGenre)) : movies)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Background grid */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* ── Recommendations ─────────────────────────────────────────────── */}
      {!recsLoading && recs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <HorizontalScroller title="RECOMMENDED FOR YOU" icon={Sparkles}>
            {recs.map((movie, i) => (
              <div key={movie.id} className="flex-shrink-0 w-[160px] sm:w-[170px] md:w-[180px] lg:w-[190px] self-start">
                <MovieCard movie={movie} index={i} />
              </div>
            ))}
          </HorizontalScroller>
        </motion.div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <Compass size={18} className="text-cyan-400" />
          <h1 className="font-display text-2xl tracking-widest text-slate-200">EXPLORE</h1>
        </div>
        <div className="hud-line max-w-xs" />
      </motion.div>

      {/* ── Search + Filter Bar ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row gap-3 mb-8"
      >
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="SEARCH FILMS..." className="input-field pl-11 font-mono text-sm tracking-wide" />
          </div>
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary px-5 text-xs tracking-widest">
            SEARCH
          </motion.button>
          {searchResults !== null && (
            <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => { setQuery(''); setSearchResults(null) }}
              className="btn-ghost px-4 text-xs">CLEAR</motion.button>
          )}
        </form>

        {/* Filter toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowFilters(s => !s)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-mono tracking-widest transition-all duration-300 ${
            showFilters ? 'text-cyan-400' : 'text-slate-500 btn-ghost'
          }`}
          style={showFilters ? { background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' } : {}}
        >
          <SlidersHorizontal size={14} /> FILTERS
        </motion.button>
      </motion.div>

      {/* Expanded filters */}
      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden mb-6"
      >
        <div className="flex gap-3 pb-4">
          <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}
            className="input-field w-auto min-w-[140px] font-mono text-xs cursor-pointer">
            <option value="">ALL GENRES</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name.toUpperCase()}</option>)}
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(0) }}
            className="input-field w-auto min-w-[160px] font-mono text-xs cursor-pointer">
            <option value="releaseYear,desc">NEWEST FIRST</option>
            <option value="releaseYear,asc">OLDEST FIRST</option>
            <option value="averageRating,desc">TOP RATED</option>
            <option value="title,asc">A — Z</option>
          </select>
        </div>
      </motion.div>

      {/* Search count */}
      {searchResults !== null && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-mono text-xs text-slate-600 tracking-widest mb-5">
          FOUND <span className="text-cyan-400">{displayMovies.length}</span> RESULTS — "{query}"
        </motion.p>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <Spinner text="LOADING FILMS" />
      ) : displayMovies.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-24 text-slate-700">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-display tracking-widest text-lg">NO FILMS FOUND</p>
          <p className="font-mono text-xs mt-2 text-slate-700">TRY A DIFFERENT QUERY</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayMovies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {searchResults === null && !loading && totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mt-12">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="btn-ghost flex items-center gap-2 text-xs font-mono disabled:opacity-30">
            <ChevronLeft size={14} /> PREV
          </motion.button>

          <span className="font-mono text-xs text-slate-600 tracking-widest">
            <span className="text-cyan-400">{page + 1}</span> / {totalPages}
          </span>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="btn-ghost flex items-center gap-2 text-xs font-mono disabled:opacity-30">
            NEXT <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
