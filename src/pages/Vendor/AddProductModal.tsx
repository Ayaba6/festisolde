import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Camera, Trash2, Star } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Modal, Field } from '../../components/vendor/ui';

const CATEGORIES = ['Vêtements', 'Chaussures', 'Accessoires', 'Beauté', 'Électronique', 'Maison', 'Packeo', 'Grossistes', 'Liquidation', 'Autre'];
const MAX_PHOTOS = 5;

// Une photo = soit une URL déjà en ligne, soit un fichier à envoyer.
type Photo = { preview: string; url?: string; file?: File };

// '{}' / '{"S","M"}' / 'S, M' -> 'S, M'
const cleanOptions = (raw: unknown) =>
  typeof raw === 'string' ? raw.replace(/^\{|\}$/g, '').replace(/"/g, '').split(',').map((s) => s.trim()).filter(Boolean).join(', ') : '';

const initialPhotos = (p: any): Photo[] => {
  if (!p) return [];
  const list: string[] = Array.isArray(p.images) && p.images.length ? p.images : p.image_url ? [p.image_url] : [];
  return list.filter(Boolean).map((url) => ({ preview: url, url }));
};

export default function AddProductModal({ storeId, productToEdit, onClose, onRefresh }: any) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [productType, setProductType] = useState(productToEdit?.product_type || 'simple');
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos(productToEdit));
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    description: productToEdit?.description || '',
    category: productToEdit?.category || '',
    price: productToEdit?.price ?? '',
    sale_price: productToEdit?.sale_price ?? '',
    stock_quantity: productToEdit?.stock_quantity ?? 1,
    colors: cleanOptions(productToEdit?.colors),
    sizes: cleanOptions(productToEdit?.sizes),
  });
  const set = (k: keyof typeof formData) => (e: any) => setFormData((f) => ({ ...f, [k]: e.target.value }));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    if (!files.length) return;
    setProcessing(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true });
          return { file: compressed, preview: URL.createObjectURL(compressed) };
        })
      );
      setPhotos((prev) => [...prev, ...results]);
    } catch (err) {
      console.error(err);
      setError('Une photo n’a pas pu être traitée. Essayez avec une autre image.');
    } finally {
      setProcessing(false);
    }
  };

  const makeCover = (i: number) => setPhotos((prev) => [prev[i], ...prev.filter((_, idx) => idx !== i)]);
  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const price = parseFloat(String(formData.price)) || 0;
    const salePrice = formData.sale_price === '' ? null : parseFloat(String(formData.sale_price));
    if (photos.length === 0) return setError('Ajoutez au moins une photo.');
    if (salePrice !== null && salePrice >= price) return setError('Le prix promo doit être inférieur au prix normal.');

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expirée, reconnectez-vous.');

      // On garde l'ordre choisi (la 1re photo est la photo principale).
      const finalImages: string[] = [];
      for (const photo of photos) {
        if (photo.url) { finalImages.push(photo.url); continue; }
        const ext = photo.file?.type === 'image/png' ? 'png' : photo.file?.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, photo.file!);
        if (uploadError) throw uploadError;
        finalImages.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
      }

      const productData = {
        store_id: storeId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        price,
        sale_price: salePrice,
        stock_quantity: parseInt(String(formData.stock_quantity)) || 0,
        colors: formData.colors.trim() || null,
        sizes: formData.sizes.trim() || null,
        image_url: finalImages[0] || null,
        images: finalImages,
        product_type: productType,
      };

      const { error: dbError } = productToEdit
        ? await supabase.from('products').update(productData).eq('id', productToEdit.id)
        : await supabase.from('products').insert([productData]);
      if (dbError) throw dbError;
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Enregistrement impossible.');
    } finally {
      setProcessing(false);
    }
  };

  const discount = (() => {
    const p = parseFloat(String(formData.price));
    const s = parseFloat(String(formData.sale_price));
    return p > 0 && s > 0 && s < p ? Math.round(((p - s) / p) * 100) : 0;
  })();

  return (
    <Modal
      title={productToEdit ? 'Modifier le produit' : 'Nouveau produit'}
      subtitle={productToEdit ? productToEdit.name : 'Il sera visible immédiatement dans votre boutique.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Type */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1" role="radiogroup" aria-label="Type de produit">
          {[
            ['simple', 'Article simple'],
            ['pack', 'Pack / lot'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={productType === id}
              onClick={() => setProductType(id)}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${productType === id ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Photos */}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">
            Photos <span className="font-normal text-ink-muted">({photos.length}/{MAX_PHOTOS}) · la première est la photo principale</span>
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((ph, i) => (
              <div key={ph.preview} className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
                <img src={ph.preview} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">Principale</span>}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeCover(i)} className="rounded-full bg-white/95 p-1.5 text-ink shadow" aria-label="Mettre en photo principale">
                      <Star size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => removePhoto(i)} className="rounded-full bg-white/95 p-1.5 text-red-600 shadow" aria-label="Retirer la photo">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-stone-200 text-ink-muted transition hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-600">
                {processing ? <Loader2 size={22} className="animate-spin" /> : <Camera size={22} />}
                <span className="text-xs font-semibold">Ajouter</span>
                <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <Field label="Nom du produit">
          <input required maxLength={120} className="shop-input" value={formData.name} onChange={set('name')} placeholder="Ex : Robe en pagne wax, taille unique" />
        </Field>

        <Field label="Description" hint="(facultatif)">
          <textarea className="shop-input h-28 resize-none" value={formData.description} onChange={set('description')} placeholder="Matière, dimensions, état, conseils…" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix normal (F CFA)">
            <input type="number" min={0} inputMode="numeric" required className="shop-input" value={formData.price} onChange={set('price')} placeholder="10 000" />
          </Field>
          <Field label="Prix promo" hint={discount ? `(-${discount} %)` : '(facultatif)'}>
            <input type="number" min={0} inputMode="numeric" className="shop-input" value={formData.sale_price} onChange={set('sale_price')} placeholder="7 500" />
          </Field>
          <Field label="Catégorie">
            <select required className="shop-input" value={formData.category} onChange={set('category')}>
              <option value="">Choisir…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Quantité en stock">
            <input type="number" min={0} inputMode="numeric" required className="shop-input" value={formData.stock_quantity} onChange={set('stock_quantity')} />
          </Field>
          <Field label="Couleurs" hint="(séparées par des virgules)">
            <input className="shop-input" value={formData.colors} onChange={set('colors')} placeholder="Noir, Blanc" />
          </Field>
          <Field label="Tailles" hint="(séparées par des virgules)">
            <input className="shop-input" value={formData.sizes} onChange={set('sizes')} placeholder="M, L, XL" />
          </Field>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}

        <div className="sticky bottom-0 -mx-6 -mb-6 flex gap-3 border-t border-stone-100 bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="shop-btn-ghost">Annuler</button>
          <button disabled={processing} type="submit" className="shop-btn-primary flex-1">
            {processing && <Loader2 className="animate-spin" size={18} />}
            {processing ? 'Enregistrement…' : productToEdit ? 'Enregistrer' : 'Mettre en vente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
