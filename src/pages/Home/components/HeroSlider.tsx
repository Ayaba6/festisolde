import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import shoes1 from "../../../assets/slider/shoes_1.jpg";
import shoes2 from "../../../assets/slider/shoes_2.jpg";
import shoes3 from "../../../assets/slider/shoes_3.jpg";
import shoes4 from "../../../assets/slider/shoes_4.jpg";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const SLIDES = [
  { image: shoes1, title: "Performance Air", tag: "Nouvelle Collection" },
  { image: shoes2, title: "Style Urbain", tag: "Édition Limitée" },
  { image: shoes3, title: "Confort Absolu", tag: "Premium Leather" },
  { image: shoes4, title: "Design Futuriste", tag: "Exclusivité Web" }
];

export default function HeroSlider() {
  return (
    // AJUSTEMENT : On passe en h-full pour obéir au parent (HeroSection)
    <div className="relative group w-full h-full">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        speed={1200}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{
          nextEl: '.swiper-next',
          prevEl: '.swiper-prev',
        }}
        loop={true}
        // HARMONISATION : On réduit l'arrondi pour qu'il s'emboîte dans le parent [20px]
        className="w-full h-full rounded-[18px] overflow-hidden shadow-2xl"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src={slide.image} 
                // object-cover est crucial ici pour le format panoramique
                className="w-full h-full object-cover object-center transform scale-100" 
                alt={slide.title} 
              />
              
              {/* Overlay plus discret pour format réduit */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />
              
              {/* Texte réajusté pour la petite hauteur */}
              <div className="absolute bottom-6 left-8 right-8 text-left">
                 <span className="inline-block text-brand-primary font-bold text-[8px] uppercase tracking-[0.3em] mb-1">
                   {slide.tag}
                 </span>
                 <h3 className="text-xl lg:text-2xl font-black text-white leading-tight uppercase italic">
                   {slide.title}
                 </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Boutons de navigation plus petits et élégants */}
        <button className="swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-brand-dark/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary text-white">
          <ChevronLeft size={18} />
        </button>
        <button className="swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-brand-dark/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary text-white">
          <ChevronRight size={18} />
        </button>
      </Swiper>
      
      {/* Style pour les bullets de pagination (à mettre dans ton index.css idéalement) */}
      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background: #ff5a5a !important; /* Ta couleur brand-primary */
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}