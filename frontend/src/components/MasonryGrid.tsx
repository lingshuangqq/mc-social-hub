import { Heart, Star } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { id: number, name: string, avatar_url: string }
}

interface Props {
    posts: Post[]
    onPostClick: (id: number) => void
    onUserClick?: (userId: number) => void
}

const MasonryGrid = ({ posts, onPostClick, onUserClick }: Props) => {
    // Breakpoints
    const isMd = useMediaQuery('(min-width: 768px)')
    const isXl = useMediaQuery('(min-width: 1280px)')

    // Determine column count
    let columnCount = 2
    if (isXl) columnCount = 4
    else if (isMd) columnCount = 3

    // Distribute posts into columns
    const columns: Post[][] = Array.from({ length: columnCount }, () => [])
    posts.forEach((post, i) => {
        columns[i % columnCount].push(post)
    })

    const PostCard = ({ post }: { post: Post }) => (
        <div 
            className="bg-white rounded-xl overflow-hidden shadow-sm mb-3 break-inside-avoid relative hover:shadow-md transition-shadow duration-200"
        >
            <div onClick={() => onPostClick(post.id)} className="cursor-pointer w-full relative">
                {post.images && post.images.length > 0 ? (
                    <img src={post.images[0]} className="w-full h-auto object-cover block min-h-[120px]" loading="lazy" />
                ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-300">Text Only</div>
                )}
            </div>

            <div className="p-3">
                <div onClick={() => onPostClick(post.id)} className="cursor-pointer">
                    {post.title && (
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1.5 leading-snug">
                            {post.title}
                        </h3>
                    )}
                    
                    {post.content && (
                        <p className={`text-xs text-gray-600 mb-2.5 ${post.title ? 'line-clamp-1' : 'line-clamp-3'}`}>
                            {post.content}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div 
                        className="flex items-center gap-2 overflow-hidden flex-1 mr-2 cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                            e.stopPropagation()
                            if (onUserClick && post.author) {
                                onUserClick(post.author.id) 
                            }
                        }}
                    >
                        <img src={post.author?.avatar_url} className="w-5 h-5 rounded-full bg-gray-200 shrink-0 object-cover border border-gray-100" />
                        <span className="text-[11px] text-gray-500 truncate font-medium">{post.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 shrink-0">
                        <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">{post.collections || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex gap-3 items-start">
            {columns.map((colPosts, colIndex) => (
                <div key={colIndex} className="flex-1 flex flex-col min-w-0">
                    {colPosts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
            ))}
        </div>
    )
}

export default MasonryGrid
