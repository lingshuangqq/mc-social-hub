import { Home, Compass, Bell, User, PlusCircle, Settings } from 'lucide-react'

interface SideNavProps {
    activeTab: string
    setActiveTab: (tab: any) => void
    onAddClick: () => void
    unreadCount: number
    user: { name: string, avatar: string }
}

export default function SideNav({ activeTab, setActiveTab, onAddClick, unreadCount, user }: SideNavProps) {
    const navItems = [
        { id: 'feed', icon: Home, label: 'Home' },
        { id: 'explore', icon: Compass, label: 'Explore' },
        { id: 'notifications', icon: Bell, label: 'Notifications', count: unreadCount },
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
            {/* Logo Area */}
            <div className="p-6">
                <h1 className="text-2xl font-bold text-mc-navy tracking-tight">MC Social</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                    ? 'bg-mc-navy text-white shadow-lg shadow-mc-navy/20' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-mc-navy'
                            }`}
                        >
                            <div className="relative">
                                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                {item.count !== undefined && item.count > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                        {item.count > 9 ? '9+' : item.count}
                                    </span>
                                )}
                            </div>
                            <span className={`font-medium text-lg ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    )
                })}

                {/* Create Button */}
                <button 
                    onClick={onAddClick}
                    className="w-full mt-6 bg-mc-orange text-white py-3 rounded-full font-bold text-lg shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                    <PlusCircle className="w-6 h-6" />
                    <span>Post</span>
                </button>
            </nav>

            {/* User Mini Profile (Bottom) */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-200 object-cover" alt={user.name} />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">View Profile</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
