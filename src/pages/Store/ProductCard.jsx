import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  // Logique de calcul
  const discount = (product.price || 0) - (product.sale_price || 0);
  const hasPromo = product.sale_price < product.price && discount > 0;

  // Nettoyage des images
  const getImages = () => {
    const raw = product.images;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.startsWith('{')) {
      return raw.replace('{', '').replace('}', '').split(',').map(url => url.trim());
    }
    return typeof raw === 'string' ? [raw] : [];
  };

  const images = getImages();
  const isPack = product.product_type === 'pack' || 
                 product.category === 'Packs Promo' || 
                 product.name?.toLowerCase().includes('pack');

  const renderMedia = () => {
    const zoom = "transition-transform duration-1000 ease-out group-hover:scale-110";
    
    if (isPack && images.length >= 2) {
      return (
        <div className={`grid grid-cols-2 grid-rows-2 h-full w-full gap-[1px] bg-white ${zoom}`}>
          <img src={images[0]} className="w-full h-full object-cover" alt="" />
          <img src={images[1]} className="w-full h-full object-cover" alt="" />
          <div className="bg-orange-50 flex items-center justify-center overflow-hidden">
             {images[2] ? <img src={images[2]} className="w-full h-full object-cover" alt="" /> : <span className="text-[5px] font-black text-orange-200 italic uppercase">Festisolde</span>}
          </div>
          <div className="bg-orange-600 flex items-center justify-center p-1 overflow-hidden">
             {images[3] ? <img src={images[3]} className="w-full h-full object-cover" alt="" /> : <span className="text-[6px] font-bold text-white uppercase text-center leading-none italic">{product.name}</span>}
          </div>
        </div>
      );
    }
    return <img src={product.image_url || images[0]} className={`w-full h-full object-cover ${zoom}`} alt={product.name} />;
  };

  return (
    <div 
      onClick={() => navigate(`/produit/${product.id}`)}
      className="group cursor-pointer flex flex-col w-full"
    >
      {/* --- IMAGE --- */}
      <div className="relative aspect-[3/4] bg-gray-50 rounded-[1.8rem] overflow-hidden mb-3 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-lg">
        {renderMedia()}
        
        {/* Badge Promo */}
        {hasPromo && (
          <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg italic z-10">
            -{Math.round((discount / product.price) * 100)}%
          </div>
        )}

        {/* Bouton PLUS au survol */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500 flex items-center justify-center">
          <div className="bg-white text-orange-600 p-2.5 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300 border border-gray-100">
            <Plus size={20} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* --- INFOS --- */}
      <div className="flex flex-col px-1 space-y-1">
        {/* Titre augmenté (text-xs / 12px) */}
        <h3 className="text-xs font-black text-gray-900 uppercase italic truncate tracking-wide group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Description augmentée (text-[10px]) */}
        <p className="text-[10px] text-gray-400 italic line-clamp-1 font-medium leading-tight">
          {product.description || "Édition limitée Festisolde"}
        </p>

        {/* Bloc Prix Harmonisé (Prix promo augmenté en orange) */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-sm font-black italic text-orange-600">
            {(product.sale_price || product.price).toLocaleString()} 
            <span className="text-[10px] not-italic ml-1 font-bold tracking-tighter uppercase">FCFA</span>
          </span>

          {hasPromo && (
            <span className="text-[11px] text-gray-300 line-through font-bold">
              {product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};