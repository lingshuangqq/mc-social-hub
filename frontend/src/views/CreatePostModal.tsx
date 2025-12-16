import React, { useState, useRef } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../config'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useUIStore } from '../store/ui'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
}

interface Props {
  onClose: () => void
  onSuccess: (newPostId?: number) => void
  post?: Post // Optional: If provided, we are in Edit Mode
}

const CreatePostModal = ({ onClose, onSuccess, post }: Props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>(post?.images || [])
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { token } = useAuthStore()
  const { triggerFeedRefresh } = useUIStore()

  const isEditMode = !!post
  const POST_TAGS = ["Life", "Work", "Event", "Food", "Clubs", "Market", "Tech", "Welfare", "Help"]

  const toggleTag = (tag: string) => {
      setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages(prev => [...prev, ...newFiles])
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
        let uploadedUrls: string[] = []

        if (!isEditMode) {
            // Upload images first
            for (const file of images) {
                const formData = new FormData()
                formData.append('file', file)
                const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}` 
                    }
                })
                uploadedUrls.push(res.data.url)
            }
        }

        if (isEditMode && post) {
             await axios.put(`${API_BASE_URL}/api/posts/${post.id}`, {
                 title, content
             }, { headers: { Authorization: `Bearer ${token}` }})
             
             if (onSuccess) onSuccess(post.id)
             else onClose()

        } else {
             // Create
             const res = await axios.post(`${API_BASE_URL}/api/posts`, {
                 title, 
                 content, 
                 images: uploadedUrls,
                 tags: tags 
             }, { headers: { Authorization: `Bearer ${token}` }})

             triggerFeedRefresh() // Trigger Feed Refresh
             if (onSuccess) onSuccess(res.data.id)
             else onClose()
        }

    } catch (e) {
        console.error("Post creation failed", e)
        alert("Failed to post. Please try again.")
    } finally {
        setIsSubmitting(false)
    }
  }

  // Content Component to reuse logic
  const modalContent = (
      <>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-lg">{isEditMode ? "Edit Post" : "New Post"}</h2>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || (!content && images.length === 0 && !isEditMode)}
          className="bg-mc-orange text-white px-4 py-1.5 rounded-full text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-orange-600 transition-colors"
        >
          {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
          {isEditMode ? "Update" : "Post"}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Image Preview Area */}
        {!isEditMode && (
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {previews.map((src, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
              <img src={src} className="w-full h-full object-cover" />
              <button 
                onClick={() => {
                    setImages(imgs => imgs.filter((_, i) => i !== idx))
                    setPreviews(prevs => prevs.filter((_, i) => i !== idx))
                }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs">Add</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileSelect}
          />
        </div>
        )}

        {/* Inputs */}
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)" 
          className="w-full text-lg font-bold mb-3 outline-none placeholder:text-gray-300 bg-transparent"
        />
        <textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your moment..." 
          className="w-full h-40 resize-none outline-none text-base placeholder:text-gray-400 mb-4 bg-transparent"
        />

        {/* Tag Selector */}
        {!isEditMode && (
            <div>
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Add Tags</p>
                <div className="flex flex-wrap gap-2">
                    {POST_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                                ${tags.includes(tag) 
                                    ? 'bg-mc-navy text-white border-mc-navy' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
      </>
  )

  if (isDesktop) {
      return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl relative">
                  {modalContent}
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-200">
      {modalContent}
    </div>
  )
}

export default CreatePostModal