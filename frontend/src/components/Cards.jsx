import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Trash2, UserCheck, UserX, UserMinus } from 'lucide-react'

// ── MovieListItem ──────────────────────────────────────────────────────────
export function MovieListItem({ entry, onRemove, listType, readonly = false }) {
  const placeholder = `https://placehold.co/80x120/0B0F1A/06B6D4?text=${entry.movieTitle?.[0] || '?'}`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      whileHover={{
        background: 'rgba(6,182,212,0.04)',
        borderColor: 'rgba(6,182,212,0.15)',
      }}
    >
      <Link to={`/movies/${entry.movieId}`} className="flex-shrink-0">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={entry.moviePosterUrl || placeholder}
          alt={entry.movieTitle}
          className="w-10 rounded-lg object-cover"
          style={{ height: '60px' }}
          onError={e => { e.target.src = placeholder }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/movies/${entry.movieId}`}>
          <p className="font-semibold text-slate-300 text-sm hover:text-cyan-400 transition-colors truncate">
            {entry.movieTitle}
          </p>
        </Link>
        <p className="text-xs text-slate-600 font-mono mt-0.5">{entry.movieReleaseYear}</p>
        {entry.rating && (
          <div className="flex items-center gap-1 mt-1.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} className={s <= entry.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'} />
            ))}
          </div>
        )}
        {entry.review && (
          <p className="text-xs text-slate-600 mt-1 italic line-clamp-1 font-mono">"{entry.review}"</p>
        )}
      </div>

      {entry.movieAverageRating > 0 && (
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-mono" style={{ color: '#06B6D4' }}>{entry.movieAverageRating?.toFixed(1)}</div>
          <div className="text-xs text-slate-700 font-mono">avg</div>
        </div>
      )}

      {!readonly && onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(entry.movieId, listType)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-700 hover:text-rose-400 transition-all"
          style={{ background: 'rgba(244,63,94,0.08)' }}
        >
          <Trash2 size={13} />
        </motion.button>
      )}
    </motion.div>
  )
}

// ── FriendCard ─────────────────────────────────────────────────────────────
export function FriendCard({ friendship, onAccept, onReject, onUnfriend, type = 'friend' }) {
  const avatar = friendship.profilePictureUrl ||
    `https://placehold.co/80x80/0B0F1A/06B6D4?text=${friendship.username?.[0]?.toUpperCase()}`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      whileHover={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}
    >
      <img src={avatar} alt={friendship.username}
           className="w-11 h-11 rounded-full object-cover flex-shrink-0"
           style={{ border: '1px solid rgba(6,182,212,0.2)' }}
           onError={e => { e.target.src = `https://placehold.co/44x44/0B0F1A/06B6D4?text=${friendship.username?.[0]?.toUpperCase()}` }}
      />
      <div className="flex-1 min-w-0">
        <Link to={`/users/${friendship.username}`}>
          <p className="font-semibold text-slate-300 text-sm hover:text-cyan-400 transition-colors">
            @{friendship.username}
          </p>
        </Link>
        {type === 'pending' && <p className="text-xs text-slate-600 font-mono mt-0.5">Sent you a request</p>}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {type === 'pending' && (
          <>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onAccept(friendship.userId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', boxShadow: '0 0 15px rgba(6,182,212,0.3)' }}
            >
              <UserCheck size={12} /> Accept
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onReject(friendship.userId)} className="btn-danger p-2"
            >
              <UserX size={12} />
            </motion.button>
          </>
        )}
        {type === 'friend' && (
          <>
            <Link to={`/users/${friendship.username}`}>
              <motion.button whileHover={{ scale: 1.05 }} className="btn-ghost text-xs py-1.5 px-3">
                View Profile
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onUnfriend(friendship.userId)}
              className="btn-danger flex items-center gap-1 text-xs p-2"
            >
              <UserMinus size={12} />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}
