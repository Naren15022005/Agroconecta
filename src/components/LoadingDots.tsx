"use client"
import React from 'react'

export default function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse" />
      <span className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse" />
      <span className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse" />
    </div>
  )
}
