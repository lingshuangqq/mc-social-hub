import { LayoutGrid, User, Bell, Plus } from 'lucide-react'

type ActiveTab = 'feed' | 'profile' | 'settings' | 'notifications';

interface Props {
    activeTab: ActiveTab
    setActiveTab: (tab: ActiveTab) => void
    onAddClick: () => void
    unreadCount: number
}

const BottomNav = ({ activeTab, setActiveTab, onAddClick, unreadCount }: Props) => {
    return (
       <nav className="bg-white border-t border-gray-100 pb-safe pt-2 px-2 flex justify-around items-center h-14 shrink-0 z-20">
           <button 
                onClick={() => setActiveTab('feed')}
                className={`flex-1 flex flex-col items-center gap-0.5 ${activeTab === 'feed' ? 'text-mc-navy' : 'text-gray-400'}`}
           >
               <LayoutGrid className={`w-6 h-6 ${activeTab === 'feed' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'feed' ? 0 : 2} />
               <span className="text-[10px] font-medium">Home</span>
           </button>
           
           <button 
                onClick={onAddClick}
                className="mx-2 flex items-center justify-center w-10 h-8 bg-mc-orange text-white rounded-lg shadow-sm hover:scale-105 transition-transform active:scale-95"
           >
               <Plus className="w-5 h-5" strokeWidth={3} />
           </button>

           <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 flex flex-col items-center gap-0.5 relative ${activeTab === 'notifications' ? 'text-mc-navy' : 'text-gray-400'}`}
           >
               <div className="relative">
                   <Bell className={`w-6 h-6 ${activeTab === 'notifications' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'notifications' ? 0 : 2} />
                   {unreadCount > 0 && (
                       <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                   )}
               </div>
               <span className="text-[10px] font-medium">Inbox</span>
           </button>
           
           <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 flex flex-col items-center gap-0.5 ${activeTab === 'profile' ? 'text-mc-navy' : 'text-gray-400'}`}
           >
               <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'profile' ? 0 : 2} />
               <span className="text-[10px] font-medium">Me</span>
           </button>
       </nav>
    )
}

export default BottomNav
