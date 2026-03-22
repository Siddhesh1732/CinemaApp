import { Link } from 'react-router-dom'
import { User, UserCheck, UserX, UserMinus } from 'lucide-react'

export default function FriendCard({ friendship, onAccept, onReject, onUnfriend, type = 'friend' }) {
  const avatarBg = `https://placehold.co/80x80/1E1E2E/F59E0B?text=${friendship.username?.[0]?.toUpperCase() || '?'}`

  return (
    <div className="flex items-center gap-4 p-4 bg-[#10101A] border border-[#1E1E2E] rounded-xl hover:border-slate-700 transition-all">
      {/* Avatar */}
      <img
        src={friendship.profilePictureUrl || avatarBg}
        alt={friendship.username}
        className="w-12 h-12 rounded-full object-cover border border-[#1E1E2E] flex-shrink-0"
        onError={(e) => { e.target.src = avatarBg }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/users/${friendship.username}`}>
          <p className="font-semibold text-slate-200 text-sm hover:text-amber-400 transition-colors">
            @{friendship.username}
          </p>
        </Link>
        {type === 'pending' && (
          <span className="text-xs text-slate-500">Sent you a friend request</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {type === 'pending' && (
          <>
            <button
              onClick={() => onAccept(friendship.userId)}
              className="flex items-center gap-1.5 btn-primary py-1.5 px-3 text-xs"
            >
              <UserCheck size={13} /> Accept
            </button>
            <button
              onClick={() => onReject(friendship.userId)}
              className="btn-danger py-1.5 px-3 text-xs"
            >
              <UserX size={13} />
            </button>
          </>
        )}
        {type === 'friend' && (
          <>
            <Link to={`/users/${friendship.username}`} className="btn-secondary py-1.5 px-3 text-xs">
              View Profile
            </Link>
            <button
              onClick={() => onUnfriend(friendship.userId)}
              className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <UserMinus size={13} /> Unfriend
            </button>
          </>
        )}
      </div>
    </div>
  )
}
