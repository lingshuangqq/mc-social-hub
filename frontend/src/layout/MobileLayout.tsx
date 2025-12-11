import React, { ReactNode } from 'react'
import BottomNav from '../components/BottomNav'
import { Search, X } from 'lucide-react'

interface MobileLayoutProps {
    children: ReactNode
    activeTab: 'feed' | 'explore' | 'profile' | 'settings' | 'notifications'
    setActiveTab: (tab: any) => void
    user: { avatar: string }
    searchQuery: string
    setSearchQuery: (q: string) => void
    onSearchSubmit: (e: React.FormEvent) => void
    onClearSearch: () => void
    onAddClick: () => void
    unreadCount: number
    showHeader?: boolean
}

export default function MobileLayout({
    children,
    activeTab,
    setActiveTab,
    user,
    searchQuery,
    setSearchQuery,
    onSearchSubmit,
    onClearSearch,
    onAddClick,
    unreadCount,
    showHeader = true
}: MobileLayoutProps) {
    return (
        <div className="h-[100dvh] bg-gray-50 flex flex-col supports-[height:100dvh]:h-[100dvh] h-screen">
            {showHeader && (
                <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100 gap-3">
                    <div className="flex-1 relative">
                        <form onSubmit={onSearchSubmit} className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search MC Hub..." 
                                className="w-full bg-gray-100 text-sm py-2 pl-9 pr-8 rounded-full focus:outline-none focus:ring-1 focus:ring-mc-navy/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    type="button"
                                    onClick={onClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </form>
                    </div>
                    <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200 shrink-0" alt="User Avatar" />
                </header>
            )}

            <main id="scrollableDiv" className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                {children}
            </main>

            {activeTab !== 'settings' && (
                <BottomNav 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onAddClick={onAddClick} 
                    unreadCount={unreadCount} 
                />
            )}
        </div>
    )
}
