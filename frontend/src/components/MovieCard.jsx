import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Star, Calendar } from 'lucide-react'
import { useRef } from 'react'

export default function MovieCard({ movie, index = 0 }) {
  const ref = useRef(null)
  const x   = useMotionValue(0)
  const y   = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })
  const glowX   = useTransform(x, [-0.5, 0.5], [0, 100])
  const glowY   = useTransform(y, [-0.5, 0.5], [0, 100])

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  const rating      = movie.averageRating ? movie.averageRating.toFixed(1) : null
  const placeholder = `https://placehold.co/300x450/0B0F1A/06B6D4?text=${encodeURIComponent(movie.title?.[0] || '?')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <Link to={`/movies/${movie.id}`}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.03, z: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{
            background: 'rgba(11,15,26,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
            transformStyle: 'preserve-3d',
            rotateX, rotateY,
          }}
        >
          {/* Dynamic glow that follows mouse */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: useTransform([glowX, glowY], ([gx, gy]) =>
                `radial-gradient(circle at ${gx}% ${gy}%, rgba(6,182,212,0.15) 0%, transparent 60%)`
              ),
            }}
          />

          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <motion.img
              src={movie.posterUrl || placeholder}
              alt={movie.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5 }}
              onError={(e) => { e.target.src = placeholder }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Rating badge */}
            {rating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: 'rgba(5,5,8,0.85)', border: '1px solid rgba(245,158,11,0.4)', backdropFilter: 'blur(10px)' }}
              >
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-400">{rating}</span>
              </motion.div>
            )}

            {/* Upcoming tag */}
            {movie.status === 'UPCOMING' && (
              <div className="absolute top-2 left-2 badge-cyan text-xs">UPCOMING</div>
            )}

            {/* Hover reveal overlay */}
            <motion.div
              className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
              style={{ background: 'linear-gradient(to top, rgba(5,5,8,0.9) 0%, transparent 60%)' }}
            >
              <span className="font-mono text-xs text-cyan-400 tracking-widest">VIEW DETAILS →</span>
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-3 h-[100px] flex flex-col justify-between">
            <h3 className="font-body font-semibold text-slate-200 text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-cyan-300 transition-colors duration-300">
              {movie.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                <Calendar size={10} /> {movie.releaseYear}
              </span>
              {movie.genres?.[0] && (
                <span className="text-xs text-slate-700 font-mono truncate max-w-[80px]">
                  {movie.genres[0]}
                </span>
              )}
            </div>
          </div>

          {/* Bottom glow border on hover */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}
