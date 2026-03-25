import { Link } from 'react-router-dom'
import { Film, Star, Users, List, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08080F] text-slate-200 overflow-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-[#08080F]/80 backdrop-blur-md border-b border-[#1E1E2E]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Film size={16} className="text-black" />
          </div>
          <span className="font-display text-xl tracking-widest text-slate-100">CINEMA PREMI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-slate-200 text-sm font-medium px-4 py-2 transition-colors">
            Log In
          </Link>
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto page-enter">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Your personal movie universe
          </div>

          <h1 className="font-display text-6xl md:text-8xl text-slate-100 tracking-wider leading-none mb-6">
            TRACK EVERY<br />
            <span className="text-amber-400">MOVIE</span> YOU LOVE
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Discover films, build your watchlist, rate what you've seen, and share your taste with friends.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Start for free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-slate-500 text-sm uppercase tracking-widest font-medium mb-12">Everything you need</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: List, title: 'Three Lists', desc: 'Maintain Watched, Watchlist, and Liked lists effortlessly. Add the same movie to multiple lists.' },
              { icon: Star, title: 'Rate & Review', desc: 'Rate movies on a 1-10 scale and leave personal reviews. Watch the community average update in real time.' },
              { icon: Users, title: 'Friends & Sharing', desc: 'Connect with friends, see their lists, and discover movies through the people you trust.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 bg-[#10101A] border border-[#1E1E2E] rounded-2xl hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Icon size={20} className="text-amber-400" />
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-4xl text-slate-100 tracking-wider mb-4">READY TO START?</h2>
          <p className="text-slate-500 mb-8">Join and start tracking your movie journey today.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
            Create Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] py-8 text-center">
        <p className="text-slate-600 text-sm">Built with Spring Boot + React</p>
      </footer>
    </div>
  )
}
