import React, { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { supabase } from '../lib/supabase'

function AdminDashboard() {
  const [components, setComponents] = useState([])
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (currentPage) {
      loadPageComponents()
    }
  }, [currentPage])

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at')

      if (error) throw error
      
      setPages(data || [])
      
      // Set home page as default current page
      const homePage = data.find(page => page.is_home)
      if (homePage) {
        setCurrentPage(homePage)
      } else if (data.length > 0) {
        setCurrentPage(data[0])
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPageComponents = async () => {
    if (!currentPage) return
    
    try {
      const { data, error } = await supabase
        .from('page_components')
        .select('*, navigation_links(*)')
        .eq('page_id', currentPage.id)
        .order('position')

      if (error) throw error
      setComponents(data || [])
    } catch (error) {
      console.error('Error loading components:', error)
    }
  }

  const addComponent = async (type) => {
    if (!currentPage) return
    
    try {
      console.log('Adding component:', type)
      
      // Get the true next position from the database to avoid conflicts
      const { data: maxPosData, error: maxPosError } = await supabase
        .from('page_components')
        .select('position')
        .eq('page_id', currentPage.id)
        .order('position', { ascending: false })
        .limit(1)

      if (maxPosError) throw maxPosError

      const nextPosition = (maxPosData && maxPosData.length > 0) 
        ? maxPosData[0].position + 1 
        : 0

      console.log('Calculated next position:', nextPosition)

      const config = getDefaultConfig(type)
      console.log('Component config:', config)

      const { data, error } = await supabase
        .from('page_components')
        .insert([{
          page_id: currentPage.id,
          type: type,
          config: config,
          position: nextPosition
        }])
        .select('*, navigation_links(*)')
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      
      console.log('Component added successfully:', data)

      // Always reload components to ensure consistency and correct ordering
      await loadPageComponents()

    } catch (error) {
      console.error('Error adding component:', error)
      alert(`Failed to add component: ${error.message}`)
    }
  }

  const addDefaultNavigationLinks = async (componentId) => {
    // Deprecated: Navigation now uses pages table directly
    return
  }

  const getDefaultConfig = (type) => {
    const configs = {
      navigation: {
        backgroundColor: '#ffffff',
        logoText: 'LUXURY BRAND',
        logoSize: '28px',
        logoColor: '#000000',
        linkColor: '#111111',
        linkSize: '13px',
        linkWeight: '400'
      },
      hero: {
        backgroundColor: '#f5f5f5',
        title: 'ELEGANCE REDEFINED',
        titleSize: '64px',
        titleColor: '#000000',
        subtitle: 'The new collection has arrived.',
        subtitleSize: '18px',
        subtitleColor: '#444444',
        ctaText: 'DISCOVER MORE',
        ctaBackgroundColor: '#000000',
        ctaTextColor: '#ffffff'
      },
      product_grid: {
        backgroundColor: '#ffffff',
        title: 'LATEST ARRIVALS',
        titleSize: '32px',
        titleColor: '#000000'
      },
      contact_form: {
        backgroundColor: '#ffffff',
        title: 'CONTACT US',
        titleSize: '32px',
        submitButtonText: 'SEND MESSAGE',
        emailPlaceholder: 'EMAIL ADDRESS',
        messagePlaceholder: 'YOUR MESSAGE'
      },
      cart: {
        backgroundColor: '#ffffff',
        title: 'SHOPPING BAG',
        emptyText: 'Your shopping bag is empty.'
      },
      footer: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        copyrightText: '© 2024 LUXURY BRAND. ALL RIGHTS RESERVED.'
      }
    }
    
    return configs[type] || {}
  }

  const moveComponent = async (dragIndex, hoverIndex) => {
    const draggedComponent = components[dragIndex]
    
    // Update positions locally for immediate UI feedback
    const newComponents = [...components]
    newComponents.splice(dragIndex, 1)
    newComponents.splice(hoverIndex, 0, draggedComponent)
    
    // Update positions in the array
    const updatedComponents = newComponents.map((comp, index) => ({
      ...comp,
      position: index
    }))
    
    setComponents(updatedComponents)
    
    // Update positions in the database
    try {
      for (const component of updatedComponents) {
        const { error } = await supabase
          .from('page_components')
          .update({ position: component.position })
          .eq('id', component.id)
        
        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating component positions:', error)
      // Revert on error
      loadPageComponents()
    }
  }

  const removeComponent = async (componentId) => {
    try {
      const { error } = await supabase
        .from('page_components')
        .delete()
        .eq('id', componentId)

      if (error) throw error
      
      setComponents(prev => prev.filter(comp => comp.id !== componentId))
    } catch (error) {
      console.error('Error removing component:', error)
    }
  }

  const createPage = async () => {
    const title = prompt('Enter page title:')
    if (!title) return

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          title,
          slug,
          is_home: false
        }])
        .select()
        .single()

      if (error) throw error
      
      setPages(prev => [...prev, data])
      setCurrentPage(data)
    } catch (error) {
      console.error('Error creating page:', error)
      alert(`Failed to create page: ${error.message}`)
    }
  }

  const deletePage = async (pageId, e) => {
    e.stopPropagation() // Prevent selecting the page while deleting
    
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId)

      if (error) throw error
      
      setPages(prev => prev.filter(p => p.id !== pageId))
      
      // If we deleted the current page, switch to home or first available
      if (currentPage?.id === pageId) {
        const homePage = pages.find(p => p.is_home && p.id !== pageId)
        setCurrentPage(homePage || pages.find(p => p.id !== pageId) || null)
      }
    } catch (error) {
      console.error('Error deleting page:', error)
      alert(`Failed to delete page: ${error.message}`)
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
        Loading admin dashboard...
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        {/* Sidebar with component tools */}
        <div style={{
          width: '300px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#1f2937',
            fontSize: '18px'
          }}>
            Component Tools
          </h3>
          
          <div>
            <h4 style={{ marginBottom: '12px', color: '#374151' }}>Drag & Drop Components</h4>
            
            <ComponentTool type="navigation" name="Navigation Bar" />
            <ComponentTool type="hero" name="Hero Section" />
            <ComponentTool type="product_grid" name="Product Grid" />
            <ComponentTool type="contact_form" name="Contact Form" />
            <ComponentTool type="cart" name="Shopping Cart" />
            <ComponentTool type="footer" name="Footer" />
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: '#374151' }}>Pages</h4>
              <button 
                onClick={createPage}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add
              </button>
            </div>

            {pages.map(page => (
              <div
                key={page.id}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '10px',
                  backgroundColor: currentPage?.id === page.id ? '#eff6ff' : 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{page.title} {page.is_home && '🏠'}</span>
                
                {!page.is_home && (
                  <button
                    onClick={(e) => deletePage(page.id, e)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0 4px'
                    }}
                    title="Delete Page"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main canvas area */}
        <div style={{ 
          flex: 1, 
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#1f2937',
              fontSize: '24px'
            }}>
              {currentPage?.title || 'No Page Selected'}
            </h2>
            <p style={{ 
              margin: '5px 0 0 0', 
              color: '#64748b',
              fontSize: '14px'
            }}>
              Drag components from the sidebar to build your page
            </p>
          </div>

          <CanvasArea 
            components={components} 
            pages={pages}
            onMoveComponent={moveComponent}
            onRemoveComponent={removeComponent}
            onAddComponent={addComponent}
          />
        </div>
      </div>
    </DndProvider>
  )
}

// Component Tool (Draggable item)
function ComponentTool({ type, name }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [type])

  return (
    <div
      ref={drag}
      className="component-tool"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
      }}>
        <span style={{ 
          padding: '4px 8px', 
          backgroundColor: '#eff6ff', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#1d4ed8'
        }}>
          {type}
        </span>
        <span style={{ fontSize: '14px', color: '#374151' }}>{name}</span>
      </div>
    </div>
  )
}

// Canvas Area (Drop target)
function CanvasArea({ components, pages, onMoveComponent, onRemoveComponent, onAddComponent }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item) => {
      // Add the component when dropped
      onAddComponent(item.type)
      return { name: 'canvas' }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), [onAddComponent])

  return (
    <div
      ref={drop}
      className={`canvas-area ${isOver ? 'drag-over' : ''}`}
      style={{
        minHeight: '500px',
        padding: '20px'
      }}
    >
      {components.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#64748b',
          padding: '100px 20px'
        }}>
          <h3>No components yet</h3>
          <p>Drag components from the sidebar to start building your page</p>
        </div>
      ) : (
        components.map((component, index) => (
          <CanvasComponent
            key={component.id}
            component={component}
            pages={pages}
            index={index}
            onMove={onMoveComponent}
            onRemove={onRemoveComponent}
          />
        ))
      )}
    </div>
  )
}

// Individual Canvas Component (Draggable and editable)
function CanvasComponent({ component, pages, index, onMove, onRemove }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'canvas-component',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [index])

  const [, drop] = useDrop(() => ({
    accept: 'canvas-component',
    hover: (item) => {
      if (item.index !== index) {
        onMove(item.index, index)
        item.index = index
      }
    }
  }), [index, onMove])

  const renderComponentPreview = () => {
    switch (component.type) {
      case 'navigation':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#ffffff',
            padding: '15px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ 
                fontSize: component.config.logoSize || '18px', 
                fontWeight: 'bold',
                color: component.config.logoColor || '#000000'
              }}>
                {component.config.logoText || 'Your Brand'}
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                {pages && pages.map(page => (
                  <span key={page.id} style={{
                    color: component.config.linkColor || '#374151',
                    fontSize: component.config.linkSize || '14px'
                  }}>
                    {page.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'hero':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#f8fafc',
            padding: '30px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '6px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              color: component.config.titleColor || '#1f2937',
              marginBottom: '10px'
            }}>
              {component.config.title || 'Hero Section'}
            </h3>
            <p style={{ 
              color: component.config.subtitleColor || '#64748b',
              marginBottom: '15px'
            }}>
              {component.config.subtitle || 'Your hero content will appear here'}
            </p>
          </div>
        )
      
      case 'product_grid':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#ffffff',
            padding: '20px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px'
          }}>
            <h4 style={{ 
              textAlign: 'center', 
              marginBottom: '15px',
              color: component.config.titleColor || '#1f2937'
            }}>
              {component.config.title || 'Product Grid'}
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '10px' 
            }}>
              {[1, 2].map(item => (
                <div key={item} style={{
                  backgroundColor: '#f1f5f9',
                  padding: '10px',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  Product {item}
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'footer':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#1f2937',
            color: component.config.textColor || '#ffffff',
            padding: '15px',
            textAlign: 'center',
            border: '1px solid #374151',
            borderRadius: '6px'
          }}>
            {component.config.copyrightText || 'Footer content'}
          </div>
        )

      case 'contact_form':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#ffffff',
            padding: '30px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: component.config.titleSize || '24px' }}>
              {component.config.title || 'Contact Us'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                disabled 
                placeholder={component.config.emailPlaceholder || 'Email'} 
                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <textarea 
                disabled 
                placeholder={component.config.messagePlaceholder || 'Message'} 
                rows={4}
                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <button disabled style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'not-allowed',
                alignSelf: 'flex-start'
              }}>
                {component.config.submitButtonText || 'Send'}
              </button>
            </div>
          </div>
        )

      case 'cart':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#f8fafc',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '6px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
              {component.config.title || 'Shopping Cart'}
            </h2>
            <div style={{ 
              padding: '40px', 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              color: '#64748b'
            }}>
              {component.config.emptyText || 'Your cart is empty'}
            </div>
          </div>
        )
      
      default:
        return <div>Unknown component type: {component.type}</div>
    }
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '15px',
        position: 'relative'
      }}
    >
      {renderComponentPreview()}
      
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => onRemove(component.id)}
          style={{
            padding: '4px 8px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Remove
        </button>
        <div
          className="drag-handle"
          style={{
            padding: '4px 8px',
            backgroundColor: '#6b7280',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'grab'
          }}
        >
          ⋮⋮
        </div>
      </div>
      
      <div style={{
        fontSize: '12px',
        color: '#64748b',
        marginTop: '5px',
        paddingLeft: '5px'
      }}>
        {component.type} (Position: {component.position})
      </div>
    </div>
  )
}

export default AdminDashboard