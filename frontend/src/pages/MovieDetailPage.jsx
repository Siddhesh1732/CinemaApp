import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Clock, Calendar, Globe, Film, Bookmark, Heart, Eye, Check, ChevronLeft } from 'lucide-react'
import { getMovieById } from '../api/movieApi'
import { addToList, removeFromList, getAllMyLists, rateMovie } from '../api/userMovieListApi'
import StarRating from '../components/StarRating'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(null)
  const [myLists, setMyLists] = useState({ watched: [], watchlist: [], liked: [] })
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [movieRes, listsRes] = await Promise.all([
          getMovieById(id),
          getAllMyLists()
        ])
        setMovie(movieRes.data)
        setMyLists(listsRes.data)

        // Pre-fill rating if already rated
        const watchedEntry = listsRes.data.watched?.find(e => e.movieId === parseInt(id))
        if (watchedEntry?.rating) setRating(watchedEntry.rating)
        if (watchedEntry?.review) setReview(watchedEntry.review)
      } catch {
        toast.error('Failed to load movie')
        navigate('/home')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const isInList = (listType) => {
    const list = myLists[listType.toLowerCase()] || []
    return list.some(e => e.movieId === parseInt(id))
  }

  const handleListToggle = async (listType) => {
    if (isInList(listType)) {
      try {
        await removeFromList(id, listType)
        setMyLists(prev => ({
          ...prev,
          [listType.toLowerCase()]: prev[listType.toLowerCase()].filter(e => e.movieId !== parseInt(id))
        }))
        toast.success(`Removed from ${listType}`)
      } catch {
        toast.error('Failed to update list')
      }
    } else {
      try {
        const res = await addToList(parseInt(id), listType)
        setMyLists(prev => ({
          ...prev,
          [listType.toLowerCase()]: [...(prev[listType.toLowerCase()] || []), res.data]
        }))
        toast.success(`Added to ${listType}`)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to update list')
      }
    }
  }

  const handleRateSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a rating'); return }
    setRatingLoading(true)
    try {
      await rateMovie(id, rating, review)
      toast.success('Rating saved!')
      // Refresh movie to show updated average
      const res = await getMovieById(id)
      setMovie(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Must add to Watched list before rating')
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><Spinner text="Loading movie..." /></div>
  if (!movie) return null

  const placeholder = `https://placehold.co/400x600/10101A/F59E0B?text=${encodeURIComponent(movie.title)}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 mb-6 text-sm transition-colors group">
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Left column — Poster */}
        <div className="md:col-span-1">
          <div className="rounded-2xl overflow-hidden border border-[#1E1E2E] sticky top-24">
            <img
              src={movie.posterUrl || placeholder}
              alt={movie.title}
              className="w-full object-cover"
              onError={(e) => { e.target.src = placeholder }}
            />
          </div>
        </div>

        {/* Right column — Details */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          {/* Title + meta */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres?.map(g => <span key={g} className="badge-amber">{g}</span>)}
              <span className={`badge ${movie.status === 'RELEASED' ? 'badge-green' : 'badge-blue'}`}>{movie.status}</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-slate-100 tracking-wider mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {movie.releaseYear && <span className="flex items-center gap-1.5"><Calendar size={14} />{movie.releaseYear}</span>}
              {movie.durationMinutes && <span className="flex items-center gap-1.5"><Clock size={14} />{movie.durationMinutes} min</span>}
              {movie.language && <span className="flex items-center gap-1.5"><Globe size={14} />{movie.language}</span>}
              {movie.country && <span className="text-slate-600">•</span>}
              {movie.country && <span>{movie.country}</span>}
            </div>
          </div>

          {/* Rating display */}
          {movie.totalRatings > 0 && (
            <div className="flex items-center gap-4 p-4 bg-[#10101A] border border-[#1E1E2E] rounded-xl w-fit">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400">{movie.averageRating?.toFixed(1)}</div>
                <div className="text-xs text-slate-500 mt-0.5">Average</div>
              </div>
              <div className="w-px h-10 bg-[#1E1E2E]" />
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-300">{movie.totalRatings}</div>
                <div className="text-xs text-slate-500 mt-0.5">Ratings</div>
              </div>
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={s <= Math.round(movie.averageRating / 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {movie.description && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-2">Synopsis</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{movie.description}</p>
            </div>
          )}

          {/* Cast */}
          {movie.castMembers?.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-3">Cast & Crew</h3>
              <div className="flex flex-wrap gap-2">
                {movie.castMembers.map(name => (
                  <span key={name} className="text-xs px-3 py-1.5 bg-[#10101A] border border-[#1E1E2E] rounded-full text-slate-400">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trailer link */}
          {movie.trailerUrl && (
            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 btn-secondary">
              <Film size={15} /> Watch Trailer
            </a>
          )}

          {/* List actions */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-3">Add to your lists</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { type: 'WATCHED', label: 'Watched', Icon: Eye },
                { type: 'WATCHLIST', label: 'Watchlist', Icon: Bookmark },
                { type: 'LIKED', label: 'Liked', Icon: Heart },
              ].map(({ type, label, Icon }) => {
                const active = isInList(type)
                return (
                  <button
                    key={type}
                    onClick={() => handleListToggle(type)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-[#10101A] border-[#1E1E2E] text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {active ? <Check size={15} /> : <Icon size={15} />}
                    {active ? `In ${label}` : `Add to ${label}`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rate section — only show if in WATCHED */}
          {isInList('WATCHED') && (
            <div className="p-5 bg-[#10101A] border border-[#1E1E2E] rounded-xl">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Your Rating</h3>
              <form onSubmit={handleRateSubmit} className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Tap to rate</p>
                  <StarRating value={rating} onChange={setRating} size={22} />
                </div>
                <div>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write a review (optional)..."
                    rows={3}
                    className="input-field resize-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="btn-primary disabled:opacity-60"
                >
                  {ratingLoading ? 'Saving...' : 'Save Rating'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
