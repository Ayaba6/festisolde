import { Package, Plus, ArrowRight, ShoppingCart } from 'lucide-react'

export default function PackeoSection() {
  const packs = [
    {
      id: 'pack-gentleman',
      title: "Pack Gentleman Express",
      description: "Le look complet pour vos événements : Chemise slim, Pantalon chino, Mocassins, Montre quartz et Bracelet cuir.",
      oldPrice: "65.000",
      newPrice: "42.500",
      image: "https://images.unsplash.com/photo-1594932224828-b4b059b8fe0e?q=80&w=600",
      items: ["Chemise", "Pantalon", "Chaussures", "Montre", "Bracelet"]
    },
    {
      id: 'pack-urbain',
      title: "Pack Streetwear Pro",
      description: "L'essentiel du style urbain : T-shirt oversize, Jean cargo, Sneakers, Casquette et Gourmette.",
      oldPrice: "55.000",
      newPrice: "35.000",
      image: "https://images.unsplash.com/photo-1552831388-6a0b3575b32a?q=80&w=600",
      items: ["T-shirt", "Jean", "Sneakers", "Casquette", "Gourmette"]
    }
  ]

  return (
    <section className="py-20 bg-brand-dark text-white overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TITRE DE SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black tracking-tighter mb-4">
              PACK<span className="text-brand-primary italic">EO</span>
            </h2>
            <p className="text-slate-400 max-w-md font-medium">
              Ne cherchez plus votre style. Nos experts composent des looks complets à prix cassés.
            </p>
          </div>
          <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl">
            <span className="text-brand-primary font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Package size={20} /> Économisez jusqu'à 40% par pack
            </span>
          </div>
        </div>

        {/* GRILLE DES PACKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {packs.map((pack) => (
            <div key={pack.id} className="relative group bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col md:flex-row p-4 transition-all hover:bg-white/10 hover:border-brand-primary/50">
              
              {/* IMAGE DU PACK */}
              <div className="w-full md:w-56 h-64 md:h-auto rounded-[2rem] overflow-hidden relative">
                <img src={pack.image} alt={pack.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent md:hidden" />
              </div>

              {/* DÉTAILS DU PACK */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black mb-3">{pack.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">{pack.description}</p>
                  
                  {/* LISTE DES ARTICLES AVEC PETITS + */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {pack.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest text-brand-primary">
                          {item}
                        </span>
                        {idx !== pack.items.length - 1 && <Plus size={12} className="text-slate-600" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 line-through font-bold">{pack.oldPrice} F</span>
                    <span className="text-3xl font-black text-white">{pack.newPrice} <span className="text-xs text-brand-primary">F</span></span>
                  </div>
                  <button className="bg-brand-primary hover:bg-white text-brand-dark font-black p-4 rounded-2xl transition-all active:scale-90 shadow-xl shadow-brand-primary/20">
                    <ShoppingCart size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}