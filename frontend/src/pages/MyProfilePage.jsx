import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Bookmark, Heart, Edit2, Save, X, User, Lock, UserPlus, UserCheck, UserMinus, Search, Bell, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getMyProfile, updateMyProfile, getUserByUsername, searchUsers } from '../api/userApi'
import { getAllMyLists, removeFromList } from '../api/userMovieListApi'
import { getMyFriends, getPendingRequests, acceptRequest, rejectRequest, unfriend, sendRequest, getFriendList } from '../api/friendshipApi'
import { useAuth } from '../context/AuthContext'
import { MovieListItem, FriendCard } from '../components/Cards'
import { Spinner, GlassPanel } from '../components/UI'
import { toast } from 'react-toastify'

const TABS = [
  { key: 'watched',   label: 'WATCHED',   Icon: Eye      },
  { key: 'watchlist', label: 'WATCHLIST', Icon: Bookmark },
  { key: 'liked',     label: 'LIKED',     Icon: Heart    },
]

// ── Shared page wrapper ────────────────────────────────────────────────────
function PageWrapper({ children }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="fixed inset-0 grid-bg opacity-15 pointer-events-none" />
      {children}
    </div>
  )
}

// ── AnimatedTabs ───────────────────────────────────────────────────────────
function AnimatedTabs({ tabs, active, onChange, counts = {} }) {
  return (
    <div className="flex gap-2 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      {tabs.map(({ key, label, Icon }) => (
        <motion.button
          key={key} onClick={() => onChange(key)} layout
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono tracking-widest transition-all duration-300 flex-1 justify-center ${
            active === key ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          {active === key && (
            <motion.div layoutId="tabBg" className="absolute inset-0 rounded-xl"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
          <Icon size={13} className="relative" />
          <span className="relative">{label}</span>
          {counts[key] !== undefined && (
            <span className={`relative text-xs px-1.5 py-0.5 rounded-full font-mono ${active === key ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/5 text-slate-700'}`}>
              {counts[key]}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  )
}

// ── MyProfilePage ──────────────────────────────────────────────────────────
export function MyProfilePage() {
  const { updateUser } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [lists, setLists]       = useState({ watched: [], watchlist: [], liked: [] })
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActive]  = useState('watched')
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({ bio: '', profilePictureUrl: '' })
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    Promise.all([getMyProfile(), getAllMyLists()]).then(([p, l]) => {
      setProfile(p.data); setLists(l.data)
      setForm({ bio: p.data.bio || '', profilePictureUrl: p.data.profilePictureUrl || '' })
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateMyProfile(form)
      setProfile(res.data); updateUser(res.data); setEditing(false)
      toast.success('Profile updated')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handleRemove = async (movieId, listType) => {
    try {
      await removeFromList(movieId, listType)
      setLists(prev => ({ ...prev, [listType.toLowerCase()]: prev[listType.toLowerCase()].filter(e => e.movieId !== movieId) }))
      toast.success('Removed')
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageWrapper><Spinner text="LOADING PROFILE" /></PageWrapper>

  const avatar = profile?.profilePictureUrl || `https://placehold.co/120x120/0B0F1A/06B6D4?text=${profile?.username?.[0]?.toUpperCase()}`
  const activeList = lists[activeTab] || []

  return (
    <PageWrapper>
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="p-6 rounded-2xl mb-6"
        style={{ background: 'rgba(11,15,26,0.8)', border: '1px solid rgba(6,182,212,0.1)', boxShadow: '0 0 40px rgba(6,182,212,0.05)' }}
      >
        <div className="flex items-start gap-5">
          <div className="relative">
            <img src={avatar} alt={profile?.username}
                 className="w-20 h-20 rounded-2xl object-cover"
                 style={{ border: '1px solid rgba(6,182,212,0.2)' }}
                 onError={e => { e.target.src = `https://placehold.co/80x80/0B0F1A/06B6D4?text=${profile?.username?.[0]?.toUpperCase()}` }} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400"
                 style={{ border: '2px solid #050508', boxShadow: '0 0 8px rgba(74,222,128,0.6)' }} />
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Your bio..." className="input-field text-sm" />
                <input value={form.profilePictureUrl} onChange={e => setForm(f => ({ ...f, profilePictureUrl: e.target.value }))}
                  placeholder="Profile picture URL..." className="input-field text-sm" />
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.02 }} onClick={handleSave} disabled={saving}
                    className="btn-primary text-xs flex items-center gap-1.5 py-2 disabled:opacity-40">
                    <Save size={12} /> {saving ? 'SAVING...' : 'SAVE'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setEditing(false)} className="btn-ghost text-xs py-2 flex items-center gap-1.5">
                    <X size={12} /> CANCEL
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-display text-xl tracking-widest text-white">@{profile?.username}</h1>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Edit2 size={12} />
                  </motion.button>
                </div>
                <p className="font-mono text-xs text-slate-600 mb-2">{profile?.email}</p>
                {profile?.bio
                  ? <p className="text-sm text-slate-400 font-light">{profile.bio}</p>
                  : <button onClick={() => setEditing(true)} className="font-mono text-xs text-slate-700 hover:text-cyan-400 transition-colors">
                      + ADD BIO
                    </button>
                }
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5"
             style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {TABS.map(({ key, label, Icon }) => (
            <div key={key} className="text-center">
              <motion.div whileHover={{ scale: 1.1 }}
                className="text-2xl font-display font-bold mb-1"
                style={{ color: '#06B6D4', textShadow: '0 0 20px rgba(6,182,212,0.5)' }}>
                {lists[key]?.length || 0}
              </motion.div>
              <div className="flex items-center justify-center gap-1 font-mono text-xs text-slate-600">
                <Icon size={10} /> {label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs + list */}
      <AnimatedTabs tabs={TABS} active={activeTab} onChange={setActive}
        counts={{ watched: lists.watched?.length, watchlist: lists.watchlist?.length, liked: lists.liked?.length }} />

      <AnimatePresence mode="wait">
        {activeList.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-16 text-slate-800">
            <User size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-display tracking-widest text-sm">LIST IS EMPTY</p>
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} className="space-y-2">
            {activeList.map(entry => (
              <MovieListItem key={entry.id} entry={entry} listType={activeTab.toUpperCase()} onRemove={handleRemove} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}

// ── FriendsPage ────────────────────────────────────────────────────────────
export function FriendsPage() {
  const [friends, setFriends]   = useState([])
  const [pending, setPending]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [active, setActive]     = useState('friends')

  useEffect(() => {
    Promise.all([getMyFriends(), getPendingRequests()]).then(([f, p]) => {
      setFriends(f.data); setPending(p.data)
    }).catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }, [])

  const handleAccept = async (id) => {
    try {
      await acceptRequest(id)
      const acc = pending.find(f => f.userId === id)
      setPending(prev => prev.filter(f => f.userId !== id))
      if (acc) setFriends(prev => [...prev, { ...acc, status: 'ACCEPTED' }])
      toast.success('Friend added!')
    } catch { toast.error('Failed') }
  }
  const handleReject  = async (id) => { try { await rejectRequest(id); setPending(prev => prev.filter(f => f.userId !== id)); toast.success('Rejected') } catch { toast.error('Failed') } }
  const handleUnfriend = async (id) => { try { await unfriend(id); setFriends(prev => prev.filter(f => f.userId !== id)); toast.success('Unfriended') } catch { toast.error('Failed') } }

  const networkTabs = [
    { key: 'friends', label: 'FRIENDS', Icon: Users },
    { key: 'pending', label: 'REQUESTS', Icon: Bell  },
  ]

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Users size={16} className="text-cyan-400" />
          <h1 className="font-display text-2xl tracking-widest text-slate-200">NETWORK</h1>
        </div>
        <div className="hud-line max-w-xs" />
      </motion.div>

      <AnimatedTabs tabs={networkTabs} active={active} onChange={setActive}
        counts={{ friends: friends.length, pending: pending.length }} />

      {loading ? <Spinner text="LOADING" /> : (
        <AnimatePresence mode="wait">
          {active === 'friends' ? (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center py-16 text-slate-800">
                  <Users size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-display tracking-widest text-sm">NO CONNECTIONS YET</p>
                </div>
              ) : friends.map(f => <FriendCard key={f.friendshipId} friendship={f} type="friend" onUnfriend={handleUnfriend} />)}
            </motion.div>
          ) : (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {pending.length === 0 ? (
                <div className="text-center py-16 text-slate-800">
                  <Bell size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-display tracking-widest text-sm">NO PENDING REQUESTS</p>
                </div>
              ) : pending.map(f => <FriendCard key={f.friendshipId} friendship={f} type="pending" onAccept={handleAccept} onReject={handleReject} />)}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </PageWrapper>
  )
}

// ── SearchUsersPage ────────────────────────────────────────────────────────
export function SearchUsersPage() {
  const { user: me } = useAuth()
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [sentSet, setSentSet]   = useState(new Set())

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res = await searchUsers(query.trim())
      setResults(res.data.filter(u => u.username !== me?.username))
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  const handleAdd = async (userId, username) => {
    try {
      await sendRequest(userId)
      setSentSet(prev => new Set([...prev, userId]))
      toast.success(`Request sent to @${username}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Search size={16} className="text-cyan-400" />
          <h1 className="font-display text-2xl tracking-widest text-slate-200">DISCOVER USERS</h1>
        </div>
        <div className="hud-line max-w-xs" />
      </motion.div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="SEARCH BY USERNAME..." className="input-field pl-11 font-mono text-sm tracking-wide" />
        </div>
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={loading} className="btn-primary px-6 text-xs tracking-widest disabled:opacity-40">
          {loading ? '...' : 'SEARCH'}
        </motion.button>
      </form>

      {!searched ? (
        <div className="text-center py-20 text-slate-800">
          <Search size={48} className="mx-auto mb-3 opacity-15" />
          <p className="font-mono text-xs tracking-widest">SEARCH TO FIND USERS</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-slate-800">
          <User size={48} className="mx-auto mb-3 opacity-15" />
          <p className="font-display tracking-widest text-sm">NO USERS FOUND</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((user, i) => {
            const avatar = user.profilePictureUrl || `https://placehold.co/48x48/0B0F1A/06B6D4?text=${user.username?.[0]?.toUpperCase()}`
            const sent   = sentSet.has(user.id)
            return (
              <motion.div key={user.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                whileHover={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)' }}
              >
                <img src={avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                     style={{ border: '1px solid rgba(6,182,212,0.15)' }}
                     onError={e => { e.target.src = `https://placehold.co/44x44/0B0F1A/06B6D4?text=${user.username?.[0]?.toUpperCase()}` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-slate-300">@{user.username}</p>
                  {user.bio && <p className="text-xs text-slate-600 truncate mt-0.5">{user.bio}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/users/${user.username}`}>
                    <motion.button whileHover={{ scale: 1.03 }} className="btn-ghost text-xs py-2 px-3 font-mono">VIEW</motion.button>
                  </Link>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleAdd(user.id, user.username)} disabled={sent}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                      sent ? 'text-green-400 cursor-not-allowed' : 'text-white'
                    }`}
                    style={sent
                      ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }
                      : { background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)', boxShadow: '0 0 15px rgba(6,182,212,0.3)' }
                    }>
                    <UserPlus size={12} /> {sent ? 'SENT' : 'ADD'}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}

// ── FriendProfilePage ──────────────────────────────────────────────────────
export function FriendProfilePage() {
  const { username } = useParams()
  const { user: me } = useAuth()
  const [profile, setProfile]         = useState(null)
  const [friendStatus, setStatus]     = useState(null)
  const [activeTab, setActive]        = useState('WATCHED')
  const [listData, setListData]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const profileRes = await getUserByUsername(username)
        setProfile(profileRes.data)
        const [fr, pr] = await Promise.all([getMyFriends(), getPendingRequests()])
        if (fr.data.some(f => f.username === username)) setStatus('accepted')
        else if (pr.data.some(f => f.username === username)) setStatus('pending')
        else setStatus(null)
      } catch { toast.error('User not found') }
      finally { setLoading(false) }
    }
    init()
  }, [username])

  const fetchList = async (tab) => {
    if (!profile || friendStatus !== 'accepted') return
    setListLoading(true)
    try {
      const res = await getFriendList(profile.id, tab)
      setListData(res.data)
    } catch { setListData([]) }
    finally { setListLoading(false) }
  }

  useEffect(() => { fetchList(activeTab) }, [activeTab, profile, friendStatus])

  const handleAdd     = async () => { try { await sendRequest(profile.id); setStatus('pending'); toast.success('Request sent!') } catch (err) { toast.error(err.response?.data?.message || 'Failed') } }
  const handleUnfriend = async () => { try { await unfriend(profile.id); setStatus(null); setListData([]); toast.success('Unfriended') } catch { toast.error('Failed') } }

  if (loading) return <PageWrapper><Spinner text="LOADING" /></PageWrapper>
  if (!profile) return null

  const isSelf = me?.username === profile.username
  const avatar = profile.profilePictureUrl || `https://placehold.co/80x80/0B0F1A/06B6D4?text=${profile.username?.[0]?.toUpperCase()}`

  const listTabs = [
    { key: 'WATCHED',   label: 'WATCHED',   Icon: Eye      },
    { key: 'WATCHLIST', label: 'WATCHLIST', Icon: Bookmark },
    { key: 'LIKED',     label: 'LIKED',     Icon: Heart    },
  ]

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl mb-6"
        style={{ background: 'rgba(11,15,26,0.8)', border: '1px solid rgba(6,182,212,0.1)' }}
      >
        <div className="flex items-center gap-5">
          <img src={avatar} alt={profile.username} className="w-20 h-20 rounded-2xl object-cover"
               style={{ border: '1px solid rgba(6,182,212,0.2)' }}
               onError={e => { e.target.src = `https://placehold.co/80x80/0B0F1A/06B6D4?text=${profile.username?.[0]?.toUpperCase()}` }} />
          <div className="flex-1">
            <h1 className="font-display text-xl tracking-widest text-white mb-1">@{profile.username}</h1>
            {profile.bio && <p className="text-sm text-slate-500 font-light mb-3">{profile.bio}</p>}
            {!isSelf && (
              friendStatus === 'accepted' ? (
                <div className="flex gap-3 items-center">
                  <span className="flex items-center gap-1.5 font-mono text-xs text-green-400"><UserCheck size={12} /> CONNECTED</span>
                  <motion.button whileHover={{ scale: 1.03 }} onClick={handleUnfriend} className="btn-danger text-xs flex items-center gap-1 py-1.5">
                    <UserMinus size={11} /> DISCONNECT
                  </motion.button>
                </div>
              ) : friendStatus === 'pending' ? (
                <span className="font-mono text-xs text-amber-400 flex items-center gap-1.5"><UserPlus size={12} /> REQUEST SENT</span>
              ) : (
                <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(6,182,212,0.4)' }}
                  onClick={handleAdd} className="btn-primary text-xs flex items-center gap-1.5">
                  <UserPlus size={12} /> CONNECT
                </motion.button>
              )
            )}
          </div>
        </div>
      </motion.div>

      {isSelf ? (
        <div className="text-center py-12 text-slate-700">
          <p className="font-mono text-xs">THIS IS YOUR PROFILE — <Link to="/profile" className="text-cyan-400 hover:underline">GO TO MY PROFILE</Link></p>
        </div>
      ) : friendStatus !== 'accepted' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-12 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Lock size={40} className="mx-auto mb-3 text-slate-800" />
          <p className="font-display tracking-widest text-sm text-slate-700">LISTS ARE PRIVATE</p>
          <p className="font-mono text-xs text-slate-800 mt-1">CONNECT TO VIEW {profile.username.toUpperCase()}'S LISTS</p>
        </motion.div>
      ) : (
        <>
          <AnimatedTabs tabs={listTabs} active={activeTab} onChange={setActive} />
          {listLoading ? <Spinner text="LOADING" /> : listData.length === 0 ? (
            <div className="text-center py-16 text-slate-800">
              <p className="font-display tracking-widest text-sm">EMPTY LIST</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listData.map(e => <MovieListItem key={e.id} entry={e} readonly />)}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}

export default MyProfilePage
