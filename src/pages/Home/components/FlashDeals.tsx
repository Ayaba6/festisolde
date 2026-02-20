import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { ShoppingCart, Zap, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

interface FlashProduct {
  id: string;
  title: string;
  images: string[];
  promo_price: number;
  price: number;
  stock: number;
  category: string;
  shop_id?: string;
}

export default function FlashDeals({ setCart }: { setCart: any }) {
  const [looks, setLooks] = useState<FlashProduct[][]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    async function fetchAndBuildLooks() {
      setLoading(true)
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .not('promo_price', 'is', null)
          .gt('stock', 0);

        if (error) throw error;

        if (products && products.length > 0) {
          const filterByKeywords = (keywords: string[], exclude: string[] = []) => {
            return products.filter(p => {
              const cat = p.category?.toLowerCase() || "";
              const hasIncluded = keywords.some(key => cat.includes(key.toLowerCase()));
              const hasExcluded = exclude.some(ex => cat.includes(ex.toLowerCase()));
              return hasIncluded && !hasExcluded;
            });
          };

          const hauts = filterByKeywords(['t-shirt', 'tshirt', 'pull', 'chemise', 'veste', 'top', 'polo', 'sweat']);
          const bas = filterByKeywords(['pantalon', 'jean', 'short', 'bas', 'jogging', 'culotte'], ['basket', 'chaussure']);
          const chaussures = filterByKeywords(['basket', 'chaussure', 'sneaker', 'mous', 'soulier', 'pied']);
          const accessoires = filterByKeywords(['montre', 'sac', 'lunette', 'casquette', 'ceinture', 'bijou', 'parfum', 'accessoire']);

          const generatedLooks = [];
          for (let i = 0; i < 4; i++) {
            const row: FlashProduct[] = [];
            if (hauts[i]) row.push(hauts[i]);
            if (bas[i]) row.push(bas[i]);
            if (chaussures[i]) row.push(chaussures[i]);
            if (accessoires[i]) row.push(accessoires[i]);
            if (row.length > 0) generatedLooks.push(row);
          }
          setLooks(generatedLooks);
        }
      } catch (err) {
        console.error("Erreur FlashDeals:", err);
      } finally {
        setLoading(false)
      }
    }
    fetchAndBuildLooks();

    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date().setHours(23, 59, 59);
      const diff = end - now.getTime();
      if (diff <= 0) clearInterval(timer);
      else setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [])

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-FR').format(p) + ' F'

  const handleAddToCart = (product: FlashProduct) => {
    setAddingId(product.id);
    
    setCart((prev: any[]) => {
      const variantId = `${product.id}-default-default`;
      const existing = prev.find((item: any) => item.variantId === variantId);
      
      let newCart;
      if (existing) {
        newCart = prev.map((item: any) => 
          item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { 
          ...product, 
          variantId, 
          selectedSize: 'Standard', 
          selectedColor: 'Unique', 
          quantity: 1,
          displayPrice: product.promo_price,
          shop_id: product.shop_id 
        }];
      }
      
      localStorage.setItem('festi_cart', JSON.stringify(newCart));
      return newCart;
    });

    toast.success(`${product.title} ajouté ! 🌹`);
    setTimeout(() => setAddingId(null), 1000);
  }

  return (
    <section className="py-6 bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER ET DÉCOMPTE RÉDUITS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
            Ventes <span className="text-brand-primary">Flash</span>
          </h2>
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl border-b-2 border-brand-primary shadow-lg">
             <div className="font-mono text-lg font-black text-brand-primary">
                {String(timeLeft.hours).padStart(2,'0')}:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')}
             </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="h-72 bg-slate-200 rounded-[2.5rem]" />)}
          </div>
        ) : looks.length > 0 ? (
          looks.map((row, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
               <div className="flex items-center gap-4 mb-4">
                 <div className="h-px flex-1 bg-slate-200"></div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Style Inspiration #{idx + 1}</h3>
                 <div className="h-px flex-1 bg-slate-200"></div>
               </div>
               
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {row.map((item) => (
                    <div key={item.id} className="group bg-white p-3 md:p-4 rounded-[2.8rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                      <Link to={`/product/${item.id}`} className="relative block aspect-[4/5] overflow-hidden rounded-[2.2rem] mb-5 bg-slate-50">
                        <img src={item.images?.[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg">
                          -{Math.round(((item.price - item.promo_price) / item.price) * 100)}%
                        </div>
                      </Link>
                      
                      <div className="text-center px-2">
                        <h4 className="font-bold text-[11px] text-slate-800 uppercase truncate mb-2 italic">
                          {item.title}
                        </h4>
                        <div className="mb-5">
                          <div className="text-2xl font-black text-slate-900 leading-none">{formatPrice(item.promo_price)}</div>
                          <div className="text-[11px] text-slate-300 line-through font-bold mt-1">{formatPrice(item.price)}</div>
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(item)}
                          disabled={addingId === item.id}
                          className={`w-full py-4 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                            addingId === item.id ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-900 text-white hover:bg-brand-primary'
                          }`}
                        >
                          {addingId === item.id ? <Check size={14} strokeWidth={3} /> : <ShoppingCart size={14} />}
                          {addingId === item.id ? 'Ajouté !' : 'Ajouter au panier'}
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
            <Zap className="mx-auto text-slate-200 mb-4" size={50} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucune vente flash disponible</p>
          </div>
        )}
      </div>
    </section>
  )
}