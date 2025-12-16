import { create } from 'zustand'

interface Post {
    id: number
    title: string
    content: string
    images: string[]
    likes: number
    collections: number
    author: { id: number, name: string, avatar_url: string }
}

interface UIState {
  feedRefreshKey: number
  triggerFeedRefresh: () => void
  
  // Feed Cache
  feedPosts: Post[]
  feedPage: number
  lastFetchKey: number
  feedScrollY: number
  feedHasMore: boolean
  setFeedCache: (posts: Post[], page: number, key: number, hasMore: boolean) => void
  setFeedScroll: (y: number) => void

  // Modal State
  isCreating: boolean
  setIsCreating: (isCreating: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  feedRefreshKey: 0,
  triggerFeedRefresh: () => set((state) => ({ feedRefreshKey: state.feedRefreshKey + 1 })),
  
  feedPosts: [],
  feedPage: 0,
  lastFetchKey: -1,
  feedScrollY: 0,
  feedHasMore: true,
  setFeedCache: (posts, page, key, hasMore) => set({ feedPosts: posts, feedPage: page, lastFetchKey: key, feedHasMore: hasMore }),
  setFeedScroll: (y) => set({ feedScrollY: y }),

  // Modal State
  isCreating: false,
  setIsCreating: (isCreating: boolean) => set({ isCreating })
}))