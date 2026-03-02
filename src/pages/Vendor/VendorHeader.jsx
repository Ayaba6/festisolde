import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function VendorHeader({ storeName }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      
      {/* 1. Recherche (Style Chariow avec raccourci clavier) */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            🔍
          </span>
          <input 
            type="text" 
            placeholder="Trouvez n'importe quoi : Appuyez sur K sur votre clavier"
            className="w-full bg-gray-50 border border-transparent group-hover:bg-gray-100 focus:bg-white focus:border-gray-200 py-2 pl-10 pr-4 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* 2. Actions à droite */}
      <div className="flex items-center gap-4">
        
        {/* Bouton Voir ma boutique */}
        <button 
          onClick={() => window.open(`/store/${storeName?.toLowerCase()}`, '_blank')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          👁️ Visiter ma boutique
        </button>

        {/* Notifications & Plus */}
        <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
          <button className="p-2 hover:bg-gray-100 rounded-full transition relative">
            🔔
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {/* Avatar Utilisateur */}
          <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-xl transition">
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs border border-orange-200">
              C
            </div>
            <span className="text-sm font-bold text-gray-700 hidden lg:block">Compaore</span>
            <span className="text-[10px] text-gray-400">▼</span>
          </button>
        </div>
      </div>
    </header>
  );
}