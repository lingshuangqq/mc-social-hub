import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../config'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const EditProfileModal = ({ onClose, onSuccess }: Props) => {
  const { user, token, login } = useAuthStore()
  
  const [formData, setFormData] = useState({
      name: '',
      title: '',
      location: '',
      bio: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
      if (user) {
          // Fetch latest details to populate form (since auth store might be stale on extended fields)
          axios.get(`${API_BASE_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` }
          }).then(res => {
              const u = res.data.user
              setFormData({
                  name: u.name || '',
                  title: u.title || '',
                  location: u.location || '',
                  bio: u.bio || ''
              })
          })
      }
  }, [user, token])

  const handleSubmit = async () => {
      setLoading(true)
      try {
          const res = await axios.put(`${API_BASE_URL}/api/users/me`, formData, {
              headers: { Authorization: `Bearer ${token}` }
          })
          
          // Update local auth store with new user info (merge)
          if (user) {
              login(token!, { ...user, ...res.data })
          }
          
          onSuccess()
          onClose()
      } catch (e) {
          alert("Failed to update profile")
      } finally {
          setLoading(false)
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200">
        <div className="bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Display Name</label>
                    <input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-navy"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Job Title</label>
                        <input 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Designer"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-navy"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                        <input 
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g. Hong Kong"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-navy"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
                    <textarea 
                        value={formData.bio}
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-navy resize-none"
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-mc-navy text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-opacity-90 transition-opacity"
                >
                    {loading ? "Saving..." : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  )
}

export default EditProfileModal
