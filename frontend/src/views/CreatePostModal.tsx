import React, { useState, useRef } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../config'

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
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>(post?.images || [])
  const [title, setTitle] = useState(post?.title || '')
  const [content, setContent] = useState(post?.content || '')
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const token = useAuthStore(state => state.token)

  const isEditMode = !!post
  const POST_TAGS = ["Life", "Work", "Event", "Food", "Fun", "Tech", "Design", "Market"]

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
    if (!content.trim() && images.length === 0 && !isEditMode) return
    setIsSubmitting(true)

    try {
      if (isEditMode) {
          // Update Post (Title/Content only for now)
          await axios.put(`${API_BASE_URL}/api/posts/${post.id}`, {
              title: title,
              content: content
          }, {
              headers: { Authorization: `Bearer ${token}` }
          })
      } else {
          // Create Post
          // 1. Upload Images
          const imageUrls = []
          for (const file of images) {
            const formData = new FormData()
            formData.append('file', file)
            const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            imageUrls.push(res.data.url)
          }

          // 2. Create Post
          const res = await axios.post(`${API_BASE_URL}/api/posts`, {
            title: title || null,
            content: content,
            images: imageUrls,
            tags: tags
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          onSuccess(res.data.id)
      }

      onClose()
    } catch (e) {
      console.error("Post failed", e)
      alert("Failed to save. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10 duration-200">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-500">
          <X className="w-6 h-6" />
        </button>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || (!content && images.length === 0 && !isEditMode)}
          className="bg-mc-orange text-white px-4 py-1.5 rounded-full text-sm font-bold disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
          {isEditMode ? "Update" : "Post"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Image Preview Area - Read Only in Edit Mode for now */}
        {!isEditMode && (
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {previews.map((src, idx) => (
            <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img src={src} className="w-full h-full object-cover" />
              <button 
                onClick={() => {
                    setImages(imgs => imgs.filter((_, i) => i !== idx))
                    setPreviews(prevs => prevs.filter((_, i) => i !== idx))
                }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50"
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
          className="w-full text-lg font-bold mb-3 outline-none placeholder:text-gray-300"
        />
        <textarea 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your moment..." 
          className="w-full h-40 resize-none outline-none text-base placeholder:text-gray-400 mb-4"
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
    </div>
  )
}

export default CreatePostModal
