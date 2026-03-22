import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllGenres, createGenre, updateGenre, deleteGenre } from '../../api/genreApi'
import Modal from '../../components/Modal'
import Spinner from '../../components/Spinner'
import { toast } from 'react-toastify'

export default function AdminGenres() {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetchGenres = async () => {
    try {
      const res = await getAllGenres()
      setGenres(res.data)
    } catch { toast.error('Failed to load genres') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGenres() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true) }
  const openEdit = (g) => { setEditing(g); setForm({ name: g.name, description: g.description || '' }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const res = await updateGenre(editing.id, form)
        setGenres(prev => prev.map(g => g.id === editing.id ? res.data : g))
        toast.success('Genre updated')
      } else {
        const res = await createGenre(form)
        setGenres(prev => [...prev, res.data])
        toast.success('Genre created')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save genre')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this genre?')) return
    try {
      await deleteGenre(id)
      setGenres(prev => prev.filter(g => g.id !== id))
      toast.success('Genre deleted')
    } catch { toast.error('Failed to delete genre') }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="section-title leading-none">GENRES</h1>
            <p className="text-slate-500 text-sm">{genres.length} genres</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Genre
        </button>
      </div>

      {loading ? <Spinner /> : genres.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Tag size={48} className="mx-auto mb-3 opacity-30" />
          <p>No genres yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {genres.map(g => (
            <div key={g.id} className="flex items-center gap-4 p-4 card hover:border-slate-700 transition-all group">
              <div className="flex-1">
                <p className="font-semibold text-slate-200 text-sm">{g.name}</p>
                {g.description && <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(g)} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(g.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Genre' : 'Add Genre'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required maxLength={50} className="input-field" placeholder="e.g. Action" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength={200} className="input-field" placeholder="Optional description" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update Genre' : 'Create Genre'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
