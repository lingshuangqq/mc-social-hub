import { ReactNode } from 'react'
import SideNav from '../components/SideNav'
import RightSidebar from '../components/RightSidebar'

interface DesktopLayoutProps {
    children: ReactNode
    activeTab: string
    setActiveTab: (tab: any) => void
    user: { name: string, avatar: string }
    onAddClick: () => void
    unreadCount: number
}

export default function DesktopLayout({
    children,
    activeTab,
    setActiveTab,
    user,
    onAddClick,
    unreadCount
}: DesktopLayoutProps) {
    return (
        <div className="min-h-screen bg-white flex justify-center">
            {/* Left Sidebar - Fixed */}
            <div className="w-64 flex-shrink-0">
                <SideNav 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onAddClick={onAddClick} 
                    unreadCount={unreadCount}
                    user={user}
                />
            </div>

            {/* Main Content - Flexible but constrained */}
            <main className="flex-1 max-w-2xl w-full border-r border-gray-100 min-h-screen">
                {children}
            </main>

            {/* Right Sidebar - Fixed (Visible on XL screens) */}
            <div className="hidden xl:block w-80 flex-shrink-0">
                <RightSidebar />
            </div>
        </div>
    )
}
