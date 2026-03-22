import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllCastMembers, searchCastMembers, createCastMember, updateCastMember, deleteCastMember } from '../../api/castMemberApi'
import Modal from '../../components/Modal'
import Spinner from '../../components/Spinner'
import { toast } from 'react-toastify'

const ROLES = ['ACTOR', 'DIRECTOR', 'WRITER', 'PRODUCER', 'COMPOSER', 'CINEMATOGRAPHER']

const emptyForm = { name: '', primaryRole: 'ACTOR', dateOfBirth: '', nationality: '', biography: '', profilePictureUrl: '' }

export default function AdminCastMembers() {
  const [castMembers, setCastMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    try {
      const res = await getAllCastMembers(0, 50)
      setCastMembers(res.data.content || [])
    } catch { toast.error('Failed to load cast members') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) { fetchAll(); return }
    setLoading(true)
    try {
      const res = await searchCastMembers(search)
      setCastMembers(res.data)
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, primaryRole: c.primaryRole, dateOfBirth: c.dateOfBirth || '', nationality: c.nationality || '', biography: c.biography || '', profilePictureUrl: c.profilePictureUrl || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null }
    try {
      if (editing) {
        const res = await updateCastMember(editing.id, payload)
        setCastMembers(prev => prev.map(c => c.id === editing.id ? res.data : c))
        toast.success('Cast member updated')
      } else {
        const res = await createCastMember(payload)
        setCastMembers(prev => [...prev, res.data])
        toast.success('Cast member created')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this cast member?')) return
    try {
      await deleteCastMember(id)
      setCastMembers(prev => prev.filter(c => c.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors"><ChevronLeft size={20} /></Link>
          <div>
            <h1 className="section-title leading-none">CAST MEMBERS</h1>
            <p className="text-slate-500 text-sm">{castMembers.length} people</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Person</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="input-field pl-10" />
        </div>
        <button type="submit" className="btn-secondary px-5">Search</button>
      </form>

      {loading ? <Spinner /> : (
        <div className="space-y-2">
          {castMembers.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 card hover:border-slate-700 transition-all group">
              <div className="flex-1">
                <p className="font-semibold text-slate-200 text-sm">{c.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge-amber">{c.primaryRole}</span>
                  {c.nationality && <span className="text-xs text-slate-500">{c.nationality}</span>}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Cast Member' : 'Add Cast Member'}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', required: true, placeholder: 'e.g. Christopher Nolan' },
            { label: 'Nationality', key: 'nationality', type: 'text', placeholder: 'e.g. British-American' },
            { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
            { label: 'Profile Picture URL', key: 'profilePictureUrl', type: 'url', placeholder: 'https://...' },
          ].map(({ label, key, type, required, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={required} placeholder={placeholder} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Primary Role</label>
            <select value={form.primaryRole} onChange={e => setForm(f => ({ ...f, primaryRole: e.target.value }))} className="input-field cursor-pointer">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Biography</label>
            <textarea value={form.biography} onChange={e => setForm(f => ({ ...f, biography: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Short bio..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
