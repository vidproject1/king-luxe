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
  const variant = config.variant || 'default'

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
        flexDirection: variant === 'centered' ? 'column' : 'row',
        justifyContent: variant === 'minimal' ? 'space-between' : (variant === 'centered' ? 'center' : 'space-between'),
        alignItems: 'center',
        gap: variant === 'centered' ? '30px' : '0'
      }}>
        <div style={{ 
          fontSize: config.logoSize || '28px', 
          fontWeight: '400',
          color: config.logoColor || '#000000',
          fontFamily: "'Playfair Display', serif",
          letterSpacing: '0.05em'
        }}>
          {variant === 'minimal' && <span style={{ marginRight: '15px', cursor: 'pointer' }}>☰</span>}
          {config.logoText || 'LUXURY BRAND'}
        </div>
        
        <div style={{ 
          display: variant === 'minimal' ? 'none' : 'flex', 
          gap: '40px' 
        }}>
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
  const variant = config.variant || 'default'
  const isSplit = variant === 'split_left'
  const isFull = variant === 'full_height'

  return (
    <section style={{
      backgroundColor: config.backgroundColor || '#f5f5f5',
      padding: config.padding || (isFull ? '0' : '120px 20px'),
      textAlign: isSplit ? 'left' : (variant === 'minimal' ? 'left' : (config.textAlign || 'center')),
      minHeight: isFull ? '100vh' : '70vh',
      display: 'flex',
      flexDirection: isSplit ? 'row' : 'column',
      alignItems: isSplit ? 'center' : (isFull ? 'flex-start' : 'center'),
      justifyContent: isFull ? 'flex-end' : 'center'
    }}>
      {isSplit && (
        <div style={{ flex: 1, height: '70vh', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#999' }}>Image Placeholder</span>
        </div>
      )}
      <div style={{ 
        maxWidth: '900px', 
        margin: isFull ? '0 0 100px 100px' : (isSplit ? '0 0 0 80px' : '0 auto'),
        flex: 1
      }}>
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
  const variant = config.variant || 'default'
  
  let gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px'
  }
  
  if (variant === 'grid_3') {
    gridStyle.gridTemplateColumns = 'repeat(3, 1fr)'
  }
  
  if (variant === 'carousel') {
    gridStyle = {
      display: 'flex',
      overflowX: 'auto',
      gap: '40px',
      paddingBottom: '20px'
    }
  }

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
        
        <div style={gridStyle}>
          {/* Placeholder for products */}
          {[1, 2, 3, 4].map(item => (
            <div key={item} style={{
              backgroundColor: 'transparent',
              textAlign: 'center',
              cursor: 'pointer',
              minWidth: variant === 'carousel' ? '300px' : 'auto',
              gridRow: variant === 'masonry' && item % 2 === 0 ? 'span 2' : 'span 1'
            }}>
              <div style={{
                height: variant === 'masonry' && item % 2 === 0 ? '600px' : '400px',
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
  const variant = config.variant || 'default'

  return (
    <section style={{
      backgroundColor: config.backgroundColor || '#ffffff',
      padding: config.padding || '100px 20px'
    }}>
      <div style={{ 
        maxWidth: variant === 'split' ? '1200px' : '700px', 
        margin: '0 auto',
        display: variant === 'split' ? 'flex' : 'block',
        gap: '60px'
      }}>
        {variant === 'split' && (
           <div style={{ flex: 1 }}>
             <h2 style={{ fontSize: '42px', marginBottom: '30px' }}>Get in Touch</h2>
             <p style={{ lineHeight: '1.6', color: '#666' }}>
               We are here to help you with any questions you may have. 
               Reach out to us and we'll respond as soon as we can.
             </p>
             <div style={{ marginTop: '40px' }}>
               <p><strong>Email:</strong> contact@luxurybrand.com</p>
               <p><strong>Phone:</strong> +1 (555) 123-4567</p>
             </div>
           </div>
        )}
        
        <div style={{ flex: 1 }}>
          <h2 style={{
            textAlign: variant === 'split' ? 'left' : 'center',
            fontSize: config.titleSize || '32px',
            color: config.titleColor || '#000000',
            marginBottom: '50px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: variant === 'split' ? 'none' : 'block'
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
            {variant !== 'minimal' && (
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
            )}
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
              alignSelf: variant === 'split' ? 'flex-start' : 'center'
            }}>
              {config.submitButtonText || 'SEND MESSAGE'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function CartComponent({ config }) {
  const variant = config.variant || 'default'
  
  return (
    <section style={{
      backgroundColor: config.backgroundColor || '#ffffff',
      padding: config.padding || '100px 20px',
      minHeight: '60vh',
      display: variant === 'sidebar' ? 'flex' : 'block',
      justifyContent: 'flex-end'
    }}>
      <div style={{ 
        maxWidth: variant === 'sidebar' ? '400px' : '1000px', 
        margin: variant === 'sidebar' ? '0' : '0 auto',
        width: '100%'
      }}>
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
  const socialLinks = config.socialLinks 
    ? config.socialLinks.split(',').map(s => s.trim())
    : ['Instagram', 'Facebook', 'Pinterest']
    
  const variant = config.variant || 'default'

  return (
    <footer style={{
      backgroundColor: config.backgroundColor || '#000000',
      color: config.textColor || '#ffffff',
      padding: config.padding || '80px 20px',
      textAlign: variant === 'columns' ? 'left' : 'center'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: variant === 'columns' ? 'grid' : 'block',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '40px'
      }}>
        <div style={{ gridColumn: variant === 'columns' ? 'span 1' : 'auto' }}>
          <div style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '24px', 
            marginBottom: '40px',
            color: config.brandNameColor || config.textColor || '#ffffff'
          }}>
            {config.brandName || 'LUXURY BRAND'}
          </div>
        </div>

        {variant === 'columns' && (
          <>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shop</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: '2', opacity: 0.7 }}>
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Accessories</li>
                <li>Sale</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: '2', opacity: 0.7 }}>
                <li>Our Story</li>
                <li>Sustainability</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', lineHeight: '2', opacity: 0.7 }}>
                <li>Contact Us</li>
                <li>Shipping</li>
                <li>Returns</li>
                <li>FAQ</li>
              </ul>
            </div>
          </>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: variant === 'columns' ? 'flex-start' : 'center', 
          gap: '30px', 
          marginBottom: '40px',
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          gridColumn: variant === 'columns' ? '1 / -1' : 'auto',
          marginTop: variant === 'columns' ? '40px' : '0',
          borderTop: variant === 'columns' ? '1px solid rgba(255,255,255,0.1)' : 'none',
          paddingTop: variant === 'columns' ? '40px' : '0'
        }}>
          {socialLinks.map((link, index) => (
            <span key={index} style={{ cursor: 'pointer' }}>{link}</span>
          ))}
        </div>
        <p style={{ 
          fontSize: '11px', 
          opacity: 0.6, 
          letterSpacing: '0.05em',
          fontFamily: "'Lato', sans-serif",
          gridColumn: variant === 'columns' ? '1 / -1' : 'auto'
        }}>
          {config.copyrightText || '© 2024 LUXURY BRAND. ALL RIGHTS RESERVED.'}
        </p>
      </div>
    </footer>
  )
}

export default MainPage