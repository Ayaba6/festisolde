import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Upload, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nom: '',
    prix_original: '',
    prix_solde: '',
    description: '',
    is_featured: false
  })

  // Nettoyage de l'URL de preview pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Optionnel: Vérification de la taille (max 2Mo)
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("L'image est trop lourde (max 2Mo)")
      }
      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom || !formData.prix_solde) {
      return toast.error("Veuillez remplir les champs obligatoires")
    }

    setLoading(true)

    try {
      let imageUrls: string[] = []

      // 1. Upload de l'image avec nom de fichier propre
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(cleanFileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw new Error(`Erreur Image: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(cleanFileName)
        
        imageUrls = [publicUrl]
      }

      // 2. Insertion avec noms de colonnes corrigés (title, price, promo_price)
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          title: formData.nom.trim(),
          description: formData.description.trim() || '',
          price: parseFloat(formData.prix_original) || 0,
          promo_price: parseFloat(formData.prix_solde),
          is_featured: formData.is_featured,
          images: imageUrls,
        }])

      if (insertError) throw insertError

      toast.success("Produit ajouté avec succès !")
      
      // Reset complet
      setFormData({ nom: '', prix_original: '', prix_solde: '', description: '', is_featured: false })
      setImageFile(null)
      setPreview(null)
      
      onSuccess() 
      onClose()

    } catch (error: any) {
      console.error("Erreur détaillée:", error)
      toast.error(error.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-black text-gray-900 italic">Nouveau <span className="text-brand-primary">Produit</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Image du produit</label>
              <div 
                className="relative aspect-square rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:border-brand-primary transition-colors cursor-pointer"
                onClick={() => !loading && document.getElementById('file-upload')?.click()}
              >
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <Upload className="text-gray-300 mb-2" size={40} />
                    <span className="text-xs font-bold text-gray-400">Cliquez pour uploader</span>
                  </>
                )}
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loading} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nom du produit *</label>
                <input 
                  required
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none disabled:opacity-50"
                  placeholder="Ex: Robe Festi"
                  value={formData.nom}
                  onChange={e => setFormData({...formData, nom: e.target.value})}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Prix Original</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none disabled:opacity-50"
                    placeholder="25000"
                    value={formData.prix_original}
                    onChange={e => setFormData({...formData, prix_original: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Prix Soldé *</label>
                  <input 
                    required
                    type="number"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-brand-primary outline-none disabled:opacity-50"
                    placeholder="15000"
                    value={formData.prix_solde}
                    onChange={e => setFormData({...formData, prix_solde: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <input 
                  type="checkbox" 
                  id="featured"
                  className="w-5 h-5 accent-amber-500"
                  checked={formData.is_featured}
                  onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                  disabled={loading}
                />
                <label htmlFor="featured" className="text-sm font-black text-amber-700 uppercase italic cursor-pointer">Mettre en vedette</label>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            {loading ? "Chargement..." : "Enregistrer le produit"}
          </button>
        </form>
      </div>
    </div>
  )
}