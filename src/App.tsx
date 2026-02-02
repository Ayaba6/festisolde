import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'

// --- PAGES PUBLIQUES ---
import Home from './pages/Home/Home'
import Shop from './pages/Shop/Shop'
import ProductDetail from './pages/Shop/ProductDetail'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Account from './pages/Account/AccountPage' 
import Orders from './pages/Account/Orders'
import Checkout from './pages/Checkout/Checkout'
import OrderSuccess from './pages/Checkout/OrderSuccess'
import VendorLanding from './pages/Vendor/VendorLanding'
import Contact from './pages/Contact'
import PackCreator from './pages/home/components/PackCreator' // <-- IMPORT AJOUTÉ

// --- PAGES VENDEURS ---
import VendorDashboard from './pages/Vendor/Dashboard'
import AddProduct from './pages/Vendor/AddProduct'
import EditProduct from './pages/Vendor/EditProduct' 
import CreateShop from './pages/Vendor/CreateShop'

// --- PAGES ADMINISTRATEUR ---
import AdminGeneral from './pages/Administrator/AdminGeneral'
import AdminProducts from './pages/Administrator/AdminProducts'
import AdminShops from './pages/Administrator/AdminShops'

// --- COMPOSANTS UI ---
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'
import VendorRoute from './components/VendorRoute'
import AuthRedirect from './components/AuthRedirect' 
import ScrollToTop from './components/ScrollToTop'

/**
 * COMPOSANT DE PROTECTION ADMIN
 */
const AdminRoute = ({ user, children }: { user: any, children: React.ReactNode }) => {
  if (!user) return <Navigate to="/auth/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // --- LOGIQUE DU PANIER ---
  const [cart, setCart] = useState<any[]>(() => {
    const savedCart = localStorage.getItem('festi_cart')
    try {
      return savedCart ? JSON.parse(savedCart) : []
    } catch (e) { 
      return [] 
    }
  })

  useEffect(() => {
    localStorage.setItem('festi_cart', JSON.stringify(cart))
  }, [cart])

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const totalAmount = cart.reduce((acc, item) => {
    const currentPrice = item.promo_price || item.price
    return acc + (currentPrice * item.quantity)
  }, 0)

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('festi_cart')
  }

  // --- GESTION UTILISATEUR ---
  const loadUserWithProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      setUser(null)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', authUser.id)
      .maybeSingle() 

    setUser({
      ...authUser,
      role: profile?.role || 'customer',
      full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
    })
    setLoading(false)
  }

  useEffect(() => {
    loadUserWithProfile()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setLoading(false)
      } else {
        loadUserWithProfile()
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <span className="text-4xl font-black text-brand-primary animate-pulse italic tracking-tighter">
          FESTISOLDE
        </span>
        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="w-full h-full bg-brand-primary animate-loading-bar"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans">
      <ScrollToTop />

      <Header 
        user={user} 
        setUser={setUser} 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)} 
      />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        total={totalAmount}
      />
      
      <main className="flex-grow">
        <Routes>
          {/* PAGES PUBLIQUES */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Shop cart={cart} setCart={setCart} />} />
          <Route path="/product/:id" element={<ProductDetail setCart={setCart} />} />
          <Route path="/checkout" element={<Checkout cart={cart} total={totalAmount} clearCart={clearCart} />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/vendre" element={<VendorLanding />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* NOUVELLE ROUTE : ATELIER PACKEO */}
          <Route path="/pack-creator" element={<PackCreator />} />

          {/* AUTHENTIFICATION */}
          <Route path="/auth/login" element={user ? <AuthRedirect user={user} /> : <Login setUser={setUser} />} />
          <Route path="/auth/register" element={user ? <AuthRedirect user={user} /> : <Register setUser={setUser} />} />

          {/* COMPTE CLIENT */}
          <Route path="/account" element={<ProtectedRoute user={user}><Account user={user} setUser={setUser} /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute user={user}><Orders /></ProtectedRoute>} />
          
          {/* ADMIN */}
          <Route path="/admin-general" element={<AdminRoute user={user}><AdminGeneral /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute user={user}><AdminProducts /></AdminRoute>} />
          <Route path="/admin/shops" element={<AdminRoute user={user}><AdminShops /></AdminRoute>} />
          <Route path="/admin" element={<Navigate to="/admin-general" replace />} />
          
          {/* VENDEUR */}
          <Route path="/vendor/dashboard" element={<VendorRoute user={user}><VendorDashboard /></VendorRoute>} />
          <Route path="/vendor/add-product" element={<VendorRoute user={user}><AddProduct /></VendorRoute>} />
          <Route path="/vendor/edit-product/:id" element={<VendorRoute user={user}><EditProduct /></VendorRoute>} />
          <Route path="/vendor/create-shop" element={<ProtectedRoute user={user}><CreateShop /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}