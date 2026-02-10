import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' 
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade, Navigation } from 'swiper/modules'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

export default function LiquidationHero() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLiquidation() {
      try {
        setLoading(true)
        // On récupère les produits tagués liquidation
        let { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('category', '%liquidation%') 
          .gt('stock', 0)
          .limit(8)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Erreur:', error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLiquidation()
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="relative bg-[#050505] text-white border-b border-white/5 overflow-hidden font-sans">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="h-[420px] lg:h-[380px] w-full"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="bg-[#050505]">
            <div className="container mx-auto px-4 lg:px-16 h-full flex items-center">
              
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center w-full">
                
                {/* --- BLOC IMAGE : CADRE PAYSAGE & IMAGE ADAPTÉE --- */}
                <div className="relative flex justify-center order-1 lg:order-2 h-[180px] lg:h-[260px] w-full">
                  
                  {/* Le Cadre Large */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative w-[280px] h-[150px] lg:w-[500px] lg:h-[250px] border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden shadow-2xl"
                  >
                    {/* Coins de focus rouges */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-red-600 z-20"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-red-600 z-20"></div>
                    
                    {/* Image qui remplit le cadre */}
                    <motion.img 
                      initial={{ scale: 1.1 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 1.5 }}
                      src={product.images?.[0] || '/placeholder.png'} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      alt={product.title}
                    />
                    
                    {/* Overlay de dégradé pour le texte */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  </motion.div>

                  {/* Badge Promo Flottant */}
                  {product.promo_price && (
                    <div className="absolute top-2 right-[5%] lg:-right-2 bg-red-600 text-white px-3 py-1 rounded-md font-black text-[10px] lg:text-[12px] z-30 rotate-2 shadow-xl">
                      -{Math.round((1 - product.promo_price / product.price) * 100)}%
                    </div>
                  )}
                </div>

                {/* --- BLOC TEXTE : DESCRIPTION COURTE & PRIX --- */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10 order-2 lg:order-1">
                  
                  {/* Label Liquidation */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-[1px] w-5 bg-red-600"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Destockage</span>
                  </div>

                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-xl lg:text-3xl font-black mb-2 uppercase italic leading-tight tracking-tighter"
                  >
                    {product.title}
                  </motion.h1>

                  {/* Description courte (limitée à 2 lignes) */}
                  <p className="text-[11px] lg:text-sm text-white/40 mb-5 max-w-[320px] lg:max-w-[450px] line-clamp-2 font-medium">
                    {product.description || "Dernières pièces disponibles de la collection exclusive SEMER L'AVENIR."}
                  </p>

                  {/* Zone Prix & CTA */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-white/20 font-bold line-through text-[11px] lg:text-[12px]">
                        {product.price.toLocaleString()} F
                      </span>
                      <span className="text-2xl lg:text-4xl font-black text-white leading-none">
                        {(product.promo_price || product.price).toLocaleString()} <small className="text-[10px] text-red-500 uppercase">CFA</small>
                      </span>
                    </div>

                    <Link 
                      to={`/product/${product.id}`} 
                      className="flex items-center gap-2 bg-white text-black h-[42px] lg:h-[50px] px-6 lg:px-8 rounded-full transition-all duration-300 hover:bg-red-600 hover:text-white group active:scale-95 shadow-lg shadow-white/5"
                    >
                      <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">
                        Profiter
                      </span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* STYLES DE L'INTERFACE SWIPER */}
      <style>{`
        .swiper-button-next, .swiper-button-prev { 
          width: 35px !important; 
          height: 35px !important; 
          background: rgba(255,255,255,0.05); 
          border-radius: 50%;
          color: white !important;
          top: 50% !important;
          visibility: hidden;
        }
        @media (min-width: 1024px) {
          .swiper-button-next, .swiper-button-prev { visibility: visible; }
        }
        .swiper-button-next:after, .swiper-button-prev:after { font-size: 12px !important; font-weight: 900; }
        .swiper-pagination-bullet { background: white !important; opacity: 0.2; }
        .swiper-pagination-bullet-active { background: #dc2626 !important; opacity: 1; width: 20px !important; border-radius: 10px !important; }
      `}</style>
    </section>
  )
}