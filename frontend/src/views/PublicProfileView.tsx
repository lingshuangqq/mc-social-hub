import { useState, useEffect } from 'react'
import { MapPin, Briefcase, ArrowLeft, UserPlus, UserCheck } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../config'

interface Post {
    id: number
    title: string
    images: string[]
    author: { name: string, avatar_url: string }
}

interface UserProfile {
    user: {
        id: number
        name: string
        avatar_url: string
        bio?: string
        title?: string
        location?: string
    }
    stats: {
        posts: number
        following: number
        followers: number
    }
    is_following: boolean
}

interface Props {
    userId: number
    onBack: () => void
    onPostClick: (id: number) => void
}

const PublicProfileView = ({ userId, onBack, onPostClick }: Props) => {
  const [data, setData] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { token, user: currentUser } = useAuthStore()

  // If viewing self, we might want to redirect? 
  // But for now, just render it (button will be disabled or hidden).

  useEffect(() => {
      fetchProfile()
      fetchPosts()
  }, [userId])

  const fetchProfile = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
          setData(res.data)
      } catch (e) {
          console.error("Failed to fetch profile", e)
      }
  }

  const fetchPosts = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/posts`, { headers: { Authorization: `Bearer ${token}` } })
          setPosts(res.data)
      } catch (e) {
          console.error(e)
      } finally {
          setLoading(false)
      }
  }

  const handleFollowToggle = async () => {
      if (!data) return
      
      const oldIsFollowing = data.is_following
      // Optimistic update
      setData(prev => prev ? ({
          ...prev,
          is_following: !oldIsFollowing,
          stats: {
              ...prev.stats,
              followers: oldIsFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
          }
      }) : null)

      try {
          if (oldIsFollowing) {
              await axios.delete(`${API_BASE_URL}/api/users/${userId}/follow`, { headers: { Authorization: `Bearer ${token}` } })
          } else {
              await axios.post(`${API_BASE_URL}/api/users/${userId}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } })
          }
      } catch (e) {
          // Revert on error
          console.error(e)
          fetchProfile() // Refresh to be safe
      }
  }

  if (loading) return <div className="h-full flex items-center justify-center">Loading...</div>
  if (!data) return <div className="h-full flex items-center justify-center">User not found</div>

  const { user, stats, is_following } = data
  const isMe = currentUser?.id === user.id

  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-200">
       {/* Banner Area */}
       <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-900 relative">
           <button onClick={onBack} className="absolute top-4 left-4 text-white bg-black/20 p-2 rounded-full backdrop-blur-sm">
               <ArrowLeft className="w-5 h-5" />
           </button>
       </div>

       {/* Header Info */}
       <div className="px-4 relative mb-4">
           <div className="absolute -top-10 left-4">
               <img src={user.avatar_url} className="w-20 h-20 rounded-full border-4 border-white bg-gray-200" />
           </div>
           
           <div className="pt-12">
               <div className="flex items-center justify-between pr-4">
                   <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                   {!isMe && (
                       <button 
                           onClick={handleFollowToggle}
                           className={`px-6 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${
                               is_following 
                               ? 'border border-gray-300 text-gray-600 bg-white' 
                               : 'bg-mc-orange text-white border border-transparent'
                           }`}
                       >
                           {is_following ? (
                               <>
                                <UserCheck className="w-4 h-4" />
                                Following
                               </>
                           ) : (
                               <>
                                <UserPlus className="w-4 h-4" />
                                Follow
                               </>
                           )}
                       </button>
                   )}
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mb-3">
                   <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" /> {user.title || 'Master Concept'}</span>
                   <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {user.location || 'Hong Kong'}</span>
               </div>
               
               <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{user.bio || "No bio yet."}</p>
               
               <div className="flex gap-6 text-sm">
                   <div className="flex flex-col items-center">
                       <span className="font-bold text-gray-900">{stats.following}</span>
                       <span className="text-xs text-gray-500">Following</span>
                   </div>
                   <div className="flex flex-col items-center">
                       <span className="font-bold text-gray-900">{stats.followers}</span>
                       <span className="text-xs text-gray-500">Followers</span>
                   </div>
                   <div className="flex flex-col items-center">
                       <span className="font-bold text-gray-900">{stats.posts}</span>
                       <span className="text-xs text-gray-500">Posts</span>
                   </div>
               </div>
           </div>
       </div>

       {/* Simple Tab Header */}
       <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
           <div className="flex-1 py-3 text-sm font-bold text-center relative text-gray-900">
               Posts
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-mc-orange rounded-full" />
           </div>
       </div>

       {/* Content Grid */}
       <div className="flex-1 bg-gray-50 p-1 overflow-y-auto">
           {posts.length === 0 ? (
               <div className="py-20 text-center text-gray-400 text-sm">No posts yet.</div>
           ) : (
               <div className="grid grid-cols-2 gap-1">
                   {posts.map(post => (
                       <div 
                            key={post.id} 
                            onClick={() => onPostClick(post.id)}
                            className="aspect-[3/4] bg-white relative cursor-pointer"
                       >
                           {post.images && post.images.length > 0 && (
                               <img src={post.images[0]} className="w-full h-full object-cover" />
                           )}
                           {post.title && (
                               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                   <p className="text-white text-xs font-medium line-clamp-1">{post.title}</p>
                               </div>
                           )}
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  )
}

export default PublicProfileView
