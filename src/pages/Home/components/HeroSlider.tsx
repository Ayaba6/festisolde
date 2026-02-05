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
        className="w-full h-full rounded-[18px] overflow-hidden shadow-2xl"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src={slide.image} 
                // "eager" pour la première image afin d'éviter le flash blanc au chargement
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover object-center transform scale-100" 
                alt={slide.title} 
              />
              
              {/* Overlay dégradé */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Contenu textuel */}
              <div className="absolute bottom-6 left-8 right-8 text-left">
                 <span className="inline-block text-[#ff5a5a] font-bold text-[8px] uppercase tracking-[0.3em] mb-1">
                   {slide.tag}
                 </span>
                 <h3 className="text-xl lg:text-2xl font-black text-white leading-tight uppercase italic">
                   {slide.title}
                 </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Boutons de navigation personnalisés */}
        <button className="swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ff5a5a] text-white">
          <ChevronLeft size={18} />
        </button>
        <button className="swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ff5a5a] text-white">
          <ChevronRight size={18} />
        </button>
      </Swiper>
      
      {/* Correction de l'erreur console : Balise style standard sans attributs non-supportés */}
      <style>
        {`
          .swiper-pagination-bullet-active {
            background: #ff5a5a !important;
            width: 20px !important;
            border-radius: 5px !important;
          }
          .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.8);
            opacity: 1;
          }
          /* Optionnel : Ajustement de la position de la pagination */
          .swiper-pagination-lock {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
}