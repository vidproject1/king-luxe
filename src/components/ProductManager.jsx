import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ProductManager() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    theme_color: '#000000',
    images: '', // string input, split by comma
    colors: '', // string input, split by comma
    sizes: ''   // string input, split by comma
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        theme_color: formData.theme_color,
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
      }

      let error
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData])
        error = insertError
      }

      if (error) throw error

      await fetchProducts()
      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock || 0,
      theme_color: product.theme_color || '#000000',
      images: (product.images || []).join(', '),
      colors: (product.colors || []).join(', '),
      sizes: (product.sizes || []).join(', ')
    })
    setIsFormOpen(true)
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      theme_color: '#000000',
      images: '',
      colors: '',
      sizes: ''
    })
    setIsFormOpen(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Product Inventory</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Add New Product
        </button>
      </div>

      {isFormOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div style={{ 
            backgroundColor: '#fff', padding: '30px', borderRadius: '8px', 
            width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' 
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Product Title</label>
                  <input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Price ($)</label>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required 
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Category</label>
                <input 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Bags, Shoes, Accessories"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Theme Color (Hex)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    name="theme_color" 
                    type="color"
                    value={formData.theme_color} 
                    onChange={handleInputChange} 
                    style={{ width: '50px', height: '40px', padding: '0', border: '1px solid #ddd', cursor: 'pointer' }}
                  />
                  <input 
                    name="theme_color" 
                    value={formData.theme_color} 
                    onChange={handleInputChange} 
                    placeholder="#000000"
                    style={{ flex: 1, padding: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={4}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Images (comma separated URLs)</label>
                <input 
                  name="images" 
                  value={formData.images} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Colors (comma separated)</label>
                  <input 
                    name="colors" 
                    value={formData.colors} 
                    onChange={handleInputChange} 
                    placeholder="Red, Blue, Black"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Sizes (comma separated)</label>
                  <input 
                    name="sizes" 
                    value={formData.sizes} 
                    onChange={handleInputChange} 
                    placeholder="S, M, L, XL"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Stock Quantity</label>
                <input 
                  name="stock" 
                  type="number" 
                  value={formData.stock} 
                  onChange={handleInputChange} 
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{ padding: '10px 20px', border: 'none', background: '#000', color: 'white', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <div style={{ height: '200px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#ccc' }}>No Image</span>
              )}
            </div>
            <div style={{ padding: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>{product.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>${product.price}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleEdit(product)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #000', background: 'transparent', cursor: 'pointer', fontSize: '12px' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ff4444', color: '#ff4444', background: 'transparent', cursor: 'pointer', fontSize: '12px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          No products found. Click "Add New Product" to get started.
        </div>
      )}
    </div>
  )
}

export default ProductManager
