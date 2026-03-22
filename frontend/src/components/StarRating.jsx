import { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, readonly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0)

  const display = hovered || value

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= display ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-amber-400">{value}/10</span>
      )}
    </div>
  )
}
