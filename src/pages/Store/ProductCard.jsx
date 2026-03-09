import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plus, Store } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const discount = (product.price || 0) - (product.sale_price || 0);
  const hasPromo = product.sale_price < product.price && discount > 0;

  const storeName = product.stores?.name || "Boutique Officielle";
  const storeSlug = product.stores?.slug || ""; 

  const isAlreadyInStore = location.pathname.includes(storeSlug) && storeSlug !== "";

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
      <div className="relative aspect-[3/4] bg-gray-50 rounded-[1.8rem] overflow-hidden mb-3 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-lg">
        {renderMedia()}
        
        {/* --- BADGE BOUTIQUE INTELLIGENT --- */}
        {/* z-20 pour passer SOUS le Header (z-50) au scroll */}
        <div className="absolute bottom-3 left-3 z-20">
          {storeSlug ? (
            !isAlreadyInStore && (
              <Link 
                to={`/${storeSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/95 backdrop-blur-md border border-gray-100 pl-2 pr-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 transition-all duration-300 hover:bg-black group/store active:scale-95"
              >
                <Store size={12} className="text-orange-600 group-hover/store:text-white" />
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-800 group-hover/store:text-white">
                  {storeName}
                </span>
              </Link>
            )
          ) : (
            <div className="bg-red-500 text-white text-[7px] px-2 py-1 rounded-full uppercase font-black animate-pulse">
               Lien Store Manquant
            </div>
          )}
        </div>

        {/* Badge Promo - z-30 pour rester au dessus du badge boutique mais sous le header */}
        {hasPromo && (
          <div className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg italic z-30">
            -{Math.round((discount / product.price) * 100)}%
          </div>
        )}

        {/* Overlay Noir */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white text-orange-600 p-2.5 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300 border border-gray-100">
            <Plus size={20} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* --- INFOS --- */}
      <div className="flex flex-col px-2 space-y-0.5">
        <h3 className="text-xs font-black text-gray-900 uppercase italic truncate tracking-wide group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] text-gray-400 italic line-clamp-1 font-medium">
          {product.description || "Édition limitée"}
        </p>
        
        {/* --- SECTION PRIX --- */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-sm font-black italic text-orange-600">
            {(product.sale_price || product.price).toLocaleString()} <span className="text-[10px] not-italic">CFA</span>
          </span>

          {hasPromo && (
            <span className="text-[10px] font-bold text-gray-300 line-through decoration-gray-400">
              {product.price.toLocaleString()} CFA
            </span>
          )}
        </div>
      </div>
    </div>
  );
};