import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Eye, Bookmark, Heart, UserPlus, UserMinus, UserCheck, Lock } from 'lucide-react'
import { getUserByUsername } from '../api/userApi'
import { getFriendList, sendRequest, unfriend, getMyFriends, getPendingRequests } from '../api/friendshipApi'
import { useAuth } from '../context/AuthContext'
import MovieListItem from '../components/MovieListItem'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

const TABS = [
  { key: 'WATCHED',   label: 'Watched',   Icon: Eye },
  { key: 'WATCHLIST', label: 'Watchlist', Icon: Bookmark },
  { key: 'LIKED',     label: 'Liked',     Icon: Heart },
]

export default function FriendProfilePage() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [friendship, setFriendship] = useState(null) // 'accepted' | 'pending' | null
  const [activeTab, setActiveTab] = useState('WATCHED')
  const [listData, setListData] = useState([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const profileRes = await getUserByUsername(username)
        setProfile(profileRes.data)

        // Check friendship status
        const [friendsRes, pendingRes] = await Promise.all([getMyFriends(), getPendingRequests()])
        const isFriend = friendsRes.data.some(f => f.username === username)
        const isPending = pendingRes.data.some(f => f.username === username)
        if (isFriend) setFriendship('accepted')
        else if (isPending) setFriendship('pending')
        else setFriendship(null)
      } catch {
        toast.error('User not found')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [username])

  const fetchList = async (tab, userId) => {
    setListLoading(true)
    try {
      const res = await getFriendList(userId, tab)
      setListData(res.data)
    } catch (err) {
      if (err.response?.status === 400) {
        setListData(null) // Not friends
      } else {
        toast.error('Failed to load list')
      }
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    if (profile && friendship === 'accepted') {
      fetchList(activeTab, profile.id)
    }
  }, [activeTab, profile, friendship])

  const handleSendRequest = async () => {
    try {
      await sendRequest(profile.id)
      setFriendship('pending')
      toast.success('Friend request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleUnfriend = async () => {
    try {
      await unfriend(profile.id)
      setFriendship(null)
      setListData([])
      toast.success('Unfriended')
    } catch {
      toast.error('Failed to unfriend')
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><Spinner text="Loading profile..." /></div>
  if (!profile) return null

  const isSelf = currentUser?.username === profile.username
  const avatar = profile.profilePictureUrl || `https://placehold.co/120x120/1E1E2E/F59E0B?text=${profile.username?.[0]?.toUpperCase()}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      {/* Profile card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5">
          <img src={avatar} alt={profile.username} className="w-20 h-20 rounded-full object-cover border-2 border-[#1E1E2E]"
               onError={(e) => { e.target.src = `https://placehold.co/80x80/1E1E2E/F59E0B?text=${profile.username?.[0]?.toUpperCase()}` }} />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-100 mb-1">@{profile.username}</h1>
            {profile.bio && <p className="text-sm text-slate-400 mb-3">{profile.bio}</p>}

            {!isSelf && (
              <div>
                {friendship === 'accepted' && (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                      <UserCheck size={14} /> Friends
                    </span>
                    <button onClick={handleUnfriend} className="btn-danger text-xs flex items-center gap-1.5">
                      <UserMinus size={13} /> Unfriend
                    </button>
                  </div>
                )}
                {friendship === 'pending' && (
                  <span className="flex items-center gap-1.5 text-amber-400 text-sm font-medium">
                    <UserPlus size={14} /> Request Sent
                  </span>
                )}
                {friendship === null && (
                  <button onClick={handleSendRequest} className="btn-primary text-sm flex items-center gap-2">
                    <UserPlus size={14} /> Add Friend
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lists section */}
      {isSelf ? (
        <div className="text-center py-12 text-slate-600">
          <p>This is your own profile. <a href="/profile" className="text-amber-400 hover:underline">Go to My Profile</a></p>
        </div>
      ) : friendship !== 'accepted' ? (
        <div className="card p-12 text-center">
          <Lock size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-500 font-medium">Lists are private</p>
          <p className="text-slate-600 text-sm mt-1">You must be friends to view {profile.username}'s movie lists</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${activeTab === key ? 'tab-btn-active' : 'tab-btn-inactive'} flex items-center gap-1.5`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {listLoading ? (
            <Spinner text="Loading list..." />
          ) : !listData || listData.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <p>Nothing in {profile.username}'s {activeTab.toLowerCase()} list</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listData.map(entry => (
                <MovieListItem key={entry.id} entry={entry} readonly />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
