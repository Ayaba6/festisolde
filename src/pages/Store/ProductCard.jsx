import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // 1. Nettoyage et récupération des images
  const getImages = () => {
    const raw = product.images;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    
    if (typeof raw === 'string' && raw.startsWith('{')) {
      return raw.replace('{', '').replace('}', '').split(',').map(url => url.trim());
    }
    
    if (typeof raw === 'string' && raw.startsWith('[')) {
      try { return JSON.parse(raw); } catch (e) { return []; }
    }

    return typeof raw === 'string' ? [raw] : [];
  };

  const images = getImages();
  
  const isPack = 
    product.product_type === 'pack' || 
    product.category === 'Packs Promo' || 
    product.name?.toLowerCase().includes('pack');

  // 2. LOGIQUE DE GRILLE DE 4 IMAGES (Carré Royal)
  const renderMedia = () => {
    // Si c'est un pack avec plusieurs images (minimum 2 pour faire une grille)
    if (isPack && images.length >= 2) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-[2px] bg-white">
          {/* Case 1 : Image principale */}
          <div className="relative overflow-hidden">
            <img src={images[0]} className="w-full h-full object-cover" alt="p1" />
          </div>

          {/* Case 2 : Deuxième image */}
          <div className="relative overflow-hidden">
            <img src={images[1]} className="w-full h-full object-cover" alt="p2" />
          </div>

          {/* Case 3 : Troisième image */}
          <div className="relative overflow-hidden">
            {images[2] ? (
              <img src={images[2]} className="w-full h-full object-cover" alt="p3" />
            ) : (
              <div className="h-full w-full bg-orange-50 flex items-center justify-center">
                <span className="text-[6px] font-black text-orange-400 uppercase italic">Festisolde</span>
              </div>
            )}
          </div>

          {/* Case 4 : Quatrième image ou Nom du produit */}
          <div className="relative overflow-hidden">
            {images[3] ? (
              <img src={images[3]} className="w-full h-full object-cover" alt="p4" />
            ) : (
              <div className="h-full w-full bg-orange-600 flex items-center justify-center p-1">
                <span className="text-[7px] font-black text-white uppercase text-center leading-none tracking-tighter">
                  {product.name}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Affichage standard si pas un pack
    const mainImage = product.image_url || images[0];
    return (
      <img 
        src={mainImage} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        alt={product.name} 
      />
    );
  };

  return (
    <div 
      onClick={() => navigate(`/produit/${product.id}`)}
      className="group cursor-pointer flex flex-col w-full"
    >
      {/* Conteneur avec Aspect Ratio 1/1 (Carré) ou 3/4 pour la grille */}
      <div className="relative aspect-[3/4] bg-gray-50 rounded-[2rem] overflow-hidden mb-4 border border-gray-100 shadow-sm transition-all hover:shadow-md">
        {renderMedia()}
        
        {/* Badge Pack */}
        {isPack && (
          <div className="absolute top-3 left-3 bg-black text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest z-10 shadow-lg italic">
            Pack
          </div>
        )}

        {/* Badge Promo */}
        {product.sale_price < product.price && (
          <div className="absolute top-3 right-3 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg italic z-10">
            -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="space-y-1 px-1">
        <h3 className="text-[11px] font-bold text-gray-900 uppercase truncate tracking-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black italic text-gray-900">
            {(product.sale_price || product.price || 0).toLocaleString()} 
            <span className="text-[9px] not-italic ml-1">CFA</span>
          </span>
          {product.sale_price < product.price && (
            <span className="text-[10px] text-gray-300 line-through font-bold">
              {product.price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};