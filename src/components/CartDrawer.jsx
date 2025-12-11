import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  if (!isCartOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '400px',
      backgroundColor: 'white',
      boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease-in-out',
      transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>Shopping Cart</h2>
        <button 
          onClick={() => setIsCartOpen(false)}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          &times;
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>Your cart is empty.</p>
        ) : (
          cart.map((item, index) => (
            <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #f5f5f5', paddingBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', marginRight: '15px', backgroundColor: '#f9f9f9' }}>
                 {item.images && item.images.length > 0 ? (
                   <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#ccc' }}>No Img</div>
                 )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{item.title}</h4>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                  {item.selectedColor && `Color: ${item.selectedColor} `}
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                      style={{ border: 'none', background: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    >-</button>
                    <span style={{ padding: '0 5px', fontSize: '12px' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                      style={{ border: 'none', background: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    >+</button>
                  </div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>ZAR {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
          <span>Total</span>
          <span>ZAR {cartTotal.toFixed(2)}</span>
        </div>
        <button 
          onClick={handleCheckout}
          style={{
          width: '100%',
          padding: '15px',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          cursor: 'pointer'
        }}>
          Checkout
        </button>
      </div>
    </div>
  )
}

export default CartDrawer
