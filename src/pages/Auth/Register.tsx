import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, MailCheck } from 'lucide-react';
import AuthLayout from './AuthLayout';

// Aperçu de l'adresse de la boutique (le serveur fait la version définitive).
const previewSlug = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // La boutique est créée côté serveur (trigger handle_new_user) à partir de store_name,
      // ce qui fonctionne même si la confirmation par e-mail est activée.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { store_name: storeName.trim() } },
      });
      if (authError) throw authError;
      if (authData.user) setSentTo(email.trim());
    } catch (err: any) {
      setError(
        err?.message?.includes('already registered')
          ? 'Un compte existe déjà avec cette adresse. Connectez-vous.'
          : err?.message || 'Inscription impossible pour le moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthLayout title="Vérifiez vos e-mails" subtitle={`Nous avons envoyé un lien de confirmation à ${sentTo}.`}>
        <div className="rounded-2xl bg-green-50 p-5 text-green-800">
          <MailCheck size={28} />
          <p className="mt-3 text-[15px]">
            Cliquez sur le lien reçu pour activer votre boutique <strong>{storeName}</strong>, puis connectez-vous.
            Pensez à regarder dans les spams.
          </p>
        </div>
        <Link to="/auth" className="shop-btn-dark mt-6 w-full py-3.5">Aller à la connexion</Link>
      </AuthLayout>
    );
  }

  const slug = previewSlug(storeName);

  return (
    <AuthLayout
      title="Ouvrez votre boutique"
      subtitle="Gratuit, sans engagement. Prête en 2 minutes."
      footer={
        <>
          Déjà vendeur ?{' '}
          <Link to="/auth" className="font-bold text-ink underline decoration-orange-400 underline-offset-4 hover:text-orange-600">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Nom de la boutique</span>
          <input
            type="text"
            placeholder="Ex : Belle en Pagne"
            className="shop-input"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
          />
          {slug && (
            <span className="mt-1.5 block truncate text-sm text-ink-muted">
              Votre adresse : <span className="font-semibold text-ink">festisolde.com/{slug}</span>
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Adresse e-mail</span>
          <input type="email" autoComplete="email" placeholder="vous@exemple.com" className="shop-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Mot de passe</span>
          <input type="password" autoComplete="new-password" className="shop-input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <span className="mt-1.5 block text-sm text-ink-muted">8 caractères minimum.</span>
        </label>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}

        <button type="submit" disabled={loading} className="shop-btn-primary w-full py-3.5 text-[15px]">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <>Créer ma boutique <ArrowRight size={18} /></>}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-muted">
          En créant un compte, vous acceptez nos conditions d’utilisation et notre{' '}
          <Link to="/privacy" className="underline">politique de confidentialité</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}
