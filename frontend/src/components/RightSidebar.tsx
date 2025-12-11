import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { useAuthStore } from '../store/auth'
import { Search, Loader2 } from 'lucide-react'

interface RightSidebarProps {
    searchQuery?: string
    setSearchQuery?: (q: string) => void
    onSearchSubmit?: (e: React.FormEvent) => void
    onUserClick?: (id: number) => void
}

interface Tag {
    tag: string
    count: number
}

interface SuggestedUser {
    id: number
    name: string
    avatar_url: string
    title?: string
}

export default function RightSidebar({ searchQuery, setSearchQuery, onSearchSubmit, onUserClick }: RightSidebarProps) {
    const { token } = useAuthStore()
    const [tags, setTags] = useState<Tag[]>([])
    const [users, setUsers] = useState<SuggestedUser[]>([])
    const [followingIds, setFollowingIds] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tagsRes, usersRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/discovery/trending-tags`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/api/discovery/suggested-users`, { headers: { Authorization: `Bearer ${token}` } })
                ])
                setTags(tagsRes.data)
                setUsers(usersRes.data)
            } catch (e) {
                console.error("Failed to fetch sidebar data", e)
            } finally {
                setIsLoading(false)
            }
        }
        if (token) fetchData()
    }, [token])

    const handleFollow = async (userId: number) => {
        try {
            await axios.post(`${API_BASE_URL}/api/users/${userId}/follow`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFollowingIds(prev => [...prev, userId])
        } catch (e) {
            console.error("Follow failed", e)
        }
    }

    return (
        <div className="h-screen fixed right-0 top-0 w-80 p-6 border-l border-gray-100 overflow-y-auto hidden xl:block">
            {/* Search Widget */}
            <form onSubmit={onSearchSubmit} className="mb-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search MC Hub..." 
                    className="w-full bg-gray-100 py-3 pl-10 pr-5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-mc-navy/10 transition-all"
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                />
            </form>

            {/* Trending Tags */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Trending</h3>
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : (
                    <div className="space-y-4">
                        {tags.map((tag, idx) => (
                            <div key={idx} className="cursor-pointer hover:bg-gray-100 p-2 -mx-2 rounded-lg transition-colors group">
                                <p className="text-gray-500 text-xs mb-0.5">Trending</p>
                                <p className="font-bold text-gray-800 group-hover:text-mc-navy">#{tag.tag}</p>
                                <p className="text-gray-400 text-xs">{tag.count} posts</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Who to Follow */}
            <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Who to follow</h3>
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : users.length === 0 ? (
                    <p className="text-sm text-gray-400">No suggestions right now.</p>
                ) : (
                    <div className="space-y-4">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center gap-3">
                                <img 
                                    src={user.avatar_url} 
                                    className="w-10 h-10 rounded-full bg-gray-200 object-cover cursor-pointer" 
                                    onClick={() => onUserClick && onUserClick(user.id)}
                                />
                                <div className="flex-1 min-w-0">
                                    <p 
                                        className="font-bold text-sm text-gray-900 truncate cursor-pointer hover:underline"
                                        onClick={() => onUserClick && onUserClick(user.id)}
                                    >
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.title || 'Member'}</p>
                                </div>
                                {followingIds.includes(user.id) ? (
                                    <span className="text-xs font-bold text-gray-400 px-3 py-1.5">Following</span>
                                ) : (
                                    <button 
                                        onClick={() => handleFollow(user.id)}
                                        className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
                                    >
                                        Follow
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <footer className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 px-2">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">About</a>
                <span>© 2025 MC Social Hub</span>
            </footer>
        </div>
    )
}
