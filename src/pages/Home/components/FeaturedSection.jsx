import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap, Star, ArrowRight } from 'lucide-react';

export default function FeaturedSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "ARRIVAGE ÉLECTRONIQUE",
      subtitle: "SÉLECTION IPHONE & SAMSUNG",
      image: "https://images.unsplash.com/photo-1556656793-062ff9878273?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "MODE & TEXTILE",
      subtitle: "BALLOTS DE FRIPERIE PREMIUM",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[380px]">
        
        {/* --- BANNIÈRE GAUCHE : MINIMALISTE --- */}
        <div className="hidden lg:flex relative overflow-hidden group bg-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=500&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-[2s]"
            alt="Promo"
          />
          <div className="relative z-10 p-8 flex flex-col justify-between h-full border border-gray-100">
            <div>
              <Zap size={18} className="text-gray-900 mb-4" />
              <h3 className="text-gray-900 font-light text-xl leading-tight uppercase tracking-tighter">
                VENTES<br/><span className="font-medium text-red-600">FLASH</span>
              </h3>
            </div>
            <Link to="/products" className="text-gray-900 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all">
              EXPLORER <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* --- SLIDER CENTRAL : ÉPURÉ --- */}
        <div className="lg:col-span-3 relative overflow-hidden group">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1.5s] ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={slide.image} alt="" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-10">
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                  {slide.subtitle}
                </p>
                <h2 className="text-4xl font-light text-white leading-none mb-6 tracking-[ -0.05em]">
                  {slide.title}
                </h2>
                <button className="border border-white/30 backdrop-blur-sm text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all w-fit">
                  DÉCOUVRIR LE STOCK
                </button>
              </div>
            </div>
          ))}
          
          {/* Navigation Slider */}
          <div className="absolute bottom-8 right-8 flex gap-4 z-20">
            <button onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length-1 : currentSlide-1)} className="text-white/50 hover:text-white transition-colors">
              <ChevronLeft size={24} strokeWidth={1} />
            </button>
            <button onClick={() => setCurrentSlide(currentSlide === slides.length-1 ? 0 : currentSlide+1)} className="text-white/50 hover:text-white transition-colors">
              <ChevronRight size={24} strokeWidth={1} />
            </button>
          </div>
        </div>

        {/* --- BANNIÈRE DROITE : ÉPURÉE --- */}
        <div className="hidden lg:flex relative overflow-hidden group bg-gray-900">
          <img 
            src="https://images.unsplash.com/photo-1534452286304-a814d494777e?q=80&w=500&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[2s]"
            alt="Grossiste"
          />
          <div className="relative z-10 p-8 flex flex-col justify-between h-full">
            <div>
              <Star size={18} className="text-white/50 mb-4" />
              <h3 className="text-white font-light text-xl leading-tight uppercase tracking-tighter">
                ESPACE<br/><span className="font-medium">GROSSISTE</span>
              </h3>
            </div>
            <Link to="/auth" className="text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all">
              REJOINDRE <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}