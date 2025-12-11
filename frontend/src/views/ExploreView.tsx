import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import MasonryGrid from '../components/MasonryGrid'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useAuthStore } from '../store/auth'
import { 
    ShoppingBag, 
    Calendar, 
    Utensils, 
    Gift, 
    Briefcase, 
    Activity, 
    MessageCircle, 
    HelpCircle,
    LayoutGrid,
    Truck,
    Sparkles
} from 'lucide-react'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { name: string, avatar_url: string }
}

// Updated Categories based on screenshot (Clean Text Style)
const CATEGORIES = ["Recommend", "Life", "Work", "Food", "Event", "Tech", "Design", "Fun"]

// Mock Data for Icon Grid
const QUICK_LINKS = [
    { icon: Sparkles, label: "Recommend", color: "bg-yellow-100 text-yellow-600" },
    { icon: Activity, label: "Clubs", color: "bg-blue-100 text-blue-600" },
    { icon: Calendar, label: "Events", color: "bg-purple-100 text-purple-600" },
    { icon: ShoppingBag, label: "Market", color: "bg-pink-100 text-pink-600" },
    { icon: Gift, label: "Welfare", color: "bg-orange-100 text-orange-600" },
    { icon: Utensils, label: "Food", color: "bg-green-100 text-green-600" },
    { icon: Briefcase, label: "Admin", color: "bg-indigo-100 text-indigo-600" },
    { icon: Truck, label: "Logistics", color: "bg-yellow-100 text-yellow-600" },
    { icon: HelpCircle, label: "Help", color: "bg-teal-100 text-teal-600" },
    { icon: MessageCircle, label: "Chat", color: "bg-red-100 text-red-600" },
]

interface Props {
    onPostClick: (id: number) => void
    onUserClick?: (userId: number) => void
    refreshTrigger?: number
}

const ExploreView = ({ onPostClick, onUserClick, refreshTrigger }: Props) => {
    const [activeCategory, setActiveCategory] = useState("Recommend")
    const [posts, setPosts] = useState<Post[]>([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const { token } = useAuthStore()

    useEffect(() => {
        loadPosts(true)
    }, [activeCategory, refreshTrigger])

    const loadPosts = async (reset = false) => {
        if (loading && !reset) return
        setLoading(true)
        
        const currentPage = reset ? 0 : page
        const offset = currentPage * 20 
        
        try {
            // Map "Recommend" to "All" to fetch all posts
            const tagParam = activeCategory === "Recommend" ? "All" : activeCategory
            const url = `${API_BASE_URL}/api/feed?limit=20&offset=${offset}${tagParam !== 'All' ? `&tag=${tagParam}` : ''}`
            
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const newPosts = res.data

            if (reset) {
                setPosts(newPosts)
                setPage(1)
            } else {
                setPosts(prev => [...prev, ...newPosts])
                setPage(prev => prev + 1)
            }

            if (newPosts.length < 20) setHasMore(false)
            else setHasMore(true)

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Scrollable Content */}
            <div id="exploreScroll" className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                
                {/* 1. Icon Grid (2 Rows) */}
                <div className="bg-white rounded-xl p-4 mb-3 grid grid-cols-5 gap-y-4 shadow-sm">
                    {QUICK_LINKS.map((link, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setActiveCategory(link.label)}
                            className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${activeCategory === link.label ? 'opacity-100 scale-110 font-bold' : 'opacity-80 hover:opacity-100'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${link.color} ${activeCategory === link.label ? 'ring-2 ring-offset-1 ring-mc-navy' : ''}`}>
                                <link.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-medium ${activeCategory === link.label ? 'text-mc-navy' : 'text-gray-600'}`}>{link.label}</span>
                        </div>
                    ))}
                </div>

                {/* 2. Waterfall Grid */}
                <InfiniteScroll
                    dataLength={posts.length}
                    next={() => loadPosts(false)}
                    hasMore={hasMore}
                    loader={<div className="text-center py-4 text-xs text-gray-400">Loading...</div>}
                    scrollableTarget="exploreScroll"
                >
                    {posts.length === 0 && !loading ? (
                        <div className="py-20 text-center text-gray-400 text-sm">No posts found in {activeCategory}</div>
                    ) : (
                        <MasonryGrid posts={posts} onPostClick={onPostClick} onUserClick={onUserClick} />
                    )}
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default ExploreView