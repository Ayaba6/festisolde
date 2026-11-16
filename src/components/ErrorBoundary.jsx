import { Component } from 'react';
import { reportError } from '../lib/monitoring';

// Évite la page blanche en cas de plantage : message clair + bouton pour recharger.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    reportError(error, { componentStack: info?.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;

    // Après une mise en ligne, un ancien onglet peut réclamer un fichier qui n'existe plus.
    const isStaleChunk = /dynamically imported module|Loading chunk|Importing a module script failed/i.test(
      String(this.state.error?.message)
    );

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <img src="/logo-festisolde.png" alt="FestiSolde" className="h-10 w-auto" />
        <h1 className="mt-8 text-2xl font-extrabold text-ink">
          {isStaleChunk ? 'Une nouvelle version est disponible' : 'Oups, quelque chose s’est mal passé'}
        </h1>
        <p className="mt-2 max-w-sm text-ink-muted">
          {isStaleChunk
            ? 'Rechargez la page pour profiter de la dernière version du site.'
            : 'L’équipe a été prévenue. Rechargez la page ou revenez à l’accueil.'}
        </p>
        <div className="mt-8 flex gap-3">
          <button onClick={() => window.location.reload()} className="shop-btn-primary">Recharger</button>
          <a href="/" className="shop-btn-ghost">Accueil</a>
        </div>
      </div>
    );
  }
}
