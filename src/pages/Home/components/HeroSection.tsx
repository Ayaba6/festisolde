import { ArrowRight, Zap, Wand2 } from 'lucide-react' // ShoppingBag remplacé par Wand2
import { Link } from 'react-router-dom'
import HeroSlider from './HeroSlider'

export default function HeroSection() {
  return (
    // HAUTEUR FIXE RÉDUITE : 400px sur desktop
    <section className="relative bg-brand-dark text-white overflow-hidden border-b border-white/5 pt-20 lg:pt-0 lg:h-[400px] flex items-center">
      
      {/* Background subtil */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* TEXTE */}
          <div className="lg:col-span-5 text-center lg:text-left order-2 lg:order-1">
            
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 mb-3">
              <Zap size={10} className="text-brand-primary" fill="currentColor" />
              <span className="text-[9px] font-black tracking-widest uppercase text-brand-primary">Flash -70%</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-3 tracking-tighter uppercase italic">
              L'exceptionnel <br />
              <span className="text-brand-primary italic">est ici</span>
            </h1>

            <p className="max-w-xs mx-auto lg:mx-0 text-gray-400 text-xs mb-5 leading-relaxed">
              Collection exclusive. Design premium. <br className="hidden lg:block" /> 
              Le luxe accessible en un clic.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link 
                to="/products" 
                className="px-5 py-2.5 bg-brand-primary text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all"
              >
                DÉCOUVRIR <ArrowRight size={14} />
              </Link>
              
              {/* BOUTON ATELIER (PACKEO) */}
              <Link 
                to="/pack-creator" 
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-white/10 hover:border-brand-primary/50 transition-all text-white/90"
              >
                <Wand2 size={14} className="text-brand-primary" /> MON ATELIER
              </Link>
            </div>
          </div>

          {/* SLIDER */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-brand-primary/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                <HeroSlider />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent pointer-events-none" />
              </div>

              <div className="absolute top-4 right-4 bg-brand-primary text-brand-dark font-black text-[8px] px-2 py-1 rounded shadow-xl uppercase tracking-tighter animate-pulse">
                New Drop
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}