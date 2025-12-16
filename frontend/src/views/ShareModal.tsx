import { useState, useEffect, useRef } from 'react'
import { X, Download, Loader2, Link as LinkIcon, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { QRCodeSVG } from 'qrcode.react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { API_BASE_URL } from '../config'

interface Props {
    post: {
        id: number
        title: string
        content: string
        images: string[]
        author: { name: string, avatar_url: string }
    }
    onClose: () => void
}

const ShareModal = ({ post, onClose }: Props) => {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [generating, setGenerating] = useState(true)
    const [proxyImageSrc, setProxyImageSrc] = useState<string | null>(null)
    const [proxyAvatarSrc, setProxyAvatarSrc] = useState<string | null>(null)
    const [canShareFiles, setCanShareFiles] = useState(false)
    const posterRef = useRef<HTMLDivElement>(null)

    const shareUrl = `${window.location.origin}/post/${post.id}`

    // Check System Share Support
    useEffect(() => {
        if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
            // Check if we can share files (dummy file check)
            try {
                const file = new File([''], 'check.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    setCanShareFiles(true);
                }
            } catch (e) {
                // Ignore
            }
        }
    }, []);

    // Helper to convert URL to Blob URL to avoid CORS issues in Canvas
    const loadImage = async (url: string) => {
        try {
            // Use backend proxy to ensure CORS headers or access
            const proxyUrl = `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(url)}`
            const response = await fetch(proxyUrl);
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error("Failed to load image for canvas via proxy", url, e);
            // Fallback to original URL
            return url; 
        }
    };

    useEffect(() => {
        const prepareAndGenerate = async () => {
            // 1. Pre-load images in parallel
            const promises = []
            
            if (post.images[0]) {
                promises.push(loadImage(post.images[0]).then(blob => setProxyImageSrc(blob)))
            }
            if (post.author.avatar_url) {
                promises.push(loadImage(post.author.avatar_url).then(blob => setProxyAvatarSrc(blob)))
            }
            
            await Promise.all(promises)

            // 2. Wait for React to render the images (Blob URLs are fast, but iOS needs a moment)
            await new Promise(r => setTimeout(r, 300));

            // 3. Capture
            if (!posterRef.current) return
            try {
                const canvas = await html2canvas(posterRef.current, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false
                })
                setImageUrl(canvas.toDataURL('image/png'))
            } catch (e) {
                console.error("Poster generation failed", e)
                alert("Failed to generate poster. Please try again.")
            } finally {
                setGenerating(false)
            }
        }

        prepareAndGenerate()
    }, [])

    const handleDownload = () => {
        if (!imageUrl) return
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `mc-share-${post.id}.png`
        link.click()
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy", err);
        }
    }

    const handleSystemShare = async () => {
        if (!imageUrl) return;
        try {
            // Convert Base64 back to File
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], `mc-share-${post.id}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Share Poster',
                    // text: post.title // Some apps ignore text when sharing files
                });
            } else {
                // Fallback to link sharing if file sharing fails logic (shouldn't reach here if canShareFiles is true)
                await navigator.share({
                    title: post.title,
                    text: post.content,
                    url: shareUrl
                });
            }
        } catch (e) {
            console.error("Share failed", e);
        }
    }
    
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-white rounded-xl overflow-hidden flex flex-col shadow-2xl max-h-[80dvh]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                    <h3 className="font-bold text-gray-900">Share Post</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50 p-6 flex flex-col items-center justify-center min-h-[300px] overflow-y-auto">
                    {generating ? (
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin text-mc-orange" />
                            <span className="text-sm">Generating poster...</span>
                        </div>
                    ) : (
                        imageUrl ? (
                            <img 
                                src={imageUrl} 
                                className="w-full h-auto rounded-lg shadow-lg border border-gray-200" 
                                alt="Share Poster" 
                            />
                        ) : (
                            <div className="text-center text-red-500 text-sm">
                                Generation Failed
                            </div>
                        )
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-3">
                    <div className="flex gap-2">
                        {/* Copy Link (Always available) */}
                        <button 
                            onClick={handleCopyLink}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                            <LinkIcon className="w-4 h-4" />
                            Link
                        </button>

                        {/* System Share (Mobile Only) */}
                        {!isDesktop && canShareFiles && (
                            <button 
                                onClick={handleSystemShare}
                                disabled={generating}
                                className="flex-1 bg-mc-navy text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        )}

                        {/* Download (Desktop Always, or Mobile Fallback if share fails) */}
                        {(isDesktop || (!canShareFiles && !isDesktop)) && (
                            <button 
                                onClick={handleDownload}
                                disabled={generating}
                                className="flex-1 bg-mc-navy text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {isDesktop ? "Download" : "Save"}
                            </button>
                        )}
                    </div>
                    
                    {!canShareFiles && !isDesktop && (
                        <p className="text-xs text-center text-gray-400 mt-1">
                            Long press image to save or share
                        </p>
                    )}
                </div>
            </div>

            {/* The Actual Poster DOM: Moved off-screen instead of opacity-0 */}
            <div className="fixed top-0 left-[-9999px] z-[-50] pointer-events-none">
                <div ref={posterRef} className="w-[375px] bg-white p-5 flex flex-col gap-4">
                    {/* Author Header */}
                    <div className="flex items-center gap-3">
                        {proxyAvatarSrc ? (
                            <img 
                                src={proxyAvatarSrc} 
                                className="w-10 h-10 rounded-full border border-gray-100 object-cover" 
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                        )}
                        <span className="font-bold text-gray-900">{post.author.name}</span>
                    </div>

                    {/* Main Image (Fixed Height, Background Cover) */}
                    {proxyImageSrc ? (
                        <div 
                            className="w-full h-[300px] bg-gray-100 rounded-lg border border-gray-100 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${proxyImageSrc})` }}
                        />
                    ) : (
                        <div className="w-full h-[300px] bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center text-gray-300">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xs">Loading...</span>
                        </div>
                    )}

                    {/* Text */}
                    <div>
                        {post.title && <h2 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{post.title}</h2>}
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {post.content.length > 80 ? post.content.slice(0, 80) + "..." : post.content}
                        </p>
                    </div>

                    {/* Footer / QR */}
                    <div className="flex items-end justify-between mt-4 pt-4 border-t border-dashed border-gray-200">
                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-black text-mc-navy tracking-tight">MC Social Hub</span>
                            <span className="text-[10px] text-gray-400">Discover & Share moments</span>
                        </div>
                        <div className="bg-white p-1">
                            <QRCodeSVG value={shareUrl} size={72} fgColor="#002A54" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShareModal