import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, Calendar, Globe, Film, Bookmark, Heart, Eye, Check, ChevronLeft, MessageSquare } from 'lucide-react'
import { getMovieById, getMovieReviews } from '../api/movieApi'
import { addToList, removeFromList, getAllMyLists, rateMovie } from '../api/userMovieListApi'
import StarRating from '../components/StarRating'
import CircularRating from '../components/CircularRating'
import { Spinner, GlassPanel } from '../components/UI'
import { toast } from 'react-toastify'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie]                   = useState(null)
  const [myLists, setMyLists]               = useState({ watched: [], watchlist: [], liked: [] })
  const [reviews, setReviews]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [rating, setRating]                 = useState(0)
  const [review, setReview]                 = useState('')
  const [ratingLoading, setRatingLoading]   = useState(false)

  useEffect(() => {
    const fetchCritical = async () => {
      setLoading(true)
      try {
        const [movieRes, listsRes] = await Promise.all([getMovieById(id), getAllMyLists()])
        setMovie(movieRes.data)
        setMyLists(listsRes.data)
        const watched = listsRes.data.watched?.find(e => e.movieId === parseInt(id))
        if (watched?.rating) setRating(watched.rating)
        if (watched?.review) setReview(watched.review)
      } catch { toast.error('Failed to load movie'); navigate('/home') }
      finally { setLoading(false) }
    }
    fetchCritical()
    getMovieReviews(id).then(r => setReviews(r.data)).catch(() => setReviews([])).finally(() => setReviewsLoading(false))
  }, [id])

  const isInList = (type) => (myLists[type.toLowerCase()] || []).some(e => e.movieId === parseInt(id))

  const handleListToggle = async (listType) => {
    if (isInList(listType)) {
      try {
        await removeFromList(id, listType)
        setMyLists(prev => ({ ...prev, [listType.toLowerCase()]: prev[listType.toLowerCase()].filter(e => e.movieId !== parseInt(id)) }))
        toast.success(`Removed from ${listType}`)
      } catch { toast.error('Failed to update list') }
    } else {
      try {
        const res = await addToList(parseInt(id), listType)
        setMyLists(prev => ({ ...prev, [listType.toLowerCase()]: [...(prev[listType.toLowerCase()] || []), res.data] }))
        toast.success(`Added to ${listType}`)
      } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    }
  }

  const handleRateSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Select a rating'); return }
    setRatingLoading(true)
    try {
      await rateMovie(id, rating, review)
      toast.success('Rating saved!')
      const [movieRes, reviewsRes] = await Promise.all([getMovieById(id), getMovieReviews(id)])
      setMovie(movieRes.data)
      setReviews(reviewsRes.data)
    } catch (err) { toast.error(err.response?.data?.message || 'Add to Watched first') }
    finally { setRatingLoading(false) }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><Spinner text="LOADING FILM" /></div>
  if (!movie) return null

  const placeholder = `https://placehold.co/400x600/0B0F1A/06B6D4?text=${encodeURIComponent(movie.title?.[0] || '?')}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="fixed inset-0 grid-bg opacity-15 pointer-events-none" />

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-mono text-xs text-slate-600 hover:text-cyan-400 mb-8 transition-colors group"
        whileHover={{ x: -3 }}
      >
        <ChevronLeft size={14} className="group-hover:text-cyan-400" /> BACK
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* ── Poster ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-1"
        >
          <div className="sticky top-24">
            <div className="rounded-2xl overflow-hidden"
                 style={{ border: '1px solid rgba(6,182,212,0.15)', boxShadow: '0 0 40px rgba(6,182,212,0.08)' }}>
              <img src={movie.posterUrl || placeholder} alt={movie.title}
                   className="w-full object-cover" onError={e => { e.target.src = placeholder }} />
            </div>

            {/* Average rating below poster */}
            {movie.totalRatings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-5 p-4 rounded-2xl flex items-center gap-4"
                style={{ background: 'rgba(11,15,26,0.8)', border: '1px solid rgba(6,182,212,0.1)' }}
              >
                <CircularRating value={movie.averageRating} max={5} size={72} />
                <div>
                  <p className="font-display text-xs tracking-widest text-slate-500">COMMUNITY</p>
                  <p className="font-mono text-xs text-slate-600 mt-0.5">{movie.totalRatings} ratings</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Details ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-2 lg:col-span-3 space-y-8"
        >
          {/* Title */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map(g => <span key={g} className="badge-cyan">{g}</span>)}
              <span className={`${movie.status === 'RELEASED' ? 'badge-green' : 'badge-violet'}`}>{movie.status}</span>
            </div>
            <h1 className="font-display font-bold tracking-wider text-white leading-tight mb-4"
                style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 font-mono text-xs text-slate-600">
              {movie.releaseYear    && <span className="flex items-center gap-1.5"><Calendar size={12} /> {movie.releaseYear}</span>}
              {movie.durationMinutes && <span className="flex items-center gap-1.5"><Clock size={12} /> {movie.durationMinutes} MIN</span>}
              {movie.language       && <span className="flex items-center gap-1.5"><Globe size={12} /> {movie.language.toUpperCase()}</span>}
            </div>
          </div>

          <div className="hud-line" />

          {/* Synopsis */}
          {movie.description && (
            <div>
              <p className="font-mono text-xs text-slate-600 tracking-widest mb-2">SYNOPSIS</p>
              <p className="text-slate-400 leading-relaxed text-sm font-light">{movie.description}</p>
            </div>
          )}

          {/* Cast */}
          {movie.castMembers?.length > 0 && (
            <div>
              <p className="font-mono text-xs text-slate-600 tracking-widest mb-3">CAST & CREW</p>
              <div className="flex flex-wrap gap-2">
                {movie.castMembers.map(name => (
                  <span key={name} className="text-xs px-3 py-1.5 rounded-full font-mono text-slate-500 transition-colors hover:text-cyan-400"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trailer */}
          {movie.trailerUrl && (
            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
                className="btn-ghost inline-flex items-center gap-2 text-xs font-mono tracking-widest">
                <Film size={13} /> WATCH TRAILER
              </motion.div>
            </a>
          )}

          {/* List actions */}
          <div>
            <p className="font-mono text-xs text-slate-600 tracking-widest mb-4">ADD TO LISTS</p>
            <div className="flex flex-wrap gap-3">
              {[
                { type: 'WATCHED',   label: 'WATCHED',   Icon: Eye      },
                { type: 'WATCHLIST', label: 'WATCHLIST', Icon: Bookmark },
                { type: 'LIKED',     label: 'LIKED',     Icon: Heart    },
              ].map(({ type, label, Icon }) => {
                const active = isInList(type)
                return (
                  <motion.button key={type} onClick={() => handleListToggle(type)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono tracking-widest transition-all duration-300"
                    style={active ? {
                      background: 'rgba(6,182,212,0.15)',
                      border: '1px solid rgba(6,182,212,0.4)',
                      color: '#06B6D4',
                      boxShadow: '0 0 20px rgba(6,182,212,0.2)',
                    } : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: '#64748B',
                    }}
                  >
                    {active ? <Check size={13} /> : <Icon size={13} />}
                    {active ? `✓ ${label}` : label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Rate */}
          <AnimatePresence>
            {isInList('WATCHED') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(11,15,26,0.8)', border: '1px solid rgba(6,182,212,0.15)', boxShadow: '0 0 30px rgba(6,182,212,0.05)' }}
              >
                <p className="font-mono text-xs text-slate-600 tracking-widest mb-5">YOUR RATING</p>
                <form onSubmit={handleRateSubmit} className="space-y-5">
                  <StarRating value={rating} onChange={setRating} size={26} />
                  <textarea value={review} onChange={e => setReview(e.target.value)}
                    placeholder="Write your review..." rows={3}
                    className="input-field resize-none text-sm font-light" />
                  <motion.button type="submit" disabled={ratingLoading}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-xs tracking-widest disabled:opacity-40">
                    {ratingLoading ? 'SAVING...' : 'SAVE RATING'}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Reviews ──────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <MessageSquare size={14} className="text-violet-400" />
              <p className="font-mono text-xs text-slate-500 tracking-widest">MEMBER REVIEWS</p>
              {reviews.length > 0 && <span className="badge-violet">{reviews.length}</span>}
              <div className="flex-1 hud-line ml-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
            </div>

            {reviewsLoading ? (
              <Spinner text="LOADING REVIEWS" />
            ) : reviews.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-8 rounded-2xl text-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <MessageSquare size={32} className="mx-auto mb-3 text-slate-800" />
                <p className="font-display text-xs tracking-widest text-slate-700">NO REVIEWS YET</p>
                <p className="font-mono text-xs text-slate-800 mt-1">BE THE FIRST TO REVIEW</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r, i) => {
                  const avatar = r.profilePictureUrl ||
                    `https://placehold.co/40x40/0B0F1A/8B5CF6?text=${r.username?.[0]?.toUpperCase()}`
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl transition-all duration-300 group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      whileHover={{ background: 'rgba(139,92,246,0.04)', borderColor: 'rgba(139,92,246,0.15)' }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Link to={`/users/${r.username}`} className="flex items-center gap-3 group/user">
                          <img src={avatar} alt={r.username}
                               className="w-8 h-8 rounded-full object-cover flex-shrink-0 transition-all"
                               style={{ border: '1px solid rgba(139,92,246,0.2)' }}
                               onError={e => { e.target.src = `https://placehold.co/32x32/0B0F1A/8B5CF6?text=${r.username?.[0]?.toUpperCase()}` }}
                          />
                          <span className="font-mono text-xs text-slate-400 group-hover/user:text-violet-400 transition-colors tracking-wide">
                            @{r.username}
                          </span>
                        </Link>
                        {r.rating && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12}
                                      className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'} />
                              ))}
                            </div>
                            <span className="font-mono text-xs text-amber-400">{r.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed font-light italic">"{r.review}"</p>
                      <p className="font-mono text-xs text-slate-700 mt-3">
                        {new Date(r.addedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
