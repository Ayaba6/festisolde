import React from 'react'

export default function ProductCardSkeleton() {
  return (
    <div className="group bg-white rounded-[2rem] p-3 border border-gray-50 flex flex-col h-full animate-pulse">
      
      {/* 1. Zone Image Placeholder */}
      <div className="relative aspect-[4/5] bg-gray-100 rounded-[1.5rem] overflow-hidden">
        {/* Badge promo placeholder */}
        <div className="absolute top-3 left-3 w-10 h-5 bg-gray-200 rounded-lg" />
      </div>

      {/* 2. Zone Contenu Textuel */}
      <div className="pt-5 pb-2 px-2 flex flex-col flex-grow text-left">
        
        {/* Catégorie Placeholder */}
        <div className="mb-3">
          <div className="h-3 w-16 bg-gray-100 rounded-md" />
        </div>

        {/* Titre Placeholder (Deux lignes pour simuler le line-clamp-2) */}
        <div className="space-y-2 mb-4 h-10">
          <div className="h-3.5 w-full bg-gray-100 rounded-full" />
          <div className="h-3.5 w-3/4 bg-gray-100 rounded-full" />
        </div>

        {/* Bas de carte : Prix et Bouton Plus */}
        <div className="mt-auto flex items-center justify-between">
          <div className="space-y-2">
            {/* Simulation prix promo (optionnel) */}
            <div className="h-2.5 w-12 bg-gray-50 rounded-full" />
            {/* Prix principal */}
            <div className="h-6 w-28 bg-gray-200 rounded-xl" />
          </div>

          {/* Bouton Action Placeholder */}
          <div className="w-11 h-11 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}