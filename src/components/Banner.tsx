"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function Banner() {
  const [banner, setBanner] = useState({ active: false, text: "" })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch("/api/settings/banner")
      .then(res => res.json())
      .then(data => setBanner(data))
      .catch(() => {})
  }, [])

  if (!banner.active || !banner.text || dismissed) return null

  return (
    <div className="bg-pink-100/90 backdrop-blur-sm border-b border-pink-200 py-3 relative flex items-center overflow-hidden transition-all duration-300">
      <div className="flex w-max animate-marquee">
        {/* Render text twice for seamless looping, and inside each block render multiple items to fill space */}
        {[1, 2].map((group) => (
          <div key={group} className="flex gap-8 pr-8 items-center">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-8">
                <span className="text-pink-900 text-sm font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                  {banner.text}
                </span>
                <span className="text-pink-400 text-xs">✨</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="absolute right-2 md:right-4 z-10 p-1.5 text-pink-500 hover:text-pink-800 bg-pink-100 hover:bg-pink-200 rounded-full transition-colors shadow-sm"
        aria-label="Fermer la bannière"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

