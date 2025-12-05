import { useState, useEffect } from 'react'
import { X, Heart, Star, MessageCircle, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { formatDistanceToNow } from 'date-fns'
import { API_BASE_URL } from '../config'

interface Props {
  postId: number
  onClose: () => void
}

interface Comment {
    id: number
    content: string
    parent_id: number | null
    created_at: string
    author: { name: string, avatar_url: string }
}

interface PostDetail {
    post: {
        id: number
        title: string
        content: string
        images: string[]
        created_at: string
        author: { name: string, avatar_url: string }
        comments: Comment[]
    }
    is_liked: boolean
    is_collected: boolean
    like_count: number
    collection_count: number
}

const PostDetailModal = ({ postId, onClose }: Props) => {
  const [data, setData] = useState<PostDetail | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const token = useAuthStore(state => state.token)

  useEffect(() => {
      fetchData()
  }, [postId])

  const fetchData = async () => {
      try {
          const res = await axios.get(`${API_BASE_URL}/api/posts/${postId}`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          setData(res.data)
      } catch (e) {
          console.error(e)
      }
  }

  const handleLike = async () => {
      if (!data) return
      setData(prev => prev ? ({ ...prev, is_liked: !prev.is_liked, like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1 }) : null)
      await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } })
  }

  const handleCollect = async () => {
      if (!data) return
      setData(prev => prev ? ({ ...prev, is_collected: !prev.is_collected, collection_count: prev.is_collected ? prev.collection_count - 1 : prev.collection_count + 1 }) : null)
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

  if (!data) return null

  const { post } = data

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-200">
        <div className="absolute top-0 w-full z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
            <button onClick={onClose} className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full pointer-events-auto">
                <ArrowLeft className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
            <div className="relative w-full aspect-[3/4] bg-black">
                {post.images && post.images.length > 0 ? (
                    <>
                        <img src={post.images[currentImageIdx]} className="w-full h-full object-contain" />
                        {post.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {post.images.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIdx ? 'bg-white' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        )}
                        <div className="absolute inset-0 flex">
                            <div className="w-1/2 h-full" onClick={() => setCurrentImageIdx(i => Math.max(0, i-1))}></div>
                            <div className="w-1/2 h-full" onClick={() => setCurrentImageIdx(i => Math.min(post.images.length-1, i+1))}></div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <img src={post.author.avatar_url} className="w-10 h-10 rounded-full border border-gray-100" />
                    <span className="font-bold text-sm text-gray-800">{post.author.name}</span>
                </div>

                {post.title && <h1 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h1>}
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
                <p className="text-xs text-gray-400 mb-6 pb-4 border-b border-gray-100">
                    {new Date(post.created_at).toLocaleDateString()}
                </p>

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
                                {/* Child Comments (Simplified 1-level nesting for now) */}
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

        <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-4 pb-safe z-20 flex flex-col">
            {replyTo && (
                <div className="flex justify-between items-center px-2 py-1 bg-gray-50 text-xs text-gray-500 border-b">
                    <span>Replying to {replyTo.author.name}</span>
                    <button onClick={() => setReplyTo(null)}><X className="w-3 h-3"/></button>
                </div>
            )}
            <div className="h-14 flex items-center justify-between">
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
}

export default PostDetailModal
