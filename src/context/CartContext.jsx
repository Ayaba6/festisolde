import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
const STORAGE_KEY = 'festi_cart';

// Prix affiché au client : prix promo s'il existe, sinon prix normal.
// (Le prix réellement facturé est recalculé côté serveur par place_order.)
export const unitPrice = (product) => {
  const sale = Number(product?.sale_price);
  return sale > 0 ? sale : Number(product?.price) || 0;
};

// Une ligne de panier = un produit + une taille + une couleur.
const lineKey = (p) => `${p.id}|${p.selectedSize || ''}|${p.selectedColor || ''}`;

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.map((i) => ({ ...i, cartKey: i.cartKey || lineKey(i) })) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  // Lecture synchrone : évite d'écraser le panier sauvegardé au premier rendu.
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* stockage indisponible (navigation privée) : le panier reste en mémoire */
    }
  }, [cart]);

  /**
   * Ajoute (ou retire si quantity < 0) un article.
   * Un panier = une seule boutique : on propose de le vider sinon.
   * Retourne false si l'ajout a été annulé.
   */
  const addToCart = (product, quantity = 1) => {
    const key = product.cartKey || lineKey(product);
    const otherStore = cart.length > 0 && cart[0].store_id && product.store_id && cart[0].store_id !== product.store_id;

    if (otherStore) {
      const ok = window.confirm(
        "Votre panier contient des articles d'une autre boutique.\nUne commande ne peut concerner qu'une seule boutique : vider le panier et ajouter cet article ?"
      );
      if (!ok) return false;
      setCart([{ ...product, cartKey: key, quantity: Math.max(1, quantity) }]);
      return true;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === key);
      if (existing) {
        return prev
          .map((item) => (item.cartKey === key ? { ...item, quantity: item.quantity + quantity } : item))
          .filter((item) => item.quantity > 0);
      }
      return quantity > 0 ? [...prev, { ...product, cartKey: key, quantity }] : prev;
    });
    return true;
  };

  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => cart.reduce((total, item) => total + unitPrice(item) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
