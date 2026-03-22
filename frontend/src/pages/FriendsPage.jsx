import { useState, useEffect } from 'react'
import { Users, Bell } from 'lucide-react'
import { getMyFriends, getPendingRequests, acceptRequest, rejectRequest, unfriend } from '../api/friendshipApi'
import FriendCard from '../components/FriendCard'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'

export default function FriendsPage() {
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('friends')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [friendsRes, pendingRes] = await Promise.all([getMyFriends(), getPendingRequests()])
      setFriends(friendsRes.data)
      setPending(pendingRes.data)
    } catch {
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleAccept = async (requesterId) => {
    try {
      await acceptRequest(requesterId)
      const accepted = pending.find(f => f.userId === requesterId)
      setPending(prev => prev.filter(f => f.userId !== requesterId))
      if (accepted) setFriends(prev => [...prev, { ...accepted, status: 'ACCEPTED' }])
      toast.success('Friend request accepted!')
    } catch {
      toast.error('Failed to accept request')
    }
  }

  const handleReject = async (requesterId) => {
    try {
      await rejectRequest(requesterId)
      setPending(prev => prev.filter(f => f.userId !== requesterId))
      toast.success('Request rejected')
    } catch {
      toast.error('Failed to reject request')
    }
  }

  const handleUnfriend = async (userId) => {
    try {
      await unfriend(userId)
      setFriends(prev => prev.filter(f => f.userId !== userId))
      toast.success('Unfriended')
    } catch {
      toast.error('Failed to unfriend')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8">
        <h1 className="section-title mb-1">FRIENDS</h1>
        <p className="text-slate-500 text-sm">Manage your connections and friend requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`${activeTab === 'friends' ? 'tab-btn-active' : 'tab-btn-inactive'} flex items-center gap-2`}
        >
          <Users size={14} /> Friends
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'friends' ? 'bg-black/20' : 'bg-white/10'}`}>
            {friends.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`${activeTab === 'pending' ? 'tab-btn-active' : 'tab-btn-inactive'} flex items-center gap-2`}
        >
          <Bell size={14} /> Requests
          {pending.length > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{pending.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <Spinner text="Loading..." />
      ) : activeTab === 'friends' ? (
        friends.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No friends yet</p>
            <p className="text-sm mt-1">Search for users to send friend requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map(f => (
              <FriendCard key={f.friendshipId} friendship={f} type="friend" onUnfriend={handleUnfriend} />
            ))}
          </div>
        )
      ) : (
        pending.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <Bell size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No pending requests</p>
            <p className="text-sm mt-1">When someone sends you a friend request, it will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(f => (
              <FriendCard key={f.friendshipId} friendship={f} type="pending" onAccept={handleAccept} onReject={handleReject} />
            ))}
          </div>
        )
      )}
    </div>
  )
}
