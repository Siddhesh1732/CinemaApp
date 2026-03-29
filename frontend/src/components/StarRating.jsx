import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, readonly = false, size = 22 }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          whileHover={!readonly ? { scale: 1.3, y: -2 } : {}}
          whileTap={!readonly ? { scale: 0.9 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={!readonly ? 'cursor-pointer' : 'cursor-default'}
        >
          <motion.div
            animate={{
              filter: star <= display
                ? 'drop-shadow(0 0 6px rgba(245,158,11,0.8))'
                : 'none',
            }}
            transition={{ duration: 0.2 }}
          >
            <Star
              size={size}
              className={`transition-colors duration-200 ${
                star <= display ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
              }`}
            />
          </motion.div>
        </motion.button>
      ))}
      {value > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-2 text-sm font-mono font-bold text-amber-400"
          style={{ textShadow: '0 0 10px rgba(245,158,11,0.6)' }}
        >
          {value}/5
        </motion.span>
      )}
    </div>
  )
}
