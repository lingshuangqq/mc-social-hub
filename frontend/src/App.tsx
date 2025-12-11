import { useState, useEffect } from 'react'
import { useAuthStore } from './store/auth'
import LoginView from './views/LoginView'
import CreatePostModal from './views/CreatePostModal'
import PostDetailModal from './views/PostDetailModal'
import PublicProfileView from './views/PublicProfileView'
import ProfileView from './views/ProfileView'
import ExploreView from './views/ExploreView'
import MasonryGrid from './components/MasonryGrid'
import BottomNav from './components/BottomNav'
import SettingsView from './views/SettingsView'
import NotificationsView from './views/NotificationsView'
import { Search, X } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from './config'
import InfiniteScroll from 'react-infinite-scroll-component'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { name: string, avatar_url: string }
}

const PAGE_SIZE = 10;

// Define tabs explicitly
type ActiveTab = 'feed' | 'explore' | 'profile' | 'settings' | 'notifications';

function App() {
  const user = useAuthStore(state => state.user)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const [publicProfileId, setPublicProfileId] = useState<number | null>(null)
  
  // Feed State
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  
  const [refreshKey, setRefreshKey] = useState(0)
  // Explicitly type the state
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotificationsCount = async () => {
      if (!user) return
      try {
          const res = await axios.get(`${API_BASE_URL}/api/notifications?limit=1`, {
             // We just need the count, limit 1 saves bandwidth
          })
          // Wait, backend returns { items: [], unread_count: 5 }
          setUnreadCount(res.data.unread_count)
      } catch (e) {
          // silent fail
      }
  }

  // Combined Feed & Search Logic
  useEffect(() => {
      if (!user) return

      // Only auto-load for 'feed' tab here. 'explore' handles its own loading.
      if (activeTab === 'feed') {
          if (searchQuery) {
              setIsSearching(true)
              axios.get(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`)
                  .then(res => {
                      setPosts(res.data)
                      setHasMore(false) // Search endpoint doesn't support pagination yet
                  })
                  .catch(err => console.error(err))
                  .finally(() => setIsSearching(false))
          } else {
              // Load normal feed (init or reset from search)
              loadPosts(true)
          }
          // Poll notifications
          fetchNotificationsCount()
      }
  }, [user, refreshKey, activeTab, searchQuery])

  const loadPosts = async (reset = false) => {
      if (!user) return
      
      const currentPage = reset ? 0 : page
      const offset = currentPage * PAGE_SIZE
      
      try {
          const res = await axios.get(`${API_BASE_URL}/api/feed?limit=${PAGE_SIZE}&offset=${offset}`)
          const newPosts = res.data
          
          if (reset) {
              setPosts(newPosts)
              setPage(1) // Next page is 1
          } else {
              setPosts(prev => [...prev, ...newPosts])
              setPage(prev => prev + 1)
          }
          
          if (newPosts.length < PAGE_SIZE) {
              setHasMore(false)
          } else {
              setHasMore(true)
          }
      } catch (e) {
          console.error("Failed to load feed", e)
      }
  }

  const handleSearch = async (e?: React.FormEvent) => {
      e?.preventDefault()
      // Logic moved to useEffect [searchQuery]
  }

  const clearSearch = () => {
      setSearchQuery('')
      setRefreshKey(k => k + 1) // Trigger feed reload
  }

  const handlePostUpdate = (updatedPost: any) => {
      setPosts(prev => prev.map(p => {
          if (p.id === updatedPost.id) {
              // Merge updates. Note: API detail response structure might differ slightly from Feed list item structure
              // Feed item: { id, title, content, images, likes, collections, author }
              // Detail item: { post: {...}, is_liked, like_count... }
              
              // If updatedPost comes from PostDetailModal's internal 'data' structure
              // We need to map it back to the list structure.
              
              // Check if updatedPost is the full detail object or just the post part
              // Let's assume onUpdate passes the standardized list-view compatible object or we construct it here.
              
              return {
                  ...p,
                  ...updatedPost, // Overwrite simple fields like title, content
                  // Special handling for counters if passed separately
                  likes: updatedPost.likes !== undefined ? updatedPost.likes : p.likes,
                  collections: updatedPost.collections !== undefined ? updatedPost.collections : p.collections
              }
          }
          return p
      }))
  }

  if (!user) {
    return <LoginView />
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
       {/* Only show global header in Feed and Explore tabs */}
       {(activeTab === 'feed' || activeTab === 'explore') && !selectedPostId && !publicProfileId && (
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
               {/* Bell removed from header */}
               <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
           </header>
       )}

       <main id="scrollableDiv" className="flex-1 overflow-y-auto p-0 scrollbar-hide">
           {selectedPostId ? (
               <PostDetailModal 
                   postId={selectedPostId}
                   onClose={() => setSelectedPostId(null)}
                   onDelete={() => {
                       setPosts(prev => prev.filter(p => p.id !== selectedPostId))
                       setRefreshKey(k => k + 1) 
                   }}
                   onUpdate={handlePostUpdate}
                   onUserClick={(userId) => {
                       setSelectedPostId(null)
                       setPublicProfileId(userId)
                   }}
               />
           ) : publicProfileId ? (
               <PublicProfileView 
                   userId={publicProfileId}
                   onBack={() => setPublicProfileId(null)}
                   onPostClick={setSelectedPostId}
               />
           ) : activeTab === 'feed' ? (
               <div className="p-2">
                   {isSearching ? (
                       <div className="flex justify-center py-10">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mc-orange"></div>
                       </div>
                   ) : (
                       <InfiniteScroll
                            dataLength={posts.length}
                            next={() => loadPosts(false)}
                            hasMore={hasMore && !searchQuery} // Disable infinite scroll during search
                            loader={<div className="text-center py-4 text-xs text-gray-400">Loading more...</div>}
                            scrollableTarget="scrollableDiv"
                            endMessage={
                                posts.length > 0 && <div className="text-center py-8 text-xs text-gray-300">No more posts</div>
                            }
                       >
                            {posts.length === 0 && !searchQuery ? (
                                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                                    <p>No posts yet</p>
                                    <p className="text-xs mt-1">Be the first to share!</p>
                                </div>
                            ) : (
                                <MasonryGrid 
                                    posts={posts} 
                                    onPostClick={setSelectedPostId} 
                                    onUserClick={setPublicProfileId}
                                />
                            )}
                       </InfiniteScroll>
                   )}
               </div>
           ) : activeTab === 'explore' ? (
               <ExploreView 
                   onPostClick={setSelectedPostId} 
                   onUserClick={setPublicProfileId}
                   refreshTrigger={refreshKey}
               />
           ) : activeTab === 'profile' ? (
               <ProfileView 
                  onPostClick={setSelectedPostId} 
                  onSettingsClick={() => setActiveTab('settings')}
               />
           ) : activeTab === 'notifications' ? (
               <NotificationsView 
                   onPostClick={setSelectedPostId}
               />
           ) : (
               <SettingsView onBack={() => setActiveTab('profile')} />
           )}
       </main>

       {activeTab !== 'settings' && !selectedPostId && !publicProfileId && (
           <BottomNav 
               activeTab={activeTab} 
               setActiveTab={setActiveTab} 
               onAddClick={() => setIsCreating(true)} 
               unreadCount={unreadCount} 
           />
       )}

       {isCreating && (
           <CreatePostModal 
               onClose={() => setIsCreating(false)} 
               onSuccess={(newPostId) => {
                   setRefreshKey(k => k + 1)
                   if (newPostId) {
                       setSelectedPostId(newPostId)
                   }
               }} 
           />
       )}
    </div>
  )
}

export default App
