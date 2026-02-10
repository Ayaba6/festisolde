import React from 'react'

export default function ProductCardSkeleton() {
  return (
    <div className="group min-w-[280px] lg:min-w-[320px] bg-white p-4 rounded-[3rem] border border-slate-100 flex flex-col animate-pulse">
      
      {/* 1. Zone Image Placeholder - On utilise le ratio 4/3 pour correspondre à la FlashCard */}
      <div className="relative aspect-[4/3] bg-slate-100 rounded-[2.2rem] overflow-hidden mb-6">
        {/* Badge promo placeholder */}
        <div className="absolute top-4 left-4 w-12 h-6 bg-slate-200 rounded-full" />
      </div>

      {/* 2. Zone Contenu Textuel */}
      <div className="px-2 pb-2">
        
        {/* Titre Placeholder (Simule le texte en italique) */}
        <div className="h-4 w-3/4 bg-slate-100 rounded-full mb-3" />

        {/* Zone Prix : Simule les deux lignes (Promo et Réel) */}
        <div className="flex flex-col gap-2 mb-6">
          {/* Prix Promo (Rouge en réel, plus foncé ici) */}
          <div className="h-7 w-32 bg-slate-200 rounded-lg" />
          {/* Prix Réel (Noir barré en réel, très clair ici) */}
          <div className="h-3 w-20 bg-slate-50 rounded-full" />
        </div>

        {/* Bouton Action : Large et arrondi comme le bouton "Ajouter au panier" */}
        <div className="w-full h-[52px] bg-slate-200 rounded-[1.5rem]" />
      </div>
    </div>
  )
}