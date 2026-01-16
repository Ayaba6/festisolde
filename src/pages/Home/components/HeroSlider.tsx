import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Imports des images depuis assets/slider
import shoes1 from "../../../assets/slider/shoes_1.jpg";
import shoes2 from "../../../assets/slider/shoes_2.jpg";
import shoes3 from "../../../assets/slider/shoes_3.jpg";
import shoes4 from "../../../assets/slider/shoes_4.jpg";

// Styles Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const SLIDES = [
  {
    image: shoes1,
    title: "Performance Air",
    tag: "Nouvelle Collection"
  },
  {
    image: shoes2,
    title: "Style Urbain",
    tag: "Édition Limitée"
  },
  {
    image: shoes3,
    title: "Confort Absolu",
    tag: "Premium Leather"
  },
  {
    image: shoes4,
    title: "Design Futuriste",
    tag: "Exclusivité Web"
  }
];

export default function HeroSlider() {
  return (
    <div className="relative group w-full h-[450px] lg:h-[600px]">
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
        className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src={slide.image} 
                className="w-full h-full object-cover transform scale-100 animate-slow-zoom" 
                alt={slide.title} 
              />
              
              {/* Overlay progressif plus sombre en bas pour la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-12 left-12 right-12 text-left">
                 <span className="inline-block text-brand-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-2">
                   {slide.tag}
                 </span>
                 <h3 className="text-3xl font-bold text-white leading-tight">
                   {slide.title}
                 </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Boutons de navigation */}
        <button className="swiper-prev absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary text-white">
          <ChevronLeft size={24} />
        </button>
        <button className="swiper-next absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary text-white">
          <ChevronRight size={24} />
        </button>
      </Swiper>
    </div>
  );
}