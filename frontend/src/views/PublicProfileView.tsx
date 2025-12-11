import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Briefcase, Share2 } from 'lucide-react'
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
        email: string
        bio?: string
        title?: string
        location?: string
    }
    stats: {
        posts: number
        following: number
        followers: number
        likes_collected: number
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
  const { token, user: currentUser } = useAuthStore()

  useEffect(() => {
      fetchProfile()
      fetchPosts()
  }, [userId])

  const fetchProfile = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          setData(res.data)
      } catch (e) {
          console.error("Failed to fetch profile", e)
      }
  }

  const fetchPosts = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/api/users/${userId}/posts`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          setPosts(res.data)
      } catch (e) {
          console.error("Failed to fetch user posts", e)
      }
  }

  const handleFollow = async () => {
      if (!data) return
      
      const originalState = data.is_following
      // Optimistic update
      setData(prev => prev ? {
          ...prev, 
          is_following: !prev.is_following,
          stats: {
              ...prev.stats,
              followers: prev.is_following ? prev.stats.followers - 1 : prev.stats.followers + 1
          }
      } : null)

      try {
          if (originalState) {
              await axios.delete(`${API_BASE_URL}/api/users/${userId}/follow`, { headers: { Authorization: `Bearer ${token}` } })
          } else {
              await axios.post(`${API_BASE_URL}/api/users/${userId}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } })
          }
      } catch (e) {
          console.error("Follow action failed", e)
          // Revert on error (could be improved)
          fetchProfile() 
      }
  }

  if (!data) return <div className="h-full flex items-center justify-center">Loading...</div>

  const { user, stats, is_following } = data
  const isMe = currentUser?.id === user.id

  const getThumbnailUrl = (url: string) => {
      if (!url) return '';
      if (url.endsWith('.webp')) {
          return url.replace('.webp', '_thumb.webp');
      }
      return url;
  }

  return (
    <div className="h-full flex flex-col bg-white animate-in slide-in-from-right duration-300">
       {/* Banner Area */}
       <div className="h-32 bg-gradient-to-r from-mc-navy to-blue-800 relative">
           <button 
                onClick={onBack}
                className="absolute top-4 left-4 text-white p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
           >
               <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="absolute top-4 right-4 flex gap-3 text-white">
               <Share2 className="w-5 h-5" />
           </div>
       </div>

       {/* Header Info */}
       <div className="px-4 relative mb-4">
           <div className="absolute -top-10 left-4">
               <img src={user.avatar_url} className="w-20 h-20 rounded-full border-4 border-white bg-gray-200" />
           </div>
           
           <div className="pt-12">
               <div className="flex items-start justify-between pr-0">
                   <div>
                        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mb-2">
                            <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" /> {user.title || 'Master Concept'}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {user.location || 'Hong Kong'}</span>
                        </div>
                   </div>
                   
                   {!isMe && (
                       <button 
                           onClick={handleFollow}
                           className={`
                                px-6 py-1.5 rounded-full text-sm font-bold transition-all
                                ${is_following 
                                    ? 'bg-gray-100 text-gray-600 border border-gray-200' 
                                    : 'bg-mc-orange text-white shadow-sm hover:opacity-90'
                                }
                           `}
                       >
                           {is_following ? 'Following' : 'Follow'}
                       </button>
                   )}
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
                       <span className="font-bold text-gray-900">{stats.likes_collected}</span>
                       <span className="text-xs text-gray-500">Likes & Collects</span>
                   </div>
               </div>
           </div>
       </div>

       {/* Tabs (Simplified for Public View - Just "Posts") */}
       <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
           <button className="flex-1 py-3 text-sm font-bold text-center relative text-gray-900">
               Posts
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-mc-orange rounded-full" />
           </button>
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
                           {post.images && post.images.length > 0 ? (
                               <img 
                                    src={getThumbnailUrl(post.images[0])} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        if (e.currentTarget.src.includes('_thumb')) {
                                            e.currentTarget.src = post.images[0]
                                        }
                                    }}
                               />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-xs">Text</div>
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