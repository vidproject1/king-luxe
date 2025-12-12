import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

function ProductPage() {
  const { id } = useParams()
  const { addToCart, setIsCartOpen, cartCount } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [brandName, setBrandName] = useState('LUXURY BRAND')

  useEffect(() => {
    fetchProduct()
    fetchBrandName()
  }, [id])

  const fetchBrandName = async () => {
    try {
      // 1. Get the home page
      const { data: homePage } = await supabase
        .from('pages')
        .select('id')
        .eq('is_home', true)
        .single()

      if (!homePage) return

      // 2. Get the navigation component for the home page
      const { data: navComponent } = await supabase
        .from('page_components')
        .select('config')
        .eq('page_id', homePage.id)
        .eq('type', 'navigation')
        .limit(1)
        .single()

      if (navComponent && navComponent.config && navComponent.config.logoText) {
        setBrandName(navComponent.config.logoText)
      }
    } catch (error) {
      console.error('Error fetching brand name:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setProduct(data)
      if (data.images && data.images.length > 0) setSelectedImage(0)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>
  if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Product not found</div>

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color')
      return
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size')
      return
    }
    
    addToCart(product, 1, selectedColor, selectedSize)
  }

  const themeColor = product.theme_color || '#000000'

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
       {/* Simple Header */}
       <div style={{ padding: '20px 40px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: '24px', fontFamily: "'Playfair Display', serif", color: '#000' }}>
          {brandName}
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>Back to Shop</Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#000' }}
          >
            Cart ({cartCount})
          </button>
        </div>
      </div>

       <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
         {/* Image Gallery */}
         <div style={{ flex: '1 1 500px' }}>
           <div style={{ height: '600px', backgroundColor: '#f9f9f9', marginBottom: '20px', overflow: 'hidden' }}>
             {product.images && product.images.length > 0 ? (
               <img 
                 src={product.images[selectedImage]} 
                 alt={product.title} 
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
               />
             ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Image</div>
             )}
           </div>
           <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
             {product.images && product.images.map((img, index) => (
               <div 
                 key={index}
                 onClick={() => setSelectedImage(index)}
                 style={{ 
                   width: '100px', 
                   height: '100px', 
                   border: selectedImage === index ? `1px solid ${themeColor}` : '1px solid transparent',
                   cursor: 'pointer',
                   opacity: selectedImage === index ? 1 : 0.6
                 }}
               >
                 <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
             ))}
           </div>
         </div>

         {/* Product Details */}
         <div style={{ flex: '1 1 400px' }}>
           <h1 style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", marginBottom: '20px', color: themeColor }}>{product.title}</h1>
           <p style={{ fontSize: '20px', marginBottom: '30px', fontWeight: '300' }}>R {product.price.toFixed(2)}</p>
           
           <div style={{ marginBottom: '40px', lineHeight: '1.8', color: '#666' }}>
             {product.description}
           </div>

           {product.colors && product.colors.length > 0 && (
             <div style={{ marginBottom: '30px' }}>
               <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Color</p>
               <div style={{ display: 'flex', gap: '10px' }}>
                 {product.colors.map(color => (
                   <button
                     key={color}
                     onClick={() => setSelectedColor(color)}
                     style={{
                       padding: '10px 20px',
                       border: selectedColor === color ? `1px solid ${themeColor}` : '1px solid #ddd',
                       backgroundColor: selectedColor === color ? themeColor : 'transparent',
                       color: selectedColor === color ? '#fff' : '#000',
                       cursor: 'pointer',
                       fontSize: '13px'
                     }}
                   >
                     {color}
                   </button>
                 ))}
               </div>
             </div>
           )}

           {product.sizes && product.sizes.length > 0 && (
             <div style={{ marginBottom: '40px' }}>
               <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Size</p>
               <div style={{ display: 'flex', gap: '10px' }}>
                 {product.sizes.map(size => (
                   <button
                     key={size}
                     onClick={() => setSelectedSize(size)}
                     style={{
                       width: '45px',
                       height: '45px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       border: selectedSize === size ? `1px solid ${themeColor}` : '1px solid #ddd',
                       backgroundColor: selectedSize === size ? themeColor : 'transparent',
                       color: selectedSize === size ? '#fff' : '#000',
                       cursor: 'pointer',
                       fontSize: '13px'
                     }}
                   >
                     {size}
                   </button>
                 ))}
               </div>
             </div>
           )}

           <button 
             onClick={handleAddToCart}
             style={{
             width: '100%',
             padding: '20px',
             backgroundColor: themeColor,
             color: '#ffffff',
             border: 'none',
             textTransform: 'uppercase',
             letterSpacing: '0.15em',
             cursor: 'pointer',
             fontSize: '14px',
             transition: 'opacity 0.3s'
           }}>
             Add to Cart
           </button>
         </div>
       </div>
    </div>
  )
}

export default ProductPage
