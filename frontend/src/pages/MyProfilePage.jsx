import { useState, useEffect } from 'react'
import { User, Edit2, Save, X, Eye, Bookmark, Heart } from 'lucide-react'
import { getMyProfile, updateMyProfile } from '../api/userApi'
import { getAllMyLists, removeFromList } from '../api/userMovieListApi'
import { useAuth } from '../context/AuthContext'
import MovieListItem from '../components/MovieListItem'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

const TABS = [
  { key: 'watched',   label: 'Watched',   Icon: Eye },
  { key: 'watchlist', label: 'Watchlist', Icon: Bookmark },
  { key: 'liked',     label: 'Liked',     Icon: Heart },
]

export default function MyProfilePage() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [lists, setLists] = useState({ watched: [], watchlist: [], liked: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('watched')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ bio: '', profilePictureUrl: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [profileRes, listsRes] = await Promise.all([getMyProfile(), getAllMyLists()])
        setProfile(profileRes.data)
        setLists(listsRes.data)
        setForm({ bio: profileRes.data.bio || '', profilePictureUrl: profileRes.data.profilePictureUrl || '' })
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateMyProfile(form)
      setProfile(res.data)
      updateUser(res.data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (movieId, listType) => {
    try {
      await removeFromList(movieId, listType)
      setLists(prev => ({
        ...prev,
        [listType.toLowerCase()]: prev[listType.toLowerCase()].filter(e => e.movieId !== movieId)
      }))
      toast.success('Removed from list')
    } catch {
      toast.error('Failed to remove')
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><Spinner text="Loading profile..." /></div>

  const avatar = profile?.profilePictureUrl || `https://placehold.co/120x120/1E1E2E/F59E0B?text=${profile?.username?.[0]?.toUpperCase()}`
  const activeList = lists[activeTab] || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">

      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <img src={avatar} alt={profile?.username} className="w-20 h-20 rounded-full object-cover border-2 border-[#1E1E2E]"
               onError={(e) => { e.target.src = `https://placehold.co/80x80/1E1E2E/F59E0B?text=${profile?.username?.[0]?.toUpperCase()}` }} />

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Write a bio..."
                  maxLength={255}
                  className="input-field text-sm"
                />
                <input
                  value={form.profilePictureUrl}
                  onChange={e => setForm(f => ({ ...f, profilePictureUrl: e.target.value }))}
                  placeholder="Profile picture URL..."
                  className="input-field text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold text-slate-100">@{profile?.username}</h1>
                  <button onClick={() => setEditing(true)} className="text-slate-600 hover:text-amber-400 transition-colors p-1 rounded-lg hover:bg-amber-500/10">
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-3">{profile?.email}</p>
                {profile?.bio ? (
                  <p className="text-sm text-slate-400">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-slate-600 italic">No bio yet. <button onClick={() => setEditing(true)} className="text-amber-500 hover:underline">Add one</button></p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#1E1E2E]">
          {TABS.map(({ key, label, Icon }) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{lists[key]?.length || 0}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Icon size={11} /> {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`${activeTab === key ? 'tab-btn-active' : 'tab-btn-inactive'} flex items-center gap-1.5`}
          >
            <Icon size={14} /> {label}
            <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-black/20' : 'bg-white/10'}`}>
              {lists[key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* List content */}
      {activeList.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nothing in your {activeTab} list yet</p>
          <p className="text-sm mt-1">Head to Explore to find movies</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeList.map(entry => (
            <MovieListItem
              key={entry.id}
              entry={entry}
              listType={activeTab.toUpperCase()}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
