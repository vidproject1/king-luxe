import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function MainPage() {
  const { slug } = useParams()
  const [pageData, setPageData] = useState(null)
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPageData()
  }, [slug])

  const loadPageData = async () => {
    try {
      setLoading(true)
      let query = supabase.from('pages').select('*')
      
      if (slug) {
        query = query.eq('slug', slug)
      } else {
        query = query.eq('is_home', true)
      }

      const { data: page, error: pageError } = await query.single()

      if (pageError) throw pageError

      // Get components for the page
      const { data: pageComponents, error: componentsError } = await supabase
        .from('page_components')
        .select('*, navigation_links(*)')
        .eq('page_id', page.id)
        .eq('is_active', true)
        .order('position')

      if (componentsError) throw componentsError

      setPageData(page)
      setComponents(pageComponents || [])
    } catch (error) {
      console.error('Error loading page data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderComponent = (component) => {
    switch (component.type) {
      case 'navigation':
        return <NavigationComponent config={component.config} links={component.navigation_links} />
      case 'hero':
        return <HeroComponent config={component.config} />
      case 'product_grid':
        return <ProductGridComponent config={component.config} />
      case 'contact_form':
        return <ContactFormComponent config={component.config} />
      case 'cart':
        return <CartComponent config={component.config} />
      case 'footer':
        return <FooterComponent config={component.config} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div className="main-page">
      {components.map(component => (
        <div 
          key={component.id}
          style={component.type === 'footer' ? { marginTop: 'auto' } : undefined}
        >
          {renderComponent(component)}
        </div>
      ))}
      
      {components.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 20px',
          color: '#64748b'
        }}>
          <h2>No content yet</h2>
          <p>Add components from the admin dashboard to build your page.</p>
        </div>
      )}
    </div>
  )
}

// Component implementations
function NavigationComponent({ config }) {
  const [pages, setPages] = useState([])

  useEffect(() => {
    const fetchPages = async () => {
      const { data } = await supabase
        .from('pages')
        .select('title, slug, is_home')
        .order('created_at')
      
      if (data) {
        setPages(data)
      }
    }
    fetchPages()
  }, [])

  return (
    <nav style={{
      backgroundColor: config.backgroundColor || '#ffffff',
      padding: config.padding || '30px 40px',
      borderBottom: '1px solid transparent'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: config.logoSize || '28px', 
          fontWeight: '400',
          color: config.logoColor || '#000000',
          fontFamily: "'Playfair Display', serif",
          letterSpacing: '0.05em'
        }}>
          {config.logoText || 'LUXURY BRAND'}
        </div>
        
        <div style={{ display: 'flex', gap: '40px' }}>
          {pages.map(page => (
            <a 
              key={page.slug || 'home'}
              href={page.is_home ? '/' : `/${page.slug}`}
              style={{
                textDecoration: 'none',
                color: config.linkColor || '#111111',
                fontSize: config.linkSize || '13px',
                fontWeight: config.linkWeight || '400',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              {page.title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

function HeroComponent({ config }) {
  return (
    <section style={{
      backgroundColor: config.backgroundColor || '#f5f5f5',
      padding: config.padding || '120px 20px',
      textAlign: config.textAlign || 'center',
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: config.titleSize || '64px',
          color: config.titleColor || '#000000',
          marginBottom: '24px',
          lineHeight: '1.1'
        }}>
          {config.title || 'ELEGANCE REDEFINED'}
        </h1>
        <p style={{
          fontSize: config.subtitleSize || '18px',
          color: config.subtitleColor || '#444444',
          marginBottom: '48px',
          fontFamily: "'Lato', sans-serif",
          fontWeight: '300',
          letterSpacing: '0.05em'
        }}>
          {config.subtitle || 'The new collection has arrived.'}
        </p>
        {config.ctaText && (
          <button style={{
            backgroundColor: config.ctaBackgroundColor || '#000000',
            color: config.ctaTextColor || '#ffffff',
            padding: '16px 40px',
            border: '1px solid #000000',
            borderRadius: '0',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}>
            {config.ctaText}
          </button>
        )}
      </div>
    </section>
  )
}

function ProductGridComponent({ config }) {
  return (
    <section style={{ 
      padding: config.padding || '100px 40px',
      backgroundColor: config.backgroundColor || '#ffffff'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: config.titleSize || '32px',
          color: config.titleColor || '#000000',
          marginBottom: '60px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {config.title || 'LATEST ARRIVALS'}
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }}>
          {/* Placeholder for products */}
          {[1, 2, 3, 4].map(item => (
            <div key={item} style={{
              backgroundColor: 'transparent',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{
                height: '400px',
                backgroundColor: '#f5f5f5',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                transition: 'opacity 0.3s ease'
              }}>
                Product Image
              </div>
              <h3 style={{ 
                marginBottom: '8px', 
                color: '#000000',
                fontSize: '16px',
                fontFamily: "'Lato', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Product Name {item}
              </h3>
              <p style={{ 
                color: '#444444', 
                fontSize: '14px',
                fontWeight: '300'
              }}>
                $1,200.00
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactFormComponent({ config }) {
  return (
    <section style={{
      backgroundColor: config.backgroundColor || '#ffffff',
      padding: config.padding || '100px 20px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: config.titleSize || '32px',
          color: config.titleColor || '#000000',
          marginBottom: '50px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {config.title || 'CONTACT US'}
        </h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <input 
            type="email" 
            placeholder={config.emailPlaceholder || 'EMAIL ADDRESS'}
            style={{
              padding: '16px',
              borderRadius: '0',
              border: '1px solid #e5e5e5',
              borderBottom: '1px solid #000000',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '0.05em',
              outline: 'none'
            }}
          />
          <textarea 
            placeholder={config.messagePlaceholder || 'YOUR MESSAGE'}
            rows={6}
            style={{
              padding: '16px',
              borderRadius: '0',
              border: '1px solid #e5e5e5',
              borderBottom: '1px solid #000000',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '0.05em',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          <button style={{
            backgroundColor: config.submitButtonColor || '#000000',
            color: config.submitButtonTextColor || '#ffffff',
            padding: '16px',
            border: 'none',
            borderRadius: '0',
            fontSize: '13px',
            fontWeight: '400',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginTop: '20px',
            width: '200px',
            alignSelf: 'center'
          }}>
            {config.submitButtonText || 'SEND MESSAGE'}
          </button>
        </form>
      </div>
    </section>
  )
}

function CartComponent({ config }) {
  return (
    <section style={{
      backgroundColor: config.backgroundColor || '#ffffff',
      padding: config.padding || '100px 20px',
      minHeight: '60vh'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '32px',
          color: '#000000',
          marginBottom: '60px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {config.title || 'SHOPPING BAG'}
        </h1>
        
        <div style={{
          backgroundColor: '#ffffff',
          padding: '60px',
          textAlign: 'center',
          border: '1px solid #f0f0f0'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#666666', 
            marginBottom: '30px',
            fontFamily: "'Lato', sans-serif",
            fontWeight: '300'
          }}>
            {config.emptyText || 'Your shopping bag is empty.'}
          </p>
          <button style={{
            marginTop: '10px',
            padding: '14px 30px',
            backgroundColor: '#000000',
            color: 'white',
            border: 'none',
            borderRadius: '0',
            cursor: 'pointer',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </section>
  )
}

function FooterComponent({ config }) {
  return (
    <footer style={{
      backgroundColor: config.backgroundColor || '#000000',
      color: config.textColor || '#ffffff',
      padding: config.padding || '80px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '24px', 
          marginBottom: '40px' 
        }}>
          LUXURY BRAND
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px', 
          marginBottom: '40px',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          <span>Instagram</span>
          <span>Facebook</span>
          <span>Pinterest</span>
        </div>
        <p style={{ 
          fontSize: '11px', 
          opacity: 0.6, 
          letterSpacing: '0.05em',
          fontFamily: "'Lato', sans-serif"
        }}>
          {config.copyrightText || '© 2024 LUXURY BRAND. ALL RIGHTS RESERVED.'}
        </p>
      </div>
    </footer>
  )
}

export default MainPage