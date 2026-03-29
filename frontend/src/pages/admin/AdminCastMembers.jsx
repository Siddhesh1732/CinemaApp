import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronLeft, Search, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAllCastMembers, searchCastMembers, createCastMember, updateCastMember, deleteCastMember } from '../../api/castMemberApi'
import { BlurModal, Spinner, GradientButton } from '../../components/UI'
import { toast } from 'react-toastify'

const ROLES = ['ACTOR', 'DIRECTOR', 'WRITER', 'PRODUCER', 'COMPOSER', 'CINEMATOGRAPHER']
const ROLE_COLORS = {
  ACTOR: '#06B6D4', DIRECTOR: '#8B5CF6', WRITER: '#F59E0B',
  PRODUCER: '#10B981', COMPOSER: '#F43F5E', CINEMATOGRAPHER: '#64748B',
}
const emptyForm = { name: '', primaryRole: 'ACTOR', dateOfBirth: '', nationality: '', biography: '', profilePictureUrl: '' }

export default function AdminCastMembers() {
  const [cast, setCast]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)

  const fetchAll = async () => {
    try { const r = await getAllCastMembers(0, 50); setCast(r.data.content || []) }
    catch { toast.error('Failed') } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) { fetchAll(); return }
    setLoading(true)
    try { const r = await searchCastMembers(search); setCast(r.data) }
    catch { toast.error('Search failed') } finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (c) => {
    setEditing(c)
    setForm({ name: c.name, primaryRole: c.primaryRole, dateOfBirth: c.dateOfBirth || '',
              nationality: c.nationality || '', biography: c.biography || '', profilePictureUrl: c.profilePictureUrl || '' })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, dateOfBirth: form.dateOfBirth || null }
    try {
      if (editing) {
        const r = await updateCastMember(editing.id, payload)
        setCast(prev => prev.map(c => c.id === editing.id ? r.data : c))
        toast.success('Updated')
      } else {
        const r = await createCastMember(payload)
        setCast(prev => [...prev, r.data])
        toast.success('Created')
      }
      setModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this person?')) return
    try { await deleteCastMember(id); setCast(prev => prev.filter(c => c.id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            <h1 className="font-display text-xl tracking-widest text-white">CAST & CREW</h1>
            <p className="font-mono text-xs text-slate-600 mt-0.5">{cast.length} PEOPLE</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
          whileTap={{ scale: 0.97 }} onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs tracking-widest">
          <Plus size={14} /> ADD PERSON
        </motion.button>
      </motion.div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH BY NAME..." className="input-field pl-11 font-mono text-sm tracking-wide" />
        </div>
        <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-ghost text-xs font-mono tracking-widest px-5">
          SEARCH
        </motion.button>
      </form>

      {loading ? <Spinner text="LOADING" /> : (
        <div className="space-y-2">
          {cast.map((c, i) => {
            const roleColor = ROLE_COLORS[c.primaryRole] || '#64748B'
            return (
              <motion.div key={c.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ background: `rgba(${roleColor === '#06B6D4' ? '6,182,212' : '139,92,246'},0.04)`, borderColor: `${roleColor}30` }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${roleColor}15`, border: `1px solid ${roleColor}30` }}>
                  <User size={14} style={{ color: roleColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-slate-300">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ background: `${roleColor}15`, border: `1px solid ${roleColor}30`, color: roleColor }}>
                      {c.primaryRole}
                    </span>
                    {c.nationality && <span className="text-xs text-slate-700 font-mono">{c.nationality}</span>}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEdit(c)}
                    className="p-2 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors"
                    style={{ background: 'rgba(6,182,212,0.08)' }}>
                    <Pencil size={13} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
                    style={{ background: 'rgba(244,63,94,0.08)' }}>
                    <Trash2 size={13} />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <BlurModal isOpen={modalOpen} onClose={() => setModal(false)} title={editing ? 'EDIT PERSON' : 'ADD PERSON'}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'FULL NAME *',          key: 'name',              type: 'text',   placeholder: 'Christopher Nolan',         required: true },
            { label: 'NATIONALITY',           key: 'nationality',       type: 'text',   placeholder: 'British-American'                          },
            { label: 'DATE OF BIRTH',         key: 'dateOfBirth',       type: 'date',   placeholder: ''                                          },
            { label: 'PROFILE PICTURE URL',   key: 'profilePictureUrl', type: 'url',    placeholder: 'https://...'                               },
          ].map(({ label, key, type, placeholder, required }) => (
            <div key={key}>
              <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={required} placeholder={placeholder} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">PRIMARY ROLE *</label>
            <select value={form.primaryRole} onChange={e => setForm(f => ({ ...f, primaryRole: e.target.value }))}
              className="input-field cursor-pointer font-mono text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs text-slate-500 tracking-widest mb-2">BIOGRAPHY</label>
            <textarea value={form.biography} onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
              rows={3} placeholder="Short biography..." className="input-field resize-none text-sm font-light" />
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
