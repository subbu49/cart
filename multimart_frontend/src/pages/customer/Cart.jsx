import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { fetchCart, removeFromCart, updateCartItem, selectCart } from '../../features/cart/cartSlice'

export default function Cart() {
  const dispatch = useDispatch()
  const cart = useSelector(selectCart)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  if (!cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <svg className="w-12 h-12 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="mt-4 text-slate-300 text-lg">Loading your cart...</p>
        </div>
      </div>
    )
  }

  const items = cart.items ?? []

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-3">Your cart is empty</h1>
          <p className="text-slate-400 mb-8">Looks like you haven't added anything yet. Browse our products and start shopping!</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-slate-300">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition duration-300">
                <div className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product?.image ? `/media/${item.product.image}` : 'https://placehold.co/120x120/1a2744/c9a84c?text=Product'}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{item.product?.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{item.product?.shop_name}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">₹{Number(item.price).toFixed(2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-2">
                    <button
                      onClick={() => item.quantity > 1 && dispatch(updateCartItem({ id: item.id, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                      className="p-2 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition duration-200"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-slate-700" />
                    </button>
                    <span className="w-8 text-center font-semibold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateCartItem({ id: item.id, quantity: item.quantity + 1 }))}
                      className="p-2 hover:bg-slate-200 rounded transition duration-200"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="flex flex-col items-end justify-center gap-3">
                    <div>
                      <p className="text-xs text-slate-500 text-right mb-1">Subtotal</p>
                      <p className="text-xl font-bold text-slate-900">₹{Number(item.subtotal).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition duration-200"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <h2 className="text-2xl font-bold text-white">Order Summary</h2>
              </div>

              <div className="p-6">
                {/* Summary Details */}
                <div className="space-y-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Items ({cart.item_count})</span>
                    <span className="font-semibold text-slate-900">₹{Number(cart.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-semibold text-slate-900">₹0.00</span>
                  </div>
                </div>

                {/* Total */}
                <div className="py-4 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">₹{Number(cart.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition duration-200"
                >
                  Continue Shopping
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center mb-3 font-semibold">Secure Checkout</p>
                  <div className="flex justify-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <span className="text-2xl">💳</span>
                    <span className="text-2xl">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-2xl mb-2">🚚</div>
            <p className="text-sm font-semibold text-slate-900">Free Shipping</p>
            <p className="text-xs text-slate-600 mt-1">On all orders</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-2xl mb-2">↩️</div>
            <p className="text-sm font-semibold text-slate-900">Easy Returns</p>
            <p className="text-xs text-slate-600 mt-1">30-day return policy</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-2xl mb-2">🤝</div>
            <p className="text-sm font-semibold text-slate-900">24/7 Support</p>
            <p className="text-xs text-slate-600 mt-1">Dedicated customer care</p>
          </div>
        </div>
      </div>
    </div>
  )
}
