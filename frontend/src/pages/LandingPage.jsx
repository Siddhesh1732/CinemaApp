import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Film, Star, Users, List, ChevronRight, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

// Particle background
function Particles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6,182,212,${p.opacity})`
        ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

const FEATURES = [
  { Icon: List,  title: 'Three Lists',        desc: 'Track Watched, Watchlist, and Liked with one tap. Add any movie to multiple lists simultaneously.' },
  { Icon: Star,  title: 'Rate & Review',       desc: 'Score on a 5-star scale, leave personal reviews, and watch the community average update live.' },
  { Icon: Users, title: 'Social Discovery',    desc: 'Connect with friends, explore their taste, and discover movies through people you trust.' },
  { Icon: Zap,   title: 'AI Recommendations', desc: 'Our engine analyzes your ratings to surface films you\'ll actually love — no generic picks.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--void)' }}>
      <Particles />

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Spotlight */}
      <div className="absolute inset-0 spotlight pointer-events-none" />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-30 flex items-center justify-between px-8 py-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ boxShadow: ['0 0 10px rgba(6,182,212,0.3)', '0 0 30px rgba(6,182,212,0.6)', '0 0 10px rgba(6,182,212,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' }}
          >
            <Film size={17} className="text-white" />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-widest text-white">CINEMA-PAGLU</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <motion.button whileHover={{ scale: 1.05 }} className="btn-ghost text-sm">
              SIGN IN
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(6,182,212,0.6)' }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-sm"
            >
              GET STARTED
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 -mt-20 text-center">
        {/* Tag line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
          style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          />
          <span className="font-mono text-xs text-cyan-400 tracking-widest">NEXT-GEN MOVIE TRACKER</span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display font-bold leading-none tracking-wider mb-6"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', color: '#F1F5F9' }}>
            YOUR{' '}
            <span className="glow-cyan" style={{ color: '#06B6D4' }}>CINEMA</span>
            <br />
            <span className="glow-violet" style={{ color: '#8B5CF6' }}>UNIVERSE</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-slate-400 text-lg max-w-xl mx-auto mb-10 font-light leading-relaxed"
        >
          Discover films. Track every frame. Rate what moves you.
          Share your universe with people who get it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(6,182,212,0.7), 0 0 100px rgba(139,92,246,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
            >
              ENTER THE UNIVERSE <ChevronRight size={18} />
            </motion.button>
          </Link>
          <Link to="/login">
            <motion.button whileHover={{ scale: 1.03 }} className="btn-ghost text-base px-8 py-3.5">
              ALREADY A MEMBER
            </motion.button>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-xs text-slate-700 tracking-widest">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-cyan-400/50 to-transparent"
          />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="font-mono text-xs text-cyan-400/60 tracking-widest uppercase mb-3">CAPABILITIES</p>
            <h2 className="font-display text-3xl tracking-widest text-slate-200">BUILT DIFFERENT</h2>
            <div className="hud-line max-w-xs mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, boxShadow: '0 0 40px rgba(6,182,212,0.1)' }}
                className="p-6 rounded-2xl transition-all duration-400 group"
                style={{
                  background: 'rgba(11,15,26,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <Icon size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-display text-sm tracking-widest text-slate-200 mb-2">{title.toUpperCase()}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg mx-auto"
        >
          <h2 className="font-display text-3xl tracking-widest text-slate-200 mb-4">READY TO LAUNCH?</h2>
          <p className="text-slate-500 mb-8 font-light">Join the future of movie discovery.</p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(6,182,212,0.6)' }}
              className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2"
            >
              CREATE ACCOUNT <ChevronRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <p className="font-mono text-xs text-slate-700 tracking-widest">CINEMA-PAGLU — BUILT WITH SPRING-BOOT + REACT</p>
      </footer>
    </div>
  )
}
