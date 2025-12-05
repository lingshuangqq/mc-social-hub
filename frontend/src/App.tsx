import { useState, useEffect } from 'react'
import { useAuthStore } from './store/auth'
import LoginView from './views/LoginView'
import CreatePostModal from './views/CreatePostModal'
import PostDetailModal from './views/PostDetailModal'
import ProfileView from './views/ProfileView'
import MasonryGrid from './components/MasonryGrid'
import { LayoutGrid, User, Search, X } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from './config'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { name: string, avatar_url: string }
}

function App() {
  const user = useAuthStore(state => state.user)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
      if (user && activeTab === 'feed' && !searchQuery) {
          axios.get(`${API_BASE_URL}/api/feed`).then(res => {
              setPosts(res.data)
          })
      }
  }, [user, refreshKey, activeTab])

  const handleSearch = async (e?: React.FormEvent) => {
      e?.preventDefault()
      setIsSearching(true)
      try {
          const endpoint = searchQuery.trim() 
            ? `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`
            : `${API_BASE_URL}/api/feed`
            
          const res = await axios.get(endpoint)
          setPosts(res.data)
      } catch (error) {
          console.error("Search failed", error)
      } finally {
          setIsSearching(false)
      }
  }

  const clearSearch = () => {
      setSearchQuery('')
      setRefreshKey(k => k + 1) // Trigger feed reload
  }

  if (!user) {
    return <LoginView />
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
       {/* Only show global header in Feed tab */}
       {activeTab === 'feed' && (
           <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100 gap-3">
               <div className="flex-1 relative">
                   <form onSubmit={handleSearch} className="relative">
                       <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                       <input 
                           type="text" 
                           placeholder="Search MC Hub..." 
                           className="w-full bg-gray-100 text-sm py-2 pl-9 pr-8 rounded-full focus:outline-none focus:ring-1 focus:ring-mc-navy/20"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                       />
                       {searchQuery && (
                           <button 
                               type="button"
                               onClick={clearSearch}
                               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                           >
                               <X className="w-4 h-4" />
                           </button>
                       )}
                   </form>
               </div>
               <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
           </header>
       )}

       <main className="flex-1 overflow-y-auto p-0 scrollbar-hide">
           {activeTab === 'feed' ? (
               <div className="p-2">
                   {isSearching ? (
                       <div className="flex justify-center py-10">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mc-orange"></div>
                       </div>
                   ) : posts.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                           <p>{searchQuery ? 'No results found' : 'No posts yet'}</p>
                           {!searchQuery && <p className="text-xs mt-1">Be the first to share!</p>}
                       </div>
                   ) : (
                       <MasonryGrid posts={posts} onPostClick={setSelectedPostId} />
                   )}
               </div>
           ) : (
               <ProfileView onPostClick={setSelectedPostId} />
           )}
       </main>

       <nav className="bg-white border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center h-16 shrink-0 z-20">
           <button 
                onClick={() => setActiveTab('feed')}
                className={`flex flex-col items-center ${activeTab === 'feed' ? 'text-mc-navy' : 'text-gray-400'}`}
           >
               <LayoutGrid className="w-6 h-6" />
               <span className="text-[10px] font-medium mt-1">Feed</span>
           </button>
           
           <button 
                onClick={() => setIsCreating(true)}
                className="flex items-center justify-center w-12 h-12 bg-mc-orange text-white rounded-full shadow-lg shadow-mc-orange/30 -mt-6 hover:scale-105 transition-transform active:scale-95"
           >
               <span className="text-2xl font-light mb-1">+</span>
           </button>
           
           <button 
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-mc-navy' : 'text-gray-400'}`}
           >
               <User className="w-6 h-6" />
               <span className="text-[10px] font-medium mt-1">Me</span>
           </button>
       </nav>

       {isCreating && (
           <CreatePostModal 
               onClose={() => setIsCreating(false)} 
               onSuccess={() => setRefreshKey(k => k + 1)} 
           />
       )}

       {selectedPostId && (
           <PostDetailModal 
               postId={selectedPostId}
               onClose={() => setSelectedPostId(null)}
           />
       )}
    </div>
  )
}

export default App
