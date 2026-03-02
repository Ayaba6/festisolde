import { Eye, ShoppingCart, Heart } from 'lucide-react';

export const ProductCard = ({ product }) => {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
      {/* Badge Promo - Très fin */}
      {product.sale_price < product.price && (
        <div className="absolute top-4 left-4 z-10 bg-black text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest">
          -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
        </div>
      )}

      {/* Zone Image avec Overlay au Hover */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Actions rapides au survol (Style Mode) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button className="p-3 bg-white rounded-full shadow-xl hover:bg-[#0866FF] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                <Eye size={18} />
            </button>
            <button className="p-3 bg-white rounded-full shadow-xl hover:bg-[#0866FF] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-[400ms]">
                <ShoppingCart size={18} />
            </button>
        </div>
      </div>

      {/* Infos Produit */}
      <div className="p-5 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Électronique</p>
            <h3 className="text-sm font-semibold text-gray-900 tracking-tight group-hover:text-[#0866FF] transition-colors">
              {product.name}
            </h3>
          </div>
          <button className="text-gray-300 hover:text-red-500 transition-colors">
            <Heart size={18} />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black tracking-tighter text-gray-900">
            {product.sale_price?.toLocaleString()} <span className="text-[10px] ml-0.5">FCFA</span>
          </span>
          {product.sale_price < product.price && (
            <span className="text-xs text-gray-400 line-through decoration-red-400/40">
              {product.price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};