import React from 'react'

export default function ProductCardSkeleton() {
  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden border border-gray-50 flex flex-col relative animate-pulse">
      
      {/* 1. Placeholder Image (Zone grise) */}
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        {/* Petit badge placeholder en haut à gauche */}
        <div className="absolute top-3 left-3 w-12 h-5 bg-gray-200 rounded-lg" />
      </div>

      {/* 2. Placeholder Contenu Textuel */}
      <div className="p-5 flex flex-col flex-grow text-left">
        
        {/* Catégorie Placeholder (Petite barre) */}
        <div className="mb-3">
          <div className="h-2 w-16 bg-gray-100 rounded-full" />
        </div>

        {/* Titre Placeholder (Deux barres de longueurs différentes) */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-100 rounded-full" />
          <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
        </div>

        {/* Bas de carte : Prix et Bouton */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col gap-2">
            {/* Prix Placeholder */}
            <div className="h-6 w-24 bg-gray-200 rounded-lg" />
            {/* Promo Placeholder */}
            <div className="h-3 w-12 bg-gray-100 rounded-full" />
          </div>

          {/* Bouton Plus Placeholder (Le carré arrondi) */}
          <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}