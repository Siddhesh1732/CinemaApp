import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HorizontalScroller({ children, title, icon: Icon }) {
  const ref                             = useRef(null)
  const [showLeft, setShowLeft]         = useState(false)
  const [showRight, setShowRight]       = useState(true)
  const [isDragging, setIsDragging]     = useState(false)
  const [startX, setStartX]             = useState(0)
  const [scrollStart, setScrollStart]   = useState(0)

  const update = () => {
    const el = ref.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setShowRight(el.scrollWidth > el.clientWidth)
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [children])

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' })
  }

  // Drag to scroll
  const onMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - ref.current.offsetLeft)
    setScrollStart(ref.current.scrollLeft)
  }
  const onMouseMove = (e) => {
    if (!isDragging) return
    const x = e.pageX - ref.current.offsetLeft
    ref.current.scrollLeft = scrollStart - (x - startX)
  }
  const onMouseUp = () => setIsDragging(false)

  return (
    <div className="relative">
      {/* Header */}
      {title && (
        <div className="flex items-center gap-3 mb-5">
          {Icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <Icon size={14} className="text-cyan-400" />
            </div>
          )}
          <span className="font-display text-sm tracking-widest text-slate-300">{title}</span>
          <div className="flex-1 hud-line ml-2" />
        </div>
      )}

      {/* Scroll wrapper */}
      <div className="relative">
        {/* Left arrow */}
        <AnimatePresence>
          {showLeft && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(11,15,26,0.9)',
                border: '1px solid rgba(6,182,212,0.3)',
                boxShadow: '0 0 15px rgba(6,182,212,0.2)',
                backdropFilter: 'blur(10px)',
              }}
              whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(6,182,212,0.5)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={16} className="text-cyan-400" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right arrow */}
        <AnimatePresence>
          {showRight && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(11,15,26,0.9)',
                border: '1px solid rgba(6,182,212,0.3)',
                boxShadow: '0 0 15px rgba(6,182,212,0.2)',
                backdropFilter: 'blur(10px)',
              }}
              whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(6,182,212,0.5)' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={16} className="text-cyan-400" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable content */}
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
