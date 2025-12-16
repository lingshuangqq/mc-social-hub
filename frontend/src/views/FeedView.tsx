import { useState, useEffect } from 'react'
import axios from 'axios'
import InfiniteScroll from 'react-infinite-scroll-component'
import { API_BASE_URL } from '../config'
import MasonryGrid from '../components/MasonryGrid'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/ui'

const PAGE_SIZE = 20;

interface Props {
    searchQuery: string
    refreshTrigger?: number
    onPostClick: (id: number) => void
}

const FeedView = ({ searchQuery, onPostClick }: Props) => {
    const { feedRefreshKey, feedPosts, feedPage, lastFetchKey, feedScrollY, feedHasMore, setFeedCache, setFeedScroll } = useUIStore()

    const [isSearching, setIsSearching] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    // Restore Scroll on Mount
    useEffect(() => {
        if (!searchQuery && feedPosts.length > 0) {
            // Wait for render
            setTimeout(() => {
                window.scrollTo(0, feedScrollY)
            }, 50)
        }

        // Save Scroll on Unmount
        return () => {
            setFeedScroll(window.scrollY)
        }
    }, [])

    useEffect(() => {
        if (searchQuery) {
            // Search bypasses cache
            setIsSearching(true)
            axios.get(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`)
                .then(res => {
                    // Search results are usually small list, no pagination for now
                    setFeedCache(res.data, 1, feedRefreshKey, false)
                })
                .catch(err => console.error(err))
                .finally(() => setIsSearching(false))
        } else {
            // Normal Feed Logic
            if (feedRefreshKey !== lastFetchKey || feedPosts.length === 0) {
                loadPosts(true)
            }
            // Else: use cached data, do nothing
        }
    }, [searchQuery, feedRefreshKey])

    const loadPosts = async (reset = false) => {
        if (isLoading && !reset) return // Prevent duplicate
        setIsLoading(true)

        const currentPage = reset ? 0 : feedPage
        const offset = currentPage * PAGE_SIZE

        try {
            const res = await axios.get(`${API_BASE_URL}/api/feed?limit=${PAGE_SIZE}&offset=${offset}`)
            const newPosts = res.data

            let finalPosts = []
            let finalPage = currentPage

            if (reset) {
                finalPosts = newPosts
                finalPage = 1
            } else {
                finalPosts = [...feedPosts, ...newPosts]
                finalPage = currentPage + 1
            }

            const hasMore = newPosts.length >= PAGE_SIZE
            // Update Store
            setFeedCache(finalPosts, finalPage, feedRefreshKey, hasMore)

        } catch (e) {
            console.error("Failed to load feed", e)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePostClick = (postId: number) => {
        onPostClick(postId)
        // navigate(`/post/${postId}`)
    }

    const handleUserClick = (userId: number) => {
        navigate(`/users/${userId}`)
    }

    const displayPosts = feedPosts

    return (
        <div className="p-2">
            {isSearching ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mc-orange"></div>
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={displayPosts.length}
                    next={() => loadPosts(false)}
                    hasMore={feedHasMore && !searchQuery && (displayPosts.length >= PAGE_SIZE || displayPosts.length === 0)}
                    loader={<div className="text-center py-4 text-xs text-gray-400">Loading more posts...</div>}
                    endMessage={
                        displayPosts.length > 0 && <div className="text-center py-8 text-xs text-gray-300">No more posts</div>
                    }
                >
                    {displayPosts.length === 0 && !searchQuery ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                            <p>No posts yet</p>
                            <p className="text-xs mt-1">Be the first to share!</p>
                        </div>
                    ) : (
                        <MasonryGrid
                            posts={displayPosts}
                            onPostClick={handlePostClick}
                            onUserClick={handleUserClick}
                        />
                    )}
                </InfiniteScroll>
            )}
        </div>
    )
}

export default FeedView