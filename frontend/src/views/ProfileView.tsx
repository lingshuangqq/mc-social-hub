import { useState, useEffect } from 'react'
import { Settings, Share2, MapPin, Briefcase } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../config'

interface Post {
    id: number
    title: string
    images: string[]
    author: { name: string, avatar_url: string }
}

interface ProfileData {
    user: {
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
}

interface Props {
    onPostClick: (id: number) => void
    onSettingsClick: () => void
}

const ProfileView = ({ onPostClick, onSettingsClick }: Props) => {
  const [data, setData] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'collects' | 'likes'>('posts')
  const { token, user: storeUser } = useAuthStore()

  useEffect(() => {
      fetchProfile()
      fetchContent(activeTab)
  }, [activeTab, storeUser]) // Refresh when storeUser updates

  const fetchProfile = async () => {
      const res = await axios.get(`${API_BASE_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      setData(res.data)
  }

  const fetchContent = async (tab: string) => {
      let endpoint = '/api/users/me/posts'
      if (tab === 'collects') endpoint = '/api/users/me/collections'
      if (tab === 'likes') endpoint = '/api/users/me/likes'
      
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      setPosts(res.data)
  }

  if (!data) return <div className="h-full flex items-center justify-center">Loading...</div>

  const { user, stats } = data

  return (
    <div className="h-full flex flex-col bg-white">
       {/* Banner Area */}
       <div className="h-32 bg-gradient-to-r from-mc-navy to-blue-800 relative">
           <div className="absolute top-4 right-4 flex gap-3 text-white">
               <Share2 className="w-5 h-5" />
               <button onClick={onSettingsClick}><Settings className="w-5 h-5" /></button>
           </div>
       </div>

       {/* Header Info */}
       <div className="px-4 relative mb-4">
           <div className="absolute -top-10 left-4">
               <img src={user.avatar_url} className="w-20 h-20 rounded-full border-4 border-white bg-gray-200" />
           </div>
           
           <div className="pt-12">
               <div className="flex items-center justify-between pr-4">
                   <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                   {/* Edit Profile button removed - moved to Settings (Gear Icon) */}
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
                       <span className="font-bold text-gray-900">{stats.likes_collected}</span>
                       <span className="text-xs text-gray-500">Likes & Collects</span>
                   </div>
               </div>
           </div>
       </div>

       {/* Sticky Tabs */}
       <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
           <button 
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-3 text-sm font-bold text-center relative ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-400'}`}
           >
               My Posts
               {activeTab === 'posts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-mc-orange rounded-full" />}
           </button>
           <button 
                onClick={() => setActiveTab('likes')}
                className={`flex-1 py-3 text-sm font-bold text-center relative ${activeTab === 'likes' ? 'text-gray-900' : 'text-gray-400'}`}
           >
               Likes
               {activeTab === 'likes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-mc-orange rounded-full" />}
           </button>
           <button 
                onClick={() => setActiveTab('collects')}
                className={`flex-1 py-3 text-sm font-bold text-center relative ${activeTab === 'collects' ? 'text-gray-900' : 'text-gray-400'}`}
           >
               Collects
               {activeTab === 'collects' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-mc-orange rounded-full" />}
           </button>
       </div>

       {/* Content Grid */}
       <div className="flex-1 bg-gray-50 p-1 overflow-y-auto">
           {posts.length === 0 ? (
               <div className="py-20 text-center text-gray-400 text-sm">Nothing here yet.</div>
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

export default ProfileView
