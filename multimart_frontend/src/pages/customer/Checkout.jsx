import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AlertCircle, MapPin, CreditCard, ShoppingBag, ChevronRight } from 'lucide-react'
import { addressAPI, orderAPI, cartAPI } from '../../api/endpoints'
import { fetchCart } from '../../features/cart/cartSlice'
import { toast } from 'react-toastify'

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [payMethod, setPayMethod] = useState('cod')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false)

  useEffect(() => {
    Promise.all([
      cartAPI.get(),
      addressAPI.list(),
    ]).then(([cartRes, addrRes]) => {
      setCart(cartRes.data)
      const addrs = addrRes.data.results ?? addrRes.data
      setAddresses(addrs)
      const def = addrs.find((a) => a.is_default)
      if (def) setAddressId(def.id)
      setLoading(false)
    })
  }, [])

  const handleOrder = async () => {
    if (!addressId) return toast.error('Please select a delivery address')
    setPlacing(true)
    try {
      await orderAPI.create({ address: addressId, payment_method: payMethod })
      dispatch(fetchCart())
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (e) {
      const err = e.response?.data
      if (err?.errors) err.errors.forEach((msg) => toast.error(msg))
      else toast.error(err?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const selectedAddress = addresses.find((a) => a.id === addressId)
  const paymentMethods = {
    cod: { label: 'Cash on Delivery', icon: '💵' },
    upi: { label: 'UPI', icon: '📱' },
    card: { label: 'Credit / Debit Card', icon: '💳' },
    wallet: { label: 'Wallet', icon: '👛' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <svg className="w-12 h-12 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="mt-4 text-slate-300 text-lg">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
          <p className="text-slate-400 mb-8">Add some items to get started with your order</p>
          <button
            onClick={() => navigate('/products')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95"
          >
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
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-slate-300">Review your order and complete payment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Delivery Address</h2>
              </div>

              <div className="p-6">
                {addresses.length === 0 ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-semibold">No addresses saved</p>
                      <p className="text-amber-700 text-sm mt-1">You need to add a delivery address to proceed.</p>
                      <button
                        onClick={() => navigate('/profile')}
                        className="mt-3 inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition duration-200"
                      >
                        Add Address
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Select Delivery Address</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      >
                        <span className="text-slate-700">
                          {selectedAddress
                            ? `${selectedAddress.full_name} — ${selectedAddress.address}, ${selectedAddress.city}`
                            : 'Select an address'}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showAddressDropdown ? 'rotate-90' : ''}`} />
                      </button>

                      {showAddressDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-10">
                          {addresses.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => {
                                setAddressId(a.id)
                                setShowAddressDropdown(false)
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition duration-150 border-b border-slate-100 last:border-b-0 ${
                                addressId === a.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                              }`}
                            >
                              <p className="font-semibold text-slate-900">{a.full_name}</p>
                              <p className="text-sm text-slate-600 mt-1">
                                {a.address}, {a.city}, {a.state} {a.zip_code}
                              </p>
                              {a.is_default && <span className="text-xs text-blue-600 font-semibold mt-2 inline-block">Default</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Choose Payment Method</label>
                <div className="relative">
                  <button
                    onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  >
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="text-lg">{paymentMethods[payMethod]?.icon}</span>
                      {paymentMethods[payMethod]?.label}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showPaymentDropdown ? 'rotate-90' : ''}`} />
                  </button>

                  {showPaymentDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-10">
                      {Object.entries(paymentMethods).map(([key, { label, icon }]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setPayMethod(key)
                            setShowPaymentDropdown(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition duration-150 border-b border-slate-100 last:border-b-0 flex items-center gap-2 ${
                            payMethod === key ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                          }`}
                        >
                          <span className="text-lg">{icon}</span>
                          <span className="font-semibold text-slate-900">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
              </div>

              <div className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 last:border-b-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.product?.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-blue-600">₹{Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900 font-semibold">₹{Number(cart.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-900 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">₹{Number(cart.total).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={placing || !addressId}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Your order will be confirmed once payment is completed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
