import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  TrendingUp, Users, MousePointer2, Calendar, 
  Loader2, BarChart3, Smartphone, Share2, ArrowLeft 
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
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">
            <ArrowLeft size={14} /> Retour Dashboard
          </Link>
          <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
            Données <span className="text-orange-600">Marketing</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="bg-white px-3 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm" />
          <span className="text-gray-400 font-bold px-1">→</span>
          <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="bg-white px-3 py-2 rounded-xl text-[10px] font-black uppercase outline-none shadow-sm" />
        </div>
      </header>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard label="Visites Période" value={data.periodViews} unit="VUES" subValue="Trafic cumulé" icon={<Users size={20} />} />
        <AnalysisCard label="Conversion" value={`${data.conversionRate}%`} unit="RATIO" subValue="Ventes réelles" icon={<MousePointer2 size={20} />} />
        <AnalysisCard label="Aujourd'hui" value={data.todayViews} unit="LIVE" subValue="En direct" icon={<Calendar size={20} />} isLive={true} />
      </div>

      {/* GRAPHIQUE EN COURBE FLUIDE */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><BarChart3 size={18} /></div>
             <h3 className="text-xs font-black uppercase italic tracking-widest text-gray-900">Courbe d'évolution</h3>
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
            <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black text-gray-300 uppercase italic">
              Pas assez de données pour tracer une courbe
            </div>
          )}
        </div>

        {/* AXE DES DATES */}
        <div className="flex justify-between mt-6 px-2">
          {data.daily.filter((_, i) => i % Math.ceil(data.daily.length / 6) === 0).map((day, i) => (
            <span key={i} className="text-[9px] font-black text-gray-300 uppercase italic tracking-tighter">
              {new Date(day.visit_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
          ))}
        </div>
      </div>

      {/* FOOTER : CANAUX & SUPPORTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Share2 size={24} className="text-orange-600" />
              <div><h3 className="text-lg font-black uppercase italic leading-none">Top Canaux</h3><p className="text-[9px] font-bold text-gray-500 uppercase italic tracking-widest mt-1">Origine des visiteurs</p></div>
            </div>
            <div className="space-y-6">
              <SourceProgress label="WhatsApp / Direct" percent={88} color="bg-orange-600" />
              <SourceProgress label="Instagram / FB" percent={9} color="bg-white" />
              <SourceProgress label="Recherche Web" percent={3} color="bg-gray-600" />
            </div>
          </div>
          <Share2 size={150} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
        </div>

        <div className="lg:col-span-5 bg-orange-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10 text-white">
            <Smartphone size={24} className="mb-4" />
            <h3 className="text-lg font-black uppercase italic leading-none">Usage Mobile</h3>
            <div className="flex items-end justify-between gap-4 mt-16">
              <div className="space-y-1"><p className="text-6xl font-black italic tracking-tighter">97%</p><p className="text-[10px] font-black uppercase opacity-80 tracking-widest leading-none">Mobile</p></div>
              <div className="w-[1px] h-16 bg-white/20"></div>
              <div className="space-y-1 text-right"><p className="text-2xl font-black italic tracking-tighter text-orange-200">3%</p><p className="text-[10px] font-black uppercase opacity-60 tracking-widest leading-none">Desktop</p></div>
            </div>
          </div>
          <TrendingUp size={180} className="absolute -bottom-10 -left-10 text-black/10 -rotate-6 transition-transform group-hover:scale-110 duration-700" />
        </div>
      </div>
    </div>
  );
}

// COMPOSANTS INTERNES
function AnalysisCard({ label, value, unit, subValue, icon, isLive = false }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-100 shadow-xl group hover:border-orange-600 transition-all relative overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl bg-gray-50 text-gray-900 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 ${isLive ? 'ring-4 ring-orange-50 animate-pulse' : ''}`}>{icon}</div>
        <div className="flex-1"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p><p className="text-[9px] font-bold text-orange-600 uppercase italic leading-none truncate">{subValue}</p></div>
      </div>
      <div className="flex items-baseline gap-2"><h4 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase leading-none">{value}</h4><span className="text-[10px] font-black text-gray-300 uppercase italic">{unit}</span></div>
    </div>
  );
}

function SourceProgress({ label, percent, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest leading-none"><span className="text-gray-300 italic">{label}</span><span className="text-white">{percent}%</span></div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5"><div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div></div>
    </div>
  );
}