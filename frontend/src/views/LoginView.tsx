import { useAuthStore } from '../store/auth'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

declare global {
    interface Window {
        google: any
    }
}

const LoginView = () => {
    const login = useAuthStore(state => state.login)
    const [error, setError] = useState<string | null>(null)
    const [isWeChat, setIsWeChat] = useState(false)

    useEffect(() => {
        // Detect WeChat
        const ua = navigator.userAgent.toLowerCase()
        if (ua.match(/MicroMessenger/i) == "micromessenger" as any) {
            setIsWeChat(true)
            return
        }

        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: "961699257299-6vh3d2a6pvq52qg2jl8lpbrtsb2gc4k5.apps.googleusercontent.com",
                callback: handleGoogleCallback
            })
            window.google.accounts.id.renderButton(
                document.getElementById("googleBtn"),
                { theme: "outline", size: "large", width: "250" }
            )
        }
    }, [])

    const handleGoogleCallback = async (response: any) => {
        setError(null)
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
                id_token: response.credential
            })
            login(res.data.access_token, res.data.user)
        } catch (e: any) {
            console.error("Login failed", e)
            if (e.response && e.response.status === 403) {
                setError("Access Denied: Your email is not in the company allowlist.")
            } else {
                setError("Login failed. Please try again.")
            }
        }
    }

    if (isWeChat) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-8 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">↗️</span>
                </div>
                <h2 className="text-xl font-bold mb-4">Open in Browser</h2>
                <p className="text-gray-300 leading-relaxed">
                    Google Login is not supported inside WeChat. 
                    <br/><br/>
                    Please tap the menu icon (top right) and select 
                    <br/>
                    <span className="font-bold text-white">"Open in Browser"</span>.
                </p>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white px-6">
            <div className="w-24 h-24 bg-mc-navy rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-mc-navy/30 rotate-3">
                <span className="text-4xl font-bold text-white">MC</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MC Hub</h1>
            <p className="text-gray-500 mb-8 text-center">Share your moments with the Master Concept family.</p>
            
            <div id="googleBtn" className="mb-6"></div>

            {error && (
                <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-lg border border-red-100 mb-4 text-center max-w-xs">
                    {error}
                </div>
            )}
            
            <p className="mt-4 text-xs text-gray-400">Internal Use Only</p>
        </div>
    )
}

export default LoginView
