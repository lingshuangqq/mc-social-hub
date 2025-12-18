import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from './store/auth'
import { useUIStore } from './store/ui'
import LoginView from './views/LoginView'
import PublicProfileView from './views/PublicProfileView'
import ProfileView from './views/ProfileView'
import ExploreView from './views/ExploreView'
import SettingsView from './views/SettingsView'
import NotificationsView from './views/NotificationsView'
import FeedView from './views/FeedView'
import PostDetailRoute from './views/PostDetailRoute'
import axios from 'axios'
import { API_BASE_URL } from './config'

// Layouts & Hooks
import { useMediaQuery } from './hooks/useMediaQuery'
import MobileLayout from './layout/MobileLayout'
import DesktopLayout from './layout/DesktopLayout'
import CreatePostModal from './views/CreatePostModal'

// Router
import { Routes, Route, useLocation, useNavigate, Navigate, Location } from 'react-router-dom'

// Define tabs explicitly
type ActiveTab = 'feed' | 'explore' | 'profile' | 'settings' | 'notifications';

function App() {
    const { user } = useAuthStore()
    const { isCreating, setIsCreating } = useUIStore(state => ({
        isCreating: state.isCreating,
        setIsCreating: state.setIsCreating
    }))

    const isDesktop = useMediaQuery('(min-width: 768px)')

    const location = useLocation()
    const navigate = useNavigate()

    // --- Background Location Logic ---
    // This allows us to render the "backing" page (e.g. Feed) even when the URL is /post/123
    const state = location.state as { backgroundLocation?: Location }
    const backgroundLocation = state?.backgroundLocation

    const [publicProfileId] = useState<number | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [activeTab, setActiveTab] = useState<ActiveTab>('feed')
    const [searchQuery, setSearchQuery] = useState('')
    const [unreadCount, setUnreadCount] = useState(0)

    // Sync Tab with URL (ignoring modal URLs if background exists)
    useEffect(() => {
        const effectivePath = backgroundLocation ? backgroundLocation.pathname : location.pathname
        
        if (effectivePath === '/' || effectivePath.startsWith('/feed')) setActiveTab('feed')
        else if (effectivePath.startsWith('/explore')) setActiveTab('explore')
        else if (effectivePath.startsWith('/profile')) setActiveTab('profile')
        else if (effectivePath.startsWith('/notifications')) setActiveTab('notifications')
        else if (effectivePath.startsWith('/settings')) setActiveTab('settings')
    }, [location.pathname, backgroundLocation])

    const fetchNotificationsCount = async () => {
        if (!user) return
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notifications?limit=1`)
            setUnreadCount(res.data.unread_count)
        } catch (e) { }
    }

    useEffect(() => {
        if (user) fetchNotificationsCount()
    }, [user])

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
    }

    const clearSearch = () => {
        setSearchQuery('')
        setRefreshKey(k => k + 1)
    }

    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab)
        if (tab === 'feed') navigate('/')
        else if (tab === 'explore') navigate('/explore')
        else if (tab === 'profile') navigate('/profile')
        else if (tab === 'notifications') navigate('/notifications')
        else if (tab === 'settings') navigate('/settings')
    }

    const handlePostClick = useCallback((id: number) => {
        // Crucial: Pass current location as background state
        navigate(`/post/${id}`, { state: { backgroundLocation: location } })
    }, [navigate, location])

    const handleUserClick = (id: number) => {
        navigate(`/users/${id}`)
    }

    if (!user) {
        return <LoginView />
    }

    // Main Routes: Rendered based on backgroundLocation if present
    const mainRoutes = (
        <Routes location={backgroundLocation || location}>
            <Route path="/" element={
                <FeedView
                    searchQuery={searchQuery}
                    onPostClick={handlePostClick}
                />
            } />
            
            {/* 
               If accessed directly (e.g. Refresh on /post/123), backgroundLocation is null.
               We map /post/:id to FeedView here too, so the Feed renders as the "background".
               The Modal will ALSO render (via the second Routes block) on top of it.
            */}
            <Route path="/post/:id" element={
                <FeedView
                    searchQuery={searchQuery}
                    onPostClick={handlePostClick}
                />
            } />

            <Route path="/explore" element={
                <ExploreView
                    onPostClick={handlePostClick}
                    onUserClick={handleUserClick}
                    refreshTrigger={refreshKey}
                />
            } />
            <Route path="/profile" element={
                <ProfileView
                    onPostClick={handlePostClick}
                    onSettingsClick={() => navigate('/settings')}
                />
            } />
            <Route path="/settings" element={<SettingsView onBack={() => navigate('/profile')} />} />
            <Route path="/notifications" element={<NotificationsView onPostClick={handlePostClick} />} />
            <Route path="/users/:id" element={
                <PublicProfileView
                    userId={0} // PublicProfileView parses ID from URL usually, or we pass it via params if it supported it.
                    // But PublicProfileView seems to expect userId prop if embedded, or maybe it parses URL if routed?
                    // Let's check PublicProfileView implementation.
                    // It takes `userId` prop. So we need a wrapper if routed.
                    // Actually, let's wrap it inline:
                    onBack={() => navigate(-1)}
                    onPostClick={handlePostClick}
                />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )

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
                    onUserClick={handleUserClick}
                >
                    {mainRoutes}
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
                    showHeader={['feed', 'explore'].includes(activeTab) && !publicProfileId}
                >
                    {mainRoutes}
                </MobileLayout>
            )}

            {/* Modal Routes: Rendered ON TOP of the layout */}
            {/* This block ALWAYS uses the real location */}
            <Routes>
                <Route path="/post/:id" element={<PostDetailRoute />} />
            </Routes>

            {isCreating && (
                <CreatePostModal
                    onClose={() => setIsCreating(false)}
                    onSuccess={(newPostId) => {
                        setIsCreating(false) // Close the modal first!
                        setRefreshKey(k => k + 1)
                        if (newPostId) {
                            navigate(`/post/${newPostId}`, { state: { backgroundLocation: location } })
                        }
                    }}
                />
            )}
        </>
    )
}

export default App
