import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Users, MousePointer2, Calendar, 
  Loader2, BarChart3, Share2, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: today
  });

  const [data, setData] = useState({
    daily: [],
    periodViews: 0,
    todayViews: 0,
    conversionRate: 0,
    maxDailyViews: 1
  });

  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDetailedAnalytics();
  }, [dateRange.from, dateRange.to]);

  async function fetchDetailedAnalytics() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();

    if (store) {
      const { data: stats } = await supabase
        .from('store_analytics')
        .select('views_count, visit_date')
        .eq('store_id', store.id)
        .gte('visit_date', dateRange.from)
        .lte('visit_date', dateRange.to)
        .order('visit_date', { ascending: true });

      const { data: orders } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('store_id', store.id)
        .gte('created_at', `${dateRange.from}T00:00:00`)
        .lte('created_at', `${dateRange.to}T23:59:59`);

      const { data: todayStats } = await supabase
        .from('store_analytics')
        .select('views_count')
        .eq('store_id', store.id)
        .eq('visit_date', today)
        .maybeSingle();

      const { data: topViewed } = await supabase
        .from('products')
        .select('id, name, views, sold_count, image_url')
        .eq('store_id', store.id)
        .order('views', { ascending: false })
        .limit(5);
      setTopProducts(topViewed || []);

      const totalViewsInPeriod = stats?.reduce((acc, curr) => acc + (curr.views_count || 0), 0) || 0;
      const conversion = totalViewsInPeriod > 0 ? ((orders?.length || 0) / totalViewsInPeriod) * 100 : 0;
      const maxViews = stats?.length > 0 ? Math.max(...stats.map(s => s.views_count)) : 0;

      setData({
        daily: stats || [],
        periodViews: totalViewsInPeriod,
        todayViews: todayStats?.views_count || 0,
        conversionRate: conversion.toFixed(1),
        maxDailyViews: maxViews || 1
      });
    }
    setLoading(false);
  }

  // --- LOGIQUE DU GRAPHIQUE EN COURBE (SVG) ---
  const generatePath = () => {
    if (data.daily.length < 2) return "";
    const width = 1000;
    const height = 200;
    const points = data.daily.map((d, i) => {
      const x = (i / (data.daily.length - 1)) * width;
      const y = height - (d.views_count / data.maxDailyViews) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const generateAreaPath = () => {
    const path = generatePath();
    if (!path) return "";
    return `${path} L 1000,200 L 0,200 Z`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-10 pb-20 antialiased bg-white min-h-screen">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-stone-400 hover:text-orange-600 transition-colors">
            <ArrowLeft size={14} /> Retour Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">Statistiques</h1>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="bg-white px-3 py-2 rounded-xl text-xs font-extrabold uppercase outline-none shadow-sm" />
          <span className="text-stone-400 font-bold px-1">→</span>
          <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="bg-white px-3 py-2 rounded-xl text-xs font-extrabold uppercase outline-none shadow-sm" />
        </div>
      </header>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard label="Visites Période" value={data.periodViews} unit="VUES" subValue="Trafic cumulé" icon={<Users size={20} />} />
        <AnalysisCard label="Conversion" value={`${data.conversionRate}%`} unit="RATIO" subValue="Ventes réelles" icon={<MousePointer2 size={20} />} />
        <AnalysisCard label="Aujourd'hui" value={data.todayViews} unit="LIVE" subValue="En direct" icon={<Calendar size={20} />} isLive={true} />
      </div>

      {/* GRAPHIQUE EN COURBE FLUIDE */}
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><BarChart3 size={18} /></div>
             <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink">Courbe d'évolution</h3>
          </div>
          {loading && <Loader2 className="animate-spin text-orange-600" size={16} />}
        </div>

        <div className="relative h-64 w-full group">
          {data.daily.length > 1 ? (
            <svg viewBox="0 0 1000 200" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* L'aire sous la courbe */}
              <path d={generateAreaPath()} fill="url(#gradient)" className="transition-all duration-1000" />
              {/* La ligne de la courbe */}
              <path d={generatePath()} fill="none" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
            </svg>
          ) : (
            <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-stone-100 rounded-3xl text-xs font-extrabold text-stone-300 uppercase">
              Pas assez de données pour tracer une courbe
            </div>
          )}
        </div>

        {/* AXE DES DATES */}
        <div className="flex justify-between mt-6 px-2">
          {data.daily.filter((_, i) => i % Math.ceil(data.daily.length / 6) === 0).map((day, i) => (
            <span key={i} className="text-xs font-extrabold text-stone-300 uppercase tracking-tight">
              {new Date(day.visit_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
          ))}
        </div>
      </div>

      {/* PRODUITS LES PLUS VUS (données réelles) */}
      <div className="bg-ink rounded-3xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Share2 size={22} className="text-orange-500" />
          <div>
            <h3 className="text-lg font-extrabold leading-none">Produits les plus vus</h3>
            <p className="text-sm text-stone-400 mt-1">Depuis leur mise en ligne</p>
          </div>
        </div>
        {topProducts.length > 0 ? (
          <div className="space-y-5">
            {topProducts.map((p) => (
              <SourceProgress
                key={p.id}
                label={`${p.name} · ${p.sold_count || 0} vendu${(p.sold_count || 0) > 1 ? 's' : ''}`}
                value={p.views || 0}
                percent={Math.round(((p.views || 0) / Math.max(1, topProducts[0].views || 0)) * 100)}
                color="bg-orange-500"
              />
            ))}
          </div>
        ) : (
          <p className="text-stone-400">Aucune vue enregistrée pour le moment.</p>
        )}
      </div>
    </div>
  );
}

// COMPOSANTS INTERNES
function AnalysisCard({ label, value, unit, subValue, icon, isLive = false }) {
  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-stone-100 shadow-xl group hover:border-orange-600 transition-all relative overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl bg-stone-50 text-ink group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 ${isLive ? 'ring-4 ring-orange-50 animate-pulse' : ''}`}>{icon}</div>
        <div className="flex-1"><p className="text-xs font-extrabold text-stone-400 uppercase tracking-wide leading-none mb-1">{label}</p><p className="text-xs font-bold text-orange-600 uppercase leading-none truncate">{subValue}</p></div>
      </div>
      <div className="flex items-baseline gap-2"><h4 className="text-4xl font-extrabold text-ink tracking-tight uppercase leading-none">{value}</h4><span className="text-xs font-extrabold text-stone-300 uppercase">{unit}</span></div>
    </div>
  );
}

function SourceProgress({ label, percent, color, value }: { label: string; percent: number; color: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end gap-4 text-sm font-semibold"><span className="truncate text-stone-300">{label}</span><span className="shrink-0 text-white">{value.toLocaleString('fr-FR')} vues</span></div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5"><div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div></div>
    </div>
  );
}