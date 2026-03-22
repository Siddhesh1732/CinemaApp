import { Link } from 'react-router-dom'
import { Star, Trash2 } from 'lucide-react'

export default function MovieListItem({ entry, onRemove, listType, readonly = false }) {
  const placeholder = `https://placehold.co/80x120/10101A/F59E0B?text=${encodeURIComponent(entry.movieTitle?.[0] || '?')}`

  return (
    <div className="flex items-center gap-4 p-4 bg-[#10101A] border border-[#1E1E2E] rounded-xl hover:border-slate-700 transition-all group">
      {/* Poster thumbnail */}
      <Link to={`/movies/${entry.movieId}`} className="flex-shrink-0">
        <img
          src={entry.moviePosterUrl || placeholder}
          alt={entry.movieTitle}
          className="w-12 h-18 rounded-lg object-cover"
          style={{ height: '72px' }}
          onError={(e) => { e.target.src = placeholder }}
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/movies/${entry.movieId}`}>
          <h4 className="font-semibold text-slate-200 text-sm hover:text-amber-400 transition-colors truncate">
            {entry.movieTitle}
          </h4>
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">{entry.movieReleaseYear}</p>
        {entry.rating && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{entry.rating}/10</span>
          </div>
        )}
        {entry.review && (
          <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{entry.review}"</p>
        )}
      </div>

      {/* Average rating */}
      <div className="text-right flex-shrink-0">
        {entry.movieAverageRating > 0 && (
          <div className="text-xs text-slate-500">
            <div className="text-slate-300 font-medium">{entry.movieAverageRating?.toFixed(1)}</div>
            <div>avg</div>
          </div>
        )}
      </div>

      {/* Remove button */}
      {!readonly && onRemove && (
        <button
          onClick={() => onRemove(entry.movieId, listType)}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
