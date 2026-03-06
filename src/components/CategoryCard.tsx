"use client";
import Link from 'next/link'
import { useState } from 'react'

type Category = {
  id: string
  name: string
  description?: string
  count?: number
  image?: string
}

export default function CategoryCard({ cat }: { cat: Category }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden hover:border-lime-600/40 transition-all p-4 flex flex-col items-center text-center cursor-pointer"
      onClick={() => setOpen((s) => !s)}
    >
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 rounded-full overflow-hidden mb-3 relative"
        style={{ backgroundImage: `url(${cat.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        role="img"
        aria-label={cat.name}
      />

      <div className="flex-1">
        <h3 className="text-md font-semibold text-white group-hover:text-lime-500 transition-colors">{cat.name}</h3>
        {cat.description && <p className="text-xs text-neutral-400 mt-1 hidden md:block">{cat.description}</p>}
      </div>

      <div className="mt-3 w-full flex items-center justify-center">
        <Link
          href={`/agricultor/mercado?category=${cat.id}`}
          onClick={(e) => e.stopPropagation()}
          className={`px-3 py-1.5 bg-lime-600 rounded-md text-sm font-medium hover:bg-lime-500 transition-colors ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto`}
        >
          Ver
        </Link>
      </div>
    </div>
  )
}
