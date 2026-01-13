// components/ProductCardSkeleton.tsx
import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] p-3 border border-gray-100 animate-pulse flex flex-col">
      {/* Squelette de l'image */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200" />

      {/* Squelette du contenu */}
      <div className="mt-4 px-2 pb-2 flex-grow flex flex-col justify-between">
        {/* Ligne de titre */}
        <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-3" />
        
        <div className="flex items-center justify-between">
          {/* Ligne de prix */}
          <div className="h-5 bg-gray-200 rounded-full w-1/3" />
          
          {/* Cercle du bouton */}
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}