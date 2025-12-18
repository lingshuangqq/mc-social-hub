import { useState, useEffect, useRef } from 'react'
import { X, Heart, Star, MessageCircle, ArrowLeft, MoreVertical, Trash2, Edit2, Send } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { formatDistanceToNow } from 'date-fns'
import { API_BASE_URL } from '../config'
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useSwipeable } from 'react-swipeable';
import CreatePostModal from './CreatePostModal'
import ShareModal from './ShareModal'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useUIStore } from '../store/ui'

interface Props {
    postId: number
    onClose: () => void
    onDelete?: () => void // Callback to refresh parent list
    onUpdate?: (postData: any) => void
    onUserClick?: (userId: number) => void
}

interface Comment {
    id: number
    content: string
    parent_id: number | null
    created_at: string
    author: { id: number, name: string, avatar_url: string }
}

interface PostDetail {
    post: {
        id: number
        user_id: number
        title: string
        content: string
        images: string[]
        created_at: string
        author: { id: number, name: string, avatar_url: string }
        comments: Comment[]
        ai_keywords?: string
    }
    is_liked: boolean
    is_collected: boolean
    like_count: number
    collection_count: number
    is_following: boolean
}

const PostDetailModal = ({ postId, onClose, onDelete, onUpdate, onUserClick }: Props) => {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [data, setData] = useState<PostDetail | null>(null)
    const [commentInput, setCommentInput] = useState('')
    const [replyTo, setReplyTo] = useState<Comment | null>(null)
    const [currentImageIdx, setCurrentImageIdx] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isSharing, setIsSharing] = useState(false)

    const { token, user: currentUser } = useAuthStore()
    const { triggerFeedRefresh } = useUIStore()

    const fetchingRef = useRef<number | null>(null)

    // Helper to render content with links
    const renderContent = (content: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all" onClick={e => e.stopPropagation()}>
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    // Swipe Handlers
    const swipeHandlers = useSwipeable({
        // ...
    });

    useEffect(() => {
        console.log("postId", postId)
        if (fetchingRef.current === postId) return
        fetchData()
    }, [postId])

    const fetchData = async () => {
        fetchingRef.current = postId
        try {
            const res = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setData(res.data)
        } catch (e) {
            console.error(e)
            fetchingRef.current = null // Retry allowed on error
        }
    }

    const handleFollow = async () => {
        if (!data) return

        const originalState = data.is_following
        // Optimistic update
        setData(prev => prev ? { ...prev, is_following: !prev.is_following } : null)

        try {
            if (originalState) {
                await axios.delete(`${API_BASE_URL}/api/users/${data.post.user_id}/follow`, { headers: { Authorization: `Bearer ${token}` } })
            } else {
                await axios.post(`${API_BASE_URL}/api/users/${data.post.user_id}/follow`, {}, { headers: { Authorization: `Bearer ${token}` } })
            }
        } catch (e) {
            console.error("Follow action failed", e)
            fetchData() // Revert on error
        }
    }

    const handleLike = async () => {
        if (!data) return

        const newData = {
            ...data,
            is_liked: !data.is_liked,
            like_count: data.is_liked ? data.like_count - 1 : data.like_count + 1
        }
        setData(newData)

        if (onUpdate) {
            onUpdate({ id: postId, likes: newData.like_count })
        }

        await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } })
    }

    const handleCollect = async () => {
        if (!data) return

        const newData = {
            ...data,
            is_collected: !data.is_collected,
            collection_count: data.is_collected ? data.collection_count - 1 : data.collection_count + 1
        }
        setData(newData)

        if (onUpdate) {
            onUpdate({ id: postId, collections: newData.collection_count })
        }

        await axios.post(`${API_BASE_URL}/api/posts/${postId}/collect`, {}, { headers: { Authorization: `Bearer ${token}` } })
    }

    const handleComment = async () => {
        if (!commentInput.trim()) return
        await axios.post(`${API_BASE_URL}/api/posts/${postId}/comments`, {
            content: commentInput,
            parent_id: replyTo?.id
        }, { headers: { Authorization: `Bearer ${token}` } })
        setCommentInput('')
        setReplyTo(null)
        fetchData()
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return
        try {
            await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            triggerFeedRefresh() // Notify Feed to reload

            if (onDelete) onDelete()
            onClose()
        } catch (e) {
            alert("Failed to delete post")
        }
    }

    if (!data) return null

    const { post } = data
    const isAuthor = currentUser?.id === post.user_id

    if (isEditing) {
        return (
            <CreatePostModal
                post={post}
                onClose={() => setIsEditing(false)}
                onSuccess={async () => {
                    setIsEditing(false)
                    try {
                        const res = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        setData(res.data)
                        if (onUpdate) {
                            onUpdate({
                                id: postId,
                                title: res.data.post.title,
                                content: res.data.post.content
                            })
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }}
            />
        )
    }

    // --- Mobile Layout ---
    const mobileLayout = (
        <div className="h-full flex flex-col bg-white relative">
            {/* Header */}
            <div className="absolute top-0 w-full z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none rounded-t-xl">
                <button onClick={onClose} className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full pointer-events-auto hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 pointer-events-auto">
                    <button onClick={() => setIsSharing(true)} className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors">
                        <Send className="w-6 h-6" />
                    </button>

                    {isAuthor && (
                        <div className="relative">
                            <button onClick={() => setShowMenu(!showMenu)} className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-colors">
                                <MoreVertical className="w-6 h-6" />
                            </button>
                            {/* Mobile Menu Dropdown */}
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                    <button
                                        onClick={() => { setShowMenu(false); setIsEditing(true); }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto pb-16 no-scrollbar">
                {/* Image Swiper */}
                <div
                    className="relative w-full aspect-[3/4] bg-black"
                    {...swipeHandlers}
                >
                    {post.images && post.images.length > 0 ? (
                        <>
                            <img
                                src={post.images[currentImageIdx]}
                                className="w-full h-full object-contain cursor-zoom-in select-none"
                                onClick={() => setLightboxOpen(true)}
                                draggable={false}
                            />
                            {post.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                                    {post.images.map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIdx ? 'bg-white' : 'bg-white/40'}`} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                    )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onUserClick && onUserClick(post.user_id)}
                        >
                            <img src={post.author.avatar_url} className="w-10 h-10 rounded-full border border-gray-100" />
                            <span className="font-bold text-sm text-gray-800">{post.author.name}</span>
                        </div>

                        {!isAuthor && (
                            <button
                                onClick={handleFollow}
                                className={`
                                  px-5 py-1.5 rounded-full text-xs font-bold transition-all
                                  ${data.is_following
                                        ? 'bg-gray-100 text-gray-500 border border-gray-200'
                                        : 'bg-white text-mc-orange border border-mc-orange'
                                    }
                              `}
                            >
                                {data.is_following ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>

                    {post.title && <h1 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h1>}
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-4 break-words">
                        {renderContent(post.content)}
                    </div>

                    {post.ai_keywords && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.ai_keywords.split(',').map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 text-mc-navy text-xs px-2 py-0.5 rounded-md font-medium">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-100">
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>

                    {/* Mobile Comments */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-xs font-bold text-gray-500 mb-4">Comments ({post.comments.length})</h3>
                        <div className="space-y-4">
                            {post.comments.filter(c => !c.parent_id).map(comment => (
                                <div key={comment.id}>
                                    <div className="flex gap-3 items-start">
                                        <img src={comment.author.avatar_url} className="w-8 h-8 rounded-full bg-gray-200" />
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-gray-700">{comment.author.name}</span>
                                                <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                                            </div>
                                            <p className="text-sm text-gray-800 mt-0.5 cursor-pointer" onClick={() => setReplyTo(comment)}>
                                                {comment.content}
                                            </p>
                                            <button onClick={() => setReplyTo(comment)} className="text-[10px] font-bold text-gray-500 mt-1">Reply</button>
                                        </div>
                                    </div>
                                    {post.comments.filter(r => r.parent_id === comment.id).map(reply => (
                                        <div key={reply.id} className="flex gap-3 items-start mt-3 ml-11">
                                            <img src={reply.author.avatar_url} className="w-6 h-6 rounded-full bg-gray-200" />
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xs font-bold text-gray-700">{reply.author.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-800 mt-0.5">
                                                    <span className="text-blue-500 mr-1">@{comment.author.name}</span>
                                                    {reply.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-4 py-2 z-20 flex flex-col rounded-b-xl">
                {replyTo && (
                    <div className="flex justify-between items-center px-2 py-1 bg-gray-50 text-xs text-gray-500 border-b">
                        <span>Replying to {replyTo.author.name}</span>
                        <button onClick={() => setReplyTo(null)}><X className="w-3 h-3" /></button>
                    </div>
                )}
                <div className="h-12 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 flex-1 mr-4">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <input
                            value={commentInput}
                            onChange={e => setCommentInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                            placeholder={replyTo ? `Reply to ${replyTo.author.name}...` : "Say something..."}
                            className="bg-transparent flex-1 outline-none text-sm placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
                            <Heart className={`w-6 h-6 transition-transform active:scale-125 ${data.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-800'}`} />
                            <span className="text-[10px] font-medium text-gray-600">{data.like_count}</span>
                        </button>
                        <button onClick={handleCollect} className="flex flex-col items-center gap-0.5">
                            <Star className={`w-6 h-6 transition-transform active:scale-125 ${data.is_collected ? 'fill-yellow-400 text-yellow-400' : 'text-gray-800'}`} />
                            <span className="text-[10px] font-medium text-gray-600">{data.collection_count}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    // --- Desktop Layout (Split View) ---
    const desktopLayout = (
        <div className="flex h-full w-full">
            {/* Left: Media */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden rounded-l-xl">
                {post.images && post.images.length > 0 ? (
                    <>
                        <img
                            src={post.images[currentImageIdx]}
                            className="max-h-full max-w-full object-contain select-none"
                            onClick={() => setLightboxOpen(true)}
                        />
                        {/* Arrows */}
                        {post.images.length > 1 && (
                            <>
                                {currentImageIdx > 0 && (
                                    <button
                                        onClick={() => setCurrentImageIdx(prev => prev - 1)}
                                        className="absolute left-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                )}
                                {currentImageIdx < post.images.length - 1 && (
                                    <button
                                        onClick={() => setCurrentImageIdx(prev => prev + 1)}
                                        className="absolute right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm transform rotate-180"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                )}
                                {/* Dots */}
                                <div className="absolute bottom-6 flex gap-1.5">
                                    {post.images.map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIdx ? 'bg-white' : 'bg-white/40'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-gray-500">No Media</div>
                )}
            </div>

            {/* Right: Info */}
            <div className="w-[400px] flex flex-col bg-white border-l border-gray-100 rounded-r-xl relative">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <img src={post.author.avatar_url} className="w-9 h-9 rounded-full border border-gray-100" />
                        <span className="font-bold text-sm text-gray-900">{post.author.name}</span>
                        {!isAuthor && (
                            <button
                                onClick={handleFollow}
                                className={`
                                  px-4 py-1 rounded-full text-xs font-bold transition-all
                                  ${data.is_following
                                        ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                        : 'bg-mc-orange text-white hover:opacity-90'
                                    }
                              `}
                            >
                                {data.is_following ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSharing(true)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                            <Send className="w-5 h-5" />
                        </button>

                        {/* Menu logic for Desktop */}
                        {isAuthor && (
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right z-10 border border-gray-100">
                                        <button
                                            onClick={() => { setShowMenu(false); setIsEditing(true); }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {post.title && <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{post.title}</h1>}
                    <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-4 break-words">
                        {renderContent(post.content)}
                    </div>

                    {post.ai_keywords && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.ai_keywords.split(',').map((tag, idx) => (
                                <span key={idx} className="bg-blue-50 text-mc-navy text-xs px-2 py-0.5 rounded-md font-medium">
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mb-6 pb-6 border-b border-gray-100">
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>

                    {/* Comments */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Comments {post.comments.length > 0 && `(${post.comments.length})`}</h3>
                        {post.comments.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-xs">No comments yet.</div>
                        ) : (
                            <div className="space-y-5">
                                {post.comments.filter(c => !c.parent_id).map(comment => (
                                    <div key={comment.id}>
                                        <div className="flex gap-3 items-start">
                                            <img src={comment.author.avatar_url} className="w-8 h-8 rounded-full bg-gray-200" />
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-0.5">
                                                    <span className="text-xs font-bold text-gray-600">{comment.author.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-800 leading-snug">
                                                    {comment.content}
                                                    <span className="ml-2 text-xs text-gray-400 font-normal">{formatDistanceToNow(new Date(comment.created_at))}</span>
                                                </p>
                                                <div className="flex gap-4 mt-1">
                                                    <button onClick={() => setReplyTo(comment)} className="text-xs font-bold text-gray-500 hover:text-gray-800">Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Child Comments */}
                                        {post.comments.filter(r => r.parent_id === comment.id).map(reply => (
                                            <div key={reply.id} className="flex gap-3 items-start mt-3 ml-11">
                                                <img src={reply.author.avatar_url} className="w-6 h-6 rounded-full bg-gray-200" />
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-2 mb-0.5">
                                                        <span className="text-xs font-bold text-gray-600">{reply.author.name}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-800 leading-snug">
                                                        <span className="text-blue-500 mr-1 text-xs">@{comment.author.name}</span>
                                                        {reply.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-6">
                            <button onClick={handleLike} className="flex items-center gap-1.5 group">
                                <Heart className={`w-6 h-6 transition-transform group-active:scale-125 ${data.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-800 group-hover:text-red-500'}`} />
                                <span className="text-sm font-medium text-gray-600">{data.like_count || "Like"}</span>
                            </button>
                            <button onClick={handleCollect} className="flex items-center gap-1.5 group">
                                <Star className={`w-6 h-6 transition-transform group-active:scale-125 ${data.is_collected ? 'fill-yellow-400 text-yellow-400' : 'text-gray-800 group-hover:text-yellow-400'}`} />
                                <span className="text-sm font-medium text-gray-600">{data.collection_count || "Collect"}</span>
                            </button>
                            <button className="flex items-center gap-1.5 group">
                                <MessageCircle className="w-6 h-6 text-gray-800 group-hover:text-blue-500" />
                                <span className="text-sm font-medium text-gray-600">{post.comments.length || "Chat"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2.5">
                        {replyTo && (
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-xs text-gray-500 shadow-sm">
                                <span>@{replyTo.author.name}</span>
                                <button onClick={() => setReplyTo(null)}><X className="w-3 h-3 hover:text-red-500" /></button>
                            </div>
                        )}
                        <input
                            value={commentInput}
                            onChange={e => setCommentInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                            placeholder={replyTo ? `Reply...` : "Add a comment..."}
                            className="bg-transparent flex-1 outline-none text-sm placeholder:text-gray-400"
                        />
                        <button
                            disabled={!commentInput.trim()}
                            onClick={handleComment}
                            className="text-mc-navy font-bold text-sm disabled:opacity-30 hover:opacity-80"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    // --- Main Render ---

    // Common Lightbox (Rendered outside layout)
    const lightbox = (
        <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={currentImageIdx}
            on={{ view: ({ index }) => setCurrentImageIdx(index) }}
            slides={post.images.map(src => ({ src }))}
            plugins={[Zoom]}
            styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)", zIndex: 9999 } }}
            controller={{ closeOnBackdropClick: true }}
        />
    )

    const content = isDesktop ? (
        <div
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
            style={{ height: '100vh', top: window.scrollY }} // Hack: Position absolute but visually fixed relative to viewport
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-xl w-[1000px] max-w-[95vw] h-[85vh] shadow-2xl relative overflow-hidden flex flex-col">
                {desktopLayout}
            </div>
            {lightbox}
        </div>
    ) : (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-200">
            {mobileLayout}
            {lightbox}
        </div>
    )

    return (
        <>
            {content}
            {isSharing && (
                <ShareModal post={post} onClose={() => setIsSharing(false)} />
            )}
        </>
    )
}
export default PostDetailModal