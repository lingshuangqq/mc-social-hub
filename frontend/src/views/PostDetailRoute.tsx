import { useNavigate, useParams } from 'react-router-dom'
import PostDetailModal from './PostDetailModal'
import { useUIStore } from '../store/ui'

export default function PostDetailRoute() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { triggerFeedRefresh } = useUIStore()

    if (!id) return null

    const handleClose = () => {
         // Check URL state or just go back
         // Ideally we want to know if we pushed state. 
         // But for now, standard router behavior:
         if (window.history.state && window.history.state.idx > 0) {
            navigate(-1)
        } else {
            navigate('/', { replace: true })
        }
    }

    const handleUserClick = (uid: number) => {
        navigate(`/users/${uid}`)
    }

    return (
        <PostDetailModal 
            postId={parseInt(id)} 
            onClose={handleClose}
            onDelete={() => {
                handleClose()
                triggerFeedRefresh()
            }}
            onUpdate={() => {}}
            onUserClick={handleUserClick}
        />
    )
}
