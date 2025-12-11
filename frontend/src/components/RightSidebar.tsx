export default function RightSidebar() {
    return (
        <div className="hidden xl:block w-80 h-screen fixed right-0 top-0 p-6 border-l border-gray-100 overflow-y-auto">
            {/* Search Widget */}
            <div className="mb-8">
                <input 
                    type="text" 
                    placeholder="Search MC Hub..." 
                    className="w-full bg-gray-100 py-3 px-5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-mc-navy/10"
                />
            </div>

            {/* Trending/Suggestions Placeholder */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">What's happening</h3>
                <div className="space-y-4">
                    <div className="text-sm">
                        <p className="text-gray-500 text-xs">Trending in Design</p>
                        <p className="font-semibold text-gray-800">#Minimalism</p>
                        <p className="text-gray-400 text-xs">1,243 posts</p>
                    </div>
                    <div className="text-sm">
                        <p className="text-gray-500 text-xs">Trending in Tech</p>
                        <p className="font-semibold text-gray-800">#GeminiAPI</p>
                        <p className="text-gray-400 text-xs">856 posts</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-bold text-gray-900 mb-4">Who to follow</h3>
                 <p className="text-sm text-gray-500">Coming soon...</p>
            </div>
            
            <footer className="mt-8 text-xs text-gray-400 text-center">
                © 2025 MC Social Hub
            </footer>
        </div>
    )
}
