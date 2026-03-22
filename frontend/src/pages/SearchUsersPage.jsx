import { useState } from 'react'
import { Search, User, UserPlus } from 'lucide-react'
import { searchUsers } from '../api/userApi'
import { sendRequest } from '../api/friendshipApi'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function SearchUsersPage() {
  const { user: currentUser } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sentRequests, setSentRequests] = useState(new Set())

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchUsers(query.trim())
      setResults(res.data.filter(u => u.username !== currentUser?.username))
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (userId, username) => {
    try {
      await sendRequest(userId)
      setSentRequests(prev => new Set([...prev, userId]))
      toast.success(`Friend request sent to @${username}!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8">
        <h1 className="section-title mb-1">SEARCH USERS</h1>
        <p className="text-slate-500 text-sm">Find people and connect with them</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-6 disabled:opacity-60">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {!searched ? (
        <div className="text-center py-16 text-slate-700">
          <Search size={48} className="mx-auto mb-3 opacity-40" />
          <p>Search for users by their username</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          <p>No users found for "{query}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(user => {
            const avatar = user.profilePictureUrl || `https://placehold.co/80x80/1E1E2E/F59E0B?text=${user.username?.[0]?.toUpperCase()}`
            const sent = sentRequests.has(user.id)
            return (
              <div key={user.id} className="flex items-center gap-4 p-4 card hover:border-slate-700 transition-all">
                <img src={avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-[#1E1E2E] flex-shrink-0"
                     onError={(e) => { e.target.src = `https://placehold.co/48x48/1E1E2E/F59E0B?text=${user.username?.[0]?.toUpperCase()}` }} />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 text-sm">@{user.username}</p>
                  {user.bio && <p className="text-xs text-slate-500 truncate mt-0.5">{user.bio}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/users/${user.username}`} className="btn-secondary py-1.5 px-3 text-xs">
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleSendRequest(user.id, user.username)}
                    disabled={sent}
                    className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg transition-all ${
                      sent
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    <UserPlus size={13} />
                    {sent ? 'Sent' : 'Add Friend'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
