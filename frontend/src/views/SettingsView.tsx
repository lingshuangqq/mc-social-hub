import { ArrowLeft, LogOut, User, ChevronRight, Info } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { useState } from 'react'
import EditProfileModal from './EditProfileModal'

interface Props {
    onBack: () => void
}

const SettingsView = ({ onBack }: Props) => {
    const { user, logout } = useAuthStore()
    const [showEditProfile, setShowEditProfile] = useState(false)

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            // Optional: Call Google to disable auto-select if needed
            if (window.google) {
                window.google.accounts.id.disableAutoSelect();
            }
            logout()
        }
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
                <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Account Section */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-4 border-b border-gray-50">
                        <img src={user?.avatar} className="w-12 h-12 rounded-full bg-gray-200" />
                        <div>
                            <h2 className="font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <User className="w-5 h-5 text-gray-400" />
                            Edit Profile
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                    {/* Switch Account Removed */}
                </section>

                {/* General */}
                <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Info className="w-5 h-5 text-gray-400" />
                            About MC Social Hub
                        </div>
                        <span className="text-xs text-gray-400">v1.0.0</span>
                    </button>
                </section>

                {/* Logout */}
                <button 
                    onClick={handleLogout}
                    className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center justify-center gap-2 text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>

            </div>

            {showEditProfile && (
                <EditProfileModal 
                    onClose={() => setShowEditProfile(false)} 
                    onSuccess={() => {
                        // Profile data refreshed automatically via store update
                    }} 
                />
            )}
        </div>
    )
}

export default SettingsView
