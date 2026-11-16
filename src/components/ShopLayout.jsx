import Header from '../pages/Home/components/Header';
import Footer from '../pages/Home/components/Footer';

// En-tête + pied de page de la vitrine, pour les pages qui n'en ont pas.
export default function ShopLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
