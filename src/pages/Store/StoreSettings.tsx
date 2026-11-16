import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { Camera, Loader2, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { PageHeader, Card, Field, PageLoader } from '../../components/vendor/ui';

const toSlug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editSlug, setEditSlug] = useState(false);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('stores').select('*').eq('owner_id', user.id).maybeSingle();
        if (data) {
          setStore(data);
          setForm({ name: data.name || '', description: data.description || '' });
          setSlug(data.slug || '');
        }
      }
      setLoading(false);
    })();
  }, []);

  const flash = (type: 'ok' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_url') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !store) return;
    setUploading(field);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: field === 'banner_url' ? 0.9 : 0.4,
        maxWidthOrHeight: field === 'banner_url' ? 1800 : 600,
        useWebWorker: true,
      });
      const ext = compressed.type === 'image/png' ? 'png' : compressed.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${store.owner_id}/${field}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('store-assets').upload(path, compressed);
      if (upErr) throw upErr;
      const url = supabase.storage.from('store-assets').getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from('stores').update({ [field]: url }).eq('id', store.id);
      if (error) throw error;
      setStore((s: any) => ({ ...s, [field]: url }));
      flash('ok', field === 'logo_url' ? 'Logo mis à jour.' : 'Bannière mise à jour.');
    } catch (err: any) {
      flash('error', err?.message || 'Envoi de l’image impossible.');
    } finally {
      setUploading(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    const update: Record<string, string> = { name: form.name.trim(), description: form.description.trim() };
    const newSlug = toSlug(slug);
    if (editSlug && newSlug && newSlug !== store.slug) update.slug = newSlug;
    const { data, error } = await supabase.from('stores').update(update).eq('id', store.id).select().maybeSingle();
    setSaving(false);
    if (error) return flash('error', error.message.includes('duplicate') ? 'Cette adresse est déjà prise.' : error.message);
    if (data) { setStore(data); setSlug(data.slug); }
    setEditSlug(false);
    flash('ok', 'Modifications enregistrées.');
  };

  const storeUrl = store ? `${window.location.origin}/${store.slug}` : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* indisponible */ }
  };

  if (loading) return <PageLoader />;
  if (!store) return <p className="text-ink-muted">Aucune boutique liée à ce compte.</p>;

  return (
    <div>
      <PageHeader
        title="Ma vitrine"
        subtitle="Ce que voient vos clients en ouvrant votre boutique."
        actions={<Link to={`/${store.slug}`} target="_blank" className="shop-btn-ghost"><ExternalLink size={18} /> Voir ma boutique</Link>}
      />

      {notice && (
        <p className={`mb-6 rounded-2xl px-4 py-3 text-sm font-semibold ${notice.type === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`} role="status">
          {notice.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Aperçu visuel */}
        <Card className="overflow-hidden">
          <div className="relative h-44 bg-gradient-to-br from-orange-500 via-orange-600 to-ink md:h-56">
            {store.banner_url && <img src={store.banner_url} alt="" className="h-full w-full object-cover" />}
            <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-ink shadow hover:bg-white">
              {uploading === 'banner_url' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              {store.banner_url ? 'Changer la bannière' : 'Ajouter une bannière'}
              <input type="file" accept="image/*" hidden disabled={!!uploading} onChange={(e) => uploadImage(e, 'banner_url')} />
            </label>
          </div>
          <div className="flex items-end gap-4 px-6 pb-6">
            <label className="relative -mt-10 h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-3xl border-4 border-white bg-ink shadow-lift" aria-label="Changer le logo">
              {store.logo_url
                ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" />
                : <span className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-white">{store.name?.charAt(0)?.toUpperCase()}</span>}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white opacity-0 transition hover:opacity-100">
                {uploading === 'logo_url' ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
              </span>
              <input type="file" accept="image/*" hidden disabled={!!uploading} onChange={(e) => uploadImage(e, 'logo_url')} />
            </label>
            <div className="min-w-0 pb-1">
              <p className="truncate text-xl font-extrabold text-ink">{form.name || store.name}</p>
              <p className="text-sm text-ink-muted">Touchez le logo pour le changer</p>
            </div>
          </div>
          <div className="border-t border-stone-100 p-6">
            <p className="text-sm font-semibold text-ink-muted">Adresse de votre boutique</p>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-stone-50 p-2 pl-4">
              <span className="min-w-0 flex-1 truncate font-semibold text-ink">festisolde.com/<span className="text-orange-600">{store.slug}</span></span>
              <button type="button" onClick={copy} className="shop-btn-dark px-4 py-2">
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>
        </Card>

        {/* Formulaire */}
        <Card as="form" onSubmit={save} className="space-y-5 p-6">
          <Field label="Nom de la boutique">
            <input required minLength={2} maxLength={80} className="shop-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Présentation" hint="(visible sur votre boutique)">
            <textarea rows={5} maxLength={600} className="shop-input resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ce que vous vendez, vos zones et délais de livraison…" />
          </Field>

          {!editSlug ? (
            <button type="button" onClick={() => setEditSlug(true)} className="text-sm font-semibold text-ink-muted underline underline-offset-4 hover:text-ink">
              Modifier l’adresse de la boutique
            </button>
          ) : (
            <div className="space-y-2 rounded-2xl bg-amber-50 p-4">
              <p className="flex items-start gap-2 text-sm font-semibold text-amber-900">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Les liens déjà partagés (WhatsApp, Facebook…) ne fonctionneront plus.
              </p>
              <div className="flex items-center gap-1 rounded-xl border border-amber-200 bg-white pl-3">
                <span className="shrink-0 text-sm text-ink-muted">festisolde.com/</span>
                <input className="w-full rounded-xl py-2.5 pr-3 text-[15px] font-semibold outline-none" value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Nouvelle adresse" />
              </div>
              {toSlug(slug) !== slug && slug && <p className="text-sm text-ink-muted">Sera enregistrée : <strong>{toSlug(slug)}</strong></p>}
            </div>
          )}

          <button type="submit" disabled={saving || !!uploading} className="shop-btn-primary w-full py-3.5">
            {saving && <Loader2 size={18} className="animate-spin" />} Enregistrer
          </button>
        </Card>
      </div>
    </div>
  );
}
