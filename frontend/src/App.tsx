import { useState, useEffect } from 'react'
import { useAuthStore } from './store/auth'
import LoginView from './views/LoginView'
import CreatePostModal from './views/CreatePostModal'
import PostDetailModal from './views/PostDetailModal'
import PublicProfileView from './views/PublicProfileView'
import ProfileView from './views/ProfileView'
import ExploreView from './views/ExploreView'
import MasonryGrid from './components/MasonryGrid'
import SettingsView from './views/SettingsView'
import NotificationsView from './views/NotificationsView'
import axios from 'axios'
import { API_BASE_URL } from './config'
import InfiniteScroll from 'react-infinite-scroll-component'

// Layouts & Hooks
import { useMediaQuery } from './hooks/useMediaQuery'
import MobileLayout from './layout/MobileLayout'
import DesktopLayout from './layout/DesktopLayout'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { id: number, name: string, avatar_url: string }
}

const PAGE_SIZE = 10;

// Define tabs explicitly
type ActiveTab = 'feed' | 'explore' | 'profile' | 'settings' | 'notifications';

function App() {
  const user = useAuthStore(state => state.user)
  const isDesktop = useMediaQuery('(min-width: 768px)') // md breakpoint

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
              return {
                  ...p,
                  ...updatedPost, 
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

  // --- View Rendering Logic ---
  const renderContent = () => {
      if (selectedPostId) {
          return (
               <PostDetailModal 
                   postId={selectedPostId}
                   onClose={() => setSelectedPostId(null)}
                   onDelete={() => {
                       setPosts(prev => prev.filter(p => p.id !== selectedPostId))
                       setRefreshKey(k => k + 1) 
                       setSelectedPostId(null)
                   }}
                   onUpdate={handlePostUpdate}
                   onUserClick={(userId) => {
                       setSelectedPostId(null)
                       setPublicProfileId(userId)
                   }}
               />
          )
      }
      
      if (publicProfileId) {
          return (
               <PublicProfileView 
                   userId={publicProfileId}
                   onBack={() => setPublicProfileId(null)}
                   onPostClick={setSelectedPostId}
               />
          )
      }

      switch (activeTab) {
          case 'feed':
              return (
                   <div className="p-2">
                       {isSearching ? (
                           <div className="flex justify-center py-10">
                               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mc-orange"></div>
                           </div>
                       ) : (
                           <InfiniteScroll
                                dataLength={posts.length}
                                next={() => loadPosts(false)}
                                hasMore={hasMore && !searchQuery}
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
              )
          case 'explore':
              return (
                   <ExploreView 
                       onPostClick={setSelectedPostId} 
                       onUserClick={setPublicProfileId}
                       refreshTrigger={refreshKey}
                   />
              )
          case 'profile':
              return (
                   <ProfileView 
                      onPostClick={setSelectedPostId} 
                      onSettingsClick={() => setActiveTab('settings')}
                   />
              )
          case 'notifications':
              return (
                   <NotificationsView 
                       onPostClick={setSelectedPostId}
                   />
              )
          case 'settings':
              return <SettingsView onBack={() => setActiveTab('profile')} />
          default:
              return null
      }
  }

  const handleTabChange = (tab: ActiveTab) => {
      setActiveTab(tab)
      // Clear all overlay states when switching main tabs
      setSelectedPostId(null)
      setPublicProfileId(null)
      // Also clear settings view if we are navigating away (though activeTab handles that)
  }

  return (
    <>
        {isDesktop ? (
            <DesktopLayout
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                user={user}
                onAddClick={() => setIsCreating(true)}
                unreadCount={unreadCount}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearchSubmit={handleSearch}
                onUserClick={setPublicProfileId}
            >
                {renderContent()}
            </DesktopLayout>
        ) : (
            <MobileLayout
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                user={user}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearchSubmit={handleSearch}
                onClearSearch={clearSearch}
                onAddClick={() => setIsCreating(true)}
                unreadCount={unreadCount}
                showHeader={['feed', 'explore'].includes(activeTab) && !selectedPostId && !publicProfileId}
            >
                {renderContent()}
            </MobileLayout>
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
    </>
  )
}

export default App
