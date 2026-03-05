import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  TrendingUp, Users, MousePointer2, Calendar, 
  ArrowUpRight, ArrowDownRight, Loader2, BarChart3,
  Smartphone, Share2
} from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    daily: [],
    totalViews: 0,
    conversionRate: 0,
    bestDay: { date: '', views: 0 }
  });

  useEffect(() => {
    fetchDetailedAnalytics();
  }, []);

  async function fetchDetailedAnalytics() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single();

    if (store) {
      // 1. Récupérer les données des 30 derniers jours
      const { data: stats } = await supabase
        .from('store_analytics')
        .select('views_count, visit_date')
        .eq('store_id', store.id)
        .order('visit_date', { ascending: true });

      // 2. Récupérer les commandes pour le taux de conversion
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('store_id', store.id);

      if (stats) {
        const totalViews = stats.reduce((acc, curr) => acc + curr.views_count, 0);
        const maxViews = Math.max(...stats.map(s => s.views_count), 0);
        const topDay = stats.find(s => s.views_count === maxViews);
        
        const conversion = totalViews > 0 ? ((orders?.length || 0) / totalViews) * 100 : 0;

        setData({
          daily: stats,
          totalViews,
          conversionRate: conversion.toFixed(2),
          bestDay: { 
            date: topDay ? new Date(topDay.visit_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' }) : 'N/A', 
            views: maxViews 
          }
        });
      }
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-600" size={32} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 antialiased">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
            Insights <span className="text-orange-600">Marketing</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Analyse de performance en temps réel</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button className="px-4 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900">30 Jours</button>
          <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900">90 Jours</button>
        </div>
      </header>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisCard 
          label="Visites Totales" 
          value={data.totalViews.toLocaleString()} 
          subValue="+18% ce mois" 
          icon={<Users size={20} />} 
          color="bg-orange-600"
        />
        <AnalysisCard 
          label="Taux de Conversion" 
          value={`${data.conversionRate}%`} 
          subValue="Visites vs Commandes" 
          icon={<MousePointer2 size={20} />} 
          color="bg-black"
        />
        <AnalysisCard 
          label="Pic d'Audience" 
          value={data.bestDay.views} 
          subValue={data.bestDay.date} 
          icon={<Calendar size={20} />} 
          color="bg-blue-600"
        />
      </div>

      {/* CHART PLACEHOLDER (Visualisation simplifiée) */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase italic tracking-widest">Évolution du Trafic</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="text-[10px] font-bold text-gray-400">VUES</span>
            </div>
          </div>
        </div>
        
        {/* Simple Bar Visualization */}
        <div className="h-64 flex items-end gap-2 md:gap-4 overflow-x-auto pb-4">
          {data.daily.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-[20px]">
              <div 
                className="w-full bg-orange-100 group-hover:bg-orange-600 transition-all rounded-t-lg relative group"
                style={{ height: `${(day.views_count / data.bestDay.views) * 100}%`, minHeight: '4px' }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.views_count}
                </div>
              </div>
              <span className="text-[8px] font-bold text-gray-300 uppercase">
                {new Date(day.visit_date).getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LOWER SECTION: SOURCES & DEVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
          <Share2 size={24} className="text-orange-600 mb-4" />
          <h3 className="text-lg font-black uppercase italic">Top Canaux</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">D'où viennent vos clients ?</p>
          
          <div className="space-y-4">
            <SourceProgress label="Lien Direct / WhatsApp" percent={75} />
            <SourceProgress label="Instagram / Facebook" percent={15} />
            <SourceProgress label="Recherche Festi-Solde" percent={10} />
          </div>
        </div>

        <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white">
          <Smartphone size={24} className="text-white mb-4" />
          <h3 className="text-lg font-black uppercase italic">Appareils</h3>
          <p className="text-[10px] font-bold text-orange-200 uppercase tracking-[0.2em] mb-6">Type de support utilisé</p>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-3xl font-black">92%</p>
              <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Mobile</p>
            </div>
            <div className="h-12 w-[2px] bg-white/20"></div>
            <div className="text-center">
              <p className="text-3xl font-black">8%</p>
              <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Ordinateur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisCard({ label, value, subValue, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-xl group hover:border-black transition-all">
      <div className={`${color} text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">{value}</h4>
      <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 flex items-center gap-1">
        {subValue}
      </p>
    </div>
  );
}

function SourceProgress({ label, percent }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-gray-400">{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-orange-600 rounded-full" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}