import { useState, useEffect } from 'react'
import { Heart, MessageCircle, User, Star } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/auth'
import { API_BASE_URL } from '../config'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
    id: number
    type: 'like' | 'comment' | 'follow' | 'collect'
    sender: { name: string, avatar_url: string }
    post_id?: number
    post?: { title: string, images: string[] }
    is_read: boolean
    created_at: string
}

interface Props {
    onPostClick: (id: number) => void
}

const NotificationsView = ({ onPostClick }: Props) => {
    const { token } = useAuthStore()
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        fetchData()
        markAllRead()
    }, [])

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(res.data.items)
        } catch (e) {
            console.error(e)
        }
    }

    const markAllRead = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/notifications/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
        } catch (e) {
            console.error(e)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="w-4 h-4 fill-mc-orange text-mc-orange" />
            case 'comment': return <MessageCircle className="w-4 h-4 fill-blue-500 text-blue-500" />
            case 'follow': return <User className="w-4 h-4 fill-green-500 text-green-500" />
            case 'collect': return <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />
        }
    }

    const getText = (notif: Notification) => {
        switch (notif.type) {
            case 'like': return `liked your post.`
            case 'comment': return `commented on your post.`
            case 'follow': return `started following you.`
            case 'collect': return `collected your post.`
            default: return 'interacted with you.'
        }
    }

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
                <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
                        No notifications yet.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                onClick={() => {
                                    console.log("Click notif", notif)
                                    if (notif.post_id) onPostClick(notif.post_id)
                                    else console.warn("No post_id for notif", notif)
                                }}
                                className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="relative">
                                    <img src={notif.sender.avatar_url} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        {getIcon(notif.type)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-bold">{notif.sender.name}</span> {getText(notif)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {formatDistanceToNow(new Date(notif.created_at))} ago
                                    </p>
                                </div>
                                {notif.post && notif.post.images && notif.post.images.length > 0 && (
                                    <img src={notif.post.images[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationsView
