import { Heart, Star } from 'lucide-react'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { name: string, avatar_url: string }
}

interface Props {
    posts: Post[]
    onPostClick: (id: number) => void
    onUserClick?: (userId: number) => void
}

const MasonryGrid = ({ posts, onPostClick, onUserClick }: Props) => {
    const leftPosts = posts.filter((_, i) => i % 2 === 0)
    const rightPosts = posts.filter((_, i) => i % 2 !== 0)

    const PostCard = ({ post }: { post: Post }) => (
        <div 
            className="bg-white rounded-xl overflow-hidden shadow-sm mb-2 break-inside-avoid relative"
        >
            <div onClick={() => onPostClick(post.id)} className="cursor-pointer w-full relative">
                {post.images && post.images.length > 0 ? (
                    <img src={post.images[0]} className="w-full h-auto object-cover block min-h-[120px]" loading="lazy" />
                ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-300">Text Only</div>
                )}
            </div>

            <div className="p-2.5">
                <div onClick={() => onPostClick(post.id)} className="cursor-pointer">
                    {post.title && (
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-1 leading-snug">
                            {post.title}
                        </h3>
                    )}
                    
                    {post.content && (
                        <p className={`text-xs text-gray-600 mb-2 ${post.title ? 'line-clamp-1' : 'line-clamp-3'}`}>
                            {post.content}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div 
                        className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2 cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                            e.stopPropagation()
                            // Assuming post.author has an ID (it should, but type def above needs checking)
                            // The generic Post interface in MasonryGrid might need author.id
                            if (onUserClick && post.author) {
                                // We need to cast or ensure author has ID. The Feed API returns it.
                                // Let's blindly trust it has it or pass it.
                                // Actually, let's update the Post interface above first.
                                onUserClick((post.author as any).id) 
                            }
                        }}
                    >
                        <img src={post.author?.avatar_url} className="w-4 h-4 rounded-full bg-gray-200 shrink-0 object-cover" />
                        <span className="text-[10px] text-gray-500 truncate">{post.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 shrink-0">
                        <div className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{post.collections || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex gap-2 items-start">
            <div className="flex-1 flex flex-col w-1/2">
                {leftPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
            <div className="flex-1 flex flex-col w-1/2">
                {rightPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
        </div>
    )
}

export default MasonryGrid
