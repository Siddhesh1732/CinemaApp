import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { getAllMovies, searchMovies } from '../api/movieApi'
import { getAllGenres } from '../api/genreApi'
import MovieCard from '../components/MovieCard'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

export default function HomePage() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sort, setSort] = useState('releaseYear,desc')

  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllMovies(page, 12, sort)
      setMovies(res.data.content)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }, [page, sort])

  useEffect(() => { fetchMovies() }, [fetchMovies])

  useEffect(() => {
    getAllGenres().then(res => setGenres(res.data)).catch(() => {})
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) { setSearchResults(null); return }
    setLoading(true)
    try {
      const res = await searchMovies(query.trim())
      setSearchResults(res.data)
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => { setQuery(''); setSearchResults(null) }

  const displayMovies = searchResults !== null
    ? (selectedGenre ? searchResults.filter(m => m.genres?.includes(selectedGenre)) : searchResults)
    : (selectedGenre ? movies.filter(m => m.genres?.includes(selectedGenre)) : movies)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-1">EXPLORE MOVIES</h1>
        <p className="text-slate-500 text-sm">Discover something great to watch tonight</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies by title..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
          {searchResults !== null && (
            <button type="button" onClick={clearSearch} className="btn-secondary px-4">Clear</button>
          )}
        </form>

        <div className="flex gap-2">
          {/* Genre filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input-field w-auto min-w-[130px] cursor-pointer"
          >
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0) }}
            className="input-field w-auto min-w-[140px] cursor-pointer"
          >
            <option value="releaseYear,desc">Newest First</option>
            <option value="releaseYear,asc">Oldest First</option>
            <option value="averageRating,desc">Top Rated</option>
            <option value="title,asc">A - Z</option>
          </select>
        </div>
      </div>

      {/* Status bar */}
      {searchResults !== null && (
        <div className="mb-4 text-sm text-slate-500">
          Found <span className="text-amber-400 font-medium">{displayMovies.length}</span> results for "{query}"
        </div>
      )}

      {/* Movies grid */}
      {loading ? (
        <Spinner text="Loading movies..." />
      ) : displayMovies.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Search size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg">No movies found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}

      {/* Pagination — only show when not in search mode */}
      {searchResults === null && !loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-sm text-slate-500">
            Page <span className="text-amber-400 font-medium">{page + 1}</span> of{' '}
            <span className="text-slate-300">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
