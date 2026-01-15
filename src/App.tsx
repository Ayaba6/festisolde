import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'

// Pages et Composants
import Home from './pages/Home/Home'
import Shop from './pages/Shop/Shop'
import ProductDetail from './pages/Shop/ProductDetail'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Account from './pages/Account/AccountPage'
import VendorDashboard from './pages/Vendor/Dashboard'
import AddProduct from './pages/Vendor/AddProduct'
import CreateShop from './pages/Vendor/CreateShop'
import Checkout from './pages/Checkout/Checkout'
import OrderSuccess from './pages/Checkout/OrderSuccess'

import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import VendorRoute from './components/VendorRoute'
import AuthRedirect from './components/AuthRedirect' 

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // --- LOGIQUE DU PANIER AVEC PERSISTANCE ---
  const [cart, setCart] = useState<any[]>(() => {
    const savedCart = localStorage.getItem('festi_cart')
    try {
      return savedCart ? JSON.parse(savedCart) : []
    } catch (e) { return [] }
  })

  // Sauvegarde automatique (Synchronisée avec le Checkout)
  useEffect(() => {
    localStorage.setItem('festi_cart', JSON.stringify(cart))
  }, [cart])

  // Compteur total d'articles
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  // CALCUL DU TOTAL : Correction pour prendre en compte le prix promo
  const totalAmount = cart.reduce((acc, item) => {
    const currentPrice = item.promo_price || item.price
    return acc + (currentPrice * item.quantity)
  }, 0)

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('festi_cart')
  }

  // --- GESTION DE L'UTILISATEUR ---
  const loadUserWithProfile = async () => {
    setLoading(true)
    const { data } = await supabase.auth.getUser()
    
    if (!data.user) {
      setUser(null)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    setUser({
      ...data.user,
      role: profile?.role || 'customer',
      full_name: profile?.full_name ?? '',
    })
    setLoading(false)
  }

  useEffect(() => {
    loadUserWithProfile()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null)
      else loadUserWithProfile()
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#FF5A5A] animate-pulse text-2xl tracking-tighter">
      FESTISOLDE...
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Header */}
      <Header 
        user={user} 
        setUser={setUser} 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)} 
      />
      
      {/* Panneau coulissant du panier */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        total={totalAmount}
      />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* BOUTIQUE ET DÉTAILS */}
          <Route path="/products" element={<Shop cart={cart} setCart={setCart} />} />
          <Route path="/product/:id" element={<ProductDetail setCart={setCart} />} />

          {/* TUNNEL DE COMMANDE */}
          <Route 
            path="/checkout" 
            element={<Checkout cart={cart} total={totalAmount} clearCart={clearCart} />} 
          />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* AUTHENTIFICATION */}
          <Route path="/auth/login" element={user ? <AuthRedirect user={user} /> : <Login setUser={setUser} />} />
          <Route path="/auth/register" element={user ? <AuthRedirect user={user} /> : <Register setUser={setUser} />} />

          {/* ROUTES PROTÉGÉES */}
          <Route path="/account" element={<ProtectedRoute user={user}><Account user={user} /></ProtectedRoute>} />
          
          {/* ROUTES VENDEURS */}
          <Route path="/vendor/dashboard" element={<VendorRoute user={user}><VendorDashboard /></VendorRoute>} />
          <Route path="/vendor/add-product" element={<VendorRoute user={user}><AddProduct /></VendorRoute>} />
          <Route path="/vendor/create-shop" element={<ProtectedRoute user={user}><CreateShop /></ProtectedRoute>} />

          {/* REDIRECTION PAR DÉFAUT */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}