import { Link } from 'react-router-dom'
import { Star, Calendar } from 'lucide-react'

export default function MovieCard({ movie }) {
  const rating = movie.averageRating ? movie.averageRating.toFixed(1) : null
  const placeholder = `https://placehold.co/300x450/10101A/F59E0B?text=${encodeURIComponent(movie.title)}`

  return (
    <Link to={`/movies/${movie.id}`} className="movie-card group block">
      <div className="relative rounded-xl overflow-hidden bg-[#10101A] border border-[#1E1E2E] hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5">

        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterUrl || placeholder}
            alt={movie.title}
            className="movie-card-img w-full h-full object-cover"
            onError={(e) => { e.target.src = placeholder }}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-xs text-amber-400 font-medium">View Details →</span>
          </div>

          {/* Rating badge */}
          {rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-amber-400">{rating}</span>
            </div>
          )}

          {/* Status badge */}
          {movie.status === 'UPCOMING' && (
            <div className="absolute top-2 left-2 bg-blue-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              Upcoming
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-slate-200 text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-amber-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar size={11} />
              <span className="text-xs">{movie.releaseYear}</span>
            </div>
            {movie.genres?.length > 0 && (
              <span className="text-xs text-slate-600 truncate max-w-[80px]">{movie.genres[0]}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
