import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      if (data?.user) {
        const { data: isAdmin } = await supabase.rpc('is_admin');
        navigate(isAdmin ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(
        err?.message?.includes('Email not confirmed')
          ? 'Confirmez d’abord votre adresse e-mail (lien reçu par mail).'
          : 'E-mail ou mot de passe incorrect.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bon retour 👋"
      subtitle="Connectez-vous pour gérer votre boutique."
      footer={
        <>
          Pas encore vendeur ?{' '}
          <Link to="/register" className="font-bold text-ink underline decoration-orange-400 underline-offset-4 hover:text-orange-600">
            Ouvrir ma boutique
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Adresse e-mail</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            className="shop-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Mot de passe</span>
          <span className="relative block">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="shop-input pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-muted hover:text-ink"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{error}</p>
        )}

        <button type="submit" disabled={loading} className="shop-btn-dark w-full py-3.5 text-[15px]">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <>Se connecter <ArrowRight size={18} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
