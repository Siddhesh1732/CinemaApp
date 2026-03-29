import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronLeft, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllGenres, createGenre, updateGenre, deleteGenre } from '../../api/genreApi'
import { BlurModal, Spinner, GradientButton } from '../../components/UI'
import { toast } from 'react-toastify'

export default function AdminGenres() {
  const [genres, setGenres]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ name: '', description: '' })
  const [saving, setSaving]   = useState(false)

  const fetch = async () => {
    try { const r = await getAllGenres(); setGenres(r.data) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setModal(true) }
  const openEdit   = (g) => { setEditing(g); setForm({ name: g.name, description: g.description || '' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) {
        const r = await updateGenre(editing.id, form)
        setGenres(prev => prev.map(g => g.id === editing.id ? r.data : g))
        toast.success('Genre updated')
      } else {
        const r = await createGenre(form)
        setGenres(prev => [...prev, r.data])
        toast.success('Genre created')
      }
      setModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this genre?')) return
    try { await deleteGenre(id); setGenres(prev => prev.filter(g => g.id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="fixed inset-0 grid-bg opacity-15 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <motion.div whileHover={{ x: -3 }} className="p-2 rounded-xl text-slate-600 hover:text-cyan-400 transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <ChevronLeft size={16} />
            </motion.div>
          </Link>
          <div>
            <h1 className="font-display text-xl tracking-widest text-white">GENRES</h1>
            <p className="font-mono text-xs text-slate-600 mt-0.5">{genres.length} CATEGORIES</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
          whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs tracking-widest">
          <Plus size={14} /> NEW GENRE
        </motion.button>
      </motion.div>

      {loading ? <Spinner text="LOADING" /> : genres.length === 0 ? (
        <div className="text-center py-20 text-slate-800">
          <Tag size={48} className="mx-auto mb-3 opacity-15" />
          <p className="font-display tracking-widest text-sm">NO GENRES YET</p>
        </div>
      ) : (
        <div className="space-y-2">
          {genres.map((g, i) => (
            <motion.div key={g.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              whileHover={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Tag size={13} className="text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm text-slate-300">{g.name}</p>
                {g.description && <p className="text-xs text-slate-600 mt-0.5">{g.description}</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(g)}
                  className="p-2 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors"
                  style={{ background: 'rgba(6,182,212,0.08)' }}>
                  <Pencil size={13} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(g.id)}
                  className="p-2 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                  style={{ background: 'rgba(244,63,94,0.08)' }}>
                  <Trash2 size={13} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BlurModal isOpen={modalOpen} onClose={() => setModal(false)} title={editing ? 'EDIT GENRE' : 'NEW GENRE'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">NAME *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required maxLength={50} placeholder="e.g. Science Fiction" className="input-field" />
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">DESCRIPTION</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              maxLength={200} placeholder="Optional description" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <GradientButton type="submit" disabled={saving} className="flex-1 text-xs tracking-widest">
              {saving ? 'SAVING...' : editing ? 'UPDATE' : 'CREATE'}
            </GradientButton>
            <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => setModal(false)}
              className="btn-ghost px-6 text-xs tracking-widest">CANCEL</motion.button>
          </div>
        </form>
      </BlurModal>
    </div>
  )
}
