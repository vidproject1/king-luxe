import React, { useState, useEffect } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { supabase } from '../lib/supabase'
import ProductManager from './ProductManager'

const COMPONENT_VARIATIONS = {
  navigation: [
    { name: 'Standard', variant: 'default', config: {} },
    { name: 'Centered', variant: 'centered', config: { layout: 'centered' } },
    { name: 'Minimal', variant: 'minimal', config: { layout: 'minimal' } },
    { name: 'Dark', variant: 'dark', config: { backgroundColor: '#000000', logoColor: '#ffffff', linkColor: '#ffffff' } }
  ],
  hero: [
    { name: 'Standard', variant: 'default', config: {} },
    { name: 'Split Left', variant: 'split_left', config: { layout: 'split_left' } },
    { name: 'Full Height', variant: 'full_height', config: { minHeight: '100vh', alignItems: 'flex-end', textAlign: 'left' } },
    { name: 'Minimal', variant: 'minimal', config: { backgroundColor: '#ffffff', padding: '60px 20px' } }
  ],
  product_grid: [
    { name: 'Grid 4-Col', variant: 'default', config: { columns: 4 } },
    { name: 'Grid 3-Col', variant: 'grid_3', config: { columns: 3 } },
    { name: 'Masonry', variant: 'masonry', config: { layout: 'masonry' } },
    { name: 'Carousel', variant: 'carousel', config: { layout: 'carousel' } }
  ],
  contact_form: [
    { name: 'Standard', variant: 'default', config: {} },
    { name: 'Split Layout', variant: 'split', config: { layout: 'split' } },
    { name: 'Minimal', variant: 'minimal', config: { layout: 'minimal' } },
    { name: 'Boxed', variant: 'boxed', config: { layout: 'boxed', backgroundColor: '#f5f5f5', padding: '60px' } }
  ],
  footer: [
    { name: 'Standard', variant: 'default', config: {} },
    { name: 'Multi Column', variant: 'columns', config: { layout: 'columns' } },
    { name: 'Minimal', variant: 'minimal', config: { layout: 'minimal', padding: '40px 20px' } },
    { name: 'Light', variant: 'light', config: { backgroundColor: '#f5f5f5', textColor: '#000000', brandNameColor: '#000000' } }
  ]
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pages') // 'pages' or 'products'
  const [components, setComponents] = useState([])
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const [selectedComponentId, setSelectedComponentId] = useState(null)
  const [openSection, setOpenSection] = useState('navigation')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (currentPage) {
      loadPageComponents()
      setSelectedComponentId(null)
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
      
      // Merge with default config to ensure new fields appear
      const componentsWithDefaults = (data || []).map(comp => ({
        ...comp,
        config: {
          ...getDefaultConfig(comp.type),
          ...comp.config
        }
      }))

      setComponents(componentsWithDefaults)
    } catch (error) {
      console.error('Error loading components:', error)
    }
  }

  const addComponent = async (type, variant = 'default', configOverride = {}) => {
    if (!currentPage) return
    
    try {
      console.log('Adding component:', type, variant)
      
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

      const baseConfig = getDefaultConfig(type)
      const config = { ...baseConfig, ...configOverride, variant }
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
        backgroundImage: '',
        title: 'ELEGANCE REDEFINED',
        titleSize: '64px',
        titleColor: '#000000',
        subtitle: 'The new collection has arrived.',
        subtitleSize: '18px',
        subtitleColor: '#444444',
        ctaText: 'DISCOVER MORE',
        ctaBackgroundColor: '#000000',
        ctaTextColor: '#ffffff',
        overlayColor: '#ffffff',
        overlayOpacity: '80'
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
      footer: {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        brandName: 'LUXURY BRAND',
        brandNameColor: '#ffffff',
        socialLinks: 'Instagram, Facebook, Pinterest',
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
      if (selectedComponentId === componentId) {
        setSelectedComponentId(null)
      }
    } catch (error) {
      console.error('Error removing component:', error)
    }
  }

  const updateComponentConfig = async (componentId, newConfig) => {
    // Optimistic update
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, config: newConfig } : comp
    ))

    try {
      const { error } = await supabase
        .from('page_components')
        .update({ config: newConfig })
        .eq('id', componentId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating component config:', error)
      loadPageComponents()
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navigation Bar */}
      <div style={{
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '20px'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '20px' }}>Admin Dashboard</div>
        <button
          onClick={() => setActiveTab('pages')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'pages' ? '#000' : 'transparent',
            color: activeTab === 'pages' ? '#fff' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Page Builder
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'products' ? '#000' : 'transparent',
            color: activeTab === 'products' ? '#fff' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Product Inventory
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'products' ? (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <ProductManager />
          </div>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div style={{ 
              display: 'flex', 
              height: '100%',
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
            
            {Object.entries(COMPONENT_VARIATIONS).map(([type, variations]) => (
              <div key={type} style={{ marginBottom: '10px' }}>
                <div 
                  onClick={() => setOpenSection(openSection === type ? null : type)}
                  style={{
                    padding: '10px',
                    backgroundColor: openSection === type ? '#eff6ff' : '#f1f5f9',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '500',
                    color: '#1f2937',
                    textTransform: 'capitalize'
                  }}
                >
                  <span>{type.replace('_', ' ')}</span>
                  <span style={{ fontSize: '10px' }}>{openSection === type ? '▼' : '▶'}</span>
                </div>
                
                {openSection === type && (
                  <div style={{ padding: '10px 0 0 10px' }}>
                    {variations.map((variation, idx) => (
                      <ComponentTool 
                        key={idx}
                        type={type} 
                        name={variation.name} 
                        variant={variation.variant}
                        config={variation.config}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
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
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
          />
        </div>

        {/* Property Panel */}
        <PropertyPanel 
          component={components.find(c => c.id === selectedComponentId)}
          onUpdate={(newConfig) => updateComponentConfig(selectedComponentId, newConfig)}
        />
      </div>
    </DndProvider>
    )}
  </div>
</div>
)
}

// Component Tool (Draggable item)
function ComponentTool({ type, name, variant, config }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type, variant, config },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [type, variant, config])

  return (
    <div
      ref={drag}
      className="component-tool"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        padding: '8px 12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        marginBottom: '8px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6'
      }} />
      <span style={{ color: '#334155' }}>{name}</span>
    </div>
  )
}

// Canvas Area (Drop target)
function CanvasArea({ components, pages, onMoveComponent, onRemoveComponent, onAddComponent, selectedComponentId, onSelectComponent }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item) => {
      // Add the component when dropped
      onAddComponent(item.type, item.variant, item.config)
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
            isSelected={selectedComponentId === component.id}
            onSelect={() => onSelectComponent(component.id)}
          />
        ))
      )}
    </div>
  )
}

// Individual Canvas Component (Draggable and editable)
function CanvasComponent({ component, pages, index, onMove, onRemove, isSelected, onSelect }) {
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
    const variant = component.config.variant || 'default'

    switch (component.type) {
      case 'navigation':
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#ffffff',
            padding: '15px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: variant === 'centered' ? 'column' : 'row',
            justifyContent: variant === 'minimal' ? 'space-between' : (variant === 'centered' ? 'center' : 'space-between'),
            alignItems: 'center',
            gap: variant === 'centered' ? '15px' : '0'
          }}>
            <div style={{ 
              fontSize: component.config.logoSize || '18px', 
              fontWeight: 'bold',
              color: component.config.logoColor || '#000000'
            }}>
              {variant === 'minimal' ? '☰ ' : ''}{component.config.logoText || 'Your Brand'}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              {pages && pages.map(page => (
                <span key={page.id} style={{
                  color: component.config.linkColor || '#374151',
                  fontSize: component.config.linkSize || '14px',
                  display: variant === 'minimal' ? 'none' : 'block'
                }}>
                  {page.title}
                </span>
              ))}
            </div>
          </div>
        )
      
      case 'hero':
        const isSplit = variant === 'split_left'
        const isFull = variant === 'full_height'
        return (
          <div style={{
            backgroundColor: component.config.backgroundColor || '#f8fafc',
            padding: '30px',
            textAlign: isSplit ? 'left' : (variant === 'minimal' ? 'left' : 'center'),
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            display: isSplit ? 'flex' : 'block',
            alignItems: 'center',
            gap: '20px',
            minHeight: isFull ? '400px' : 'auto'
          }}>
            {isSplit && (
              <div style={{ width: '50%', height: '150px', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Image
              </div>
            )}
            <div style={{ flex: 1 }}>
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
          </div>
        )
      
      case 'product_grid':
        let gridStyle = {
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '10px'
        }
        if (variant === 'grid_3') gridStyle.gridTemplateColumns = 'repeat(3, 1fr)'
        if (variant === 'carousel') {
          gridStyle = { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }
        }

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
            <div style={gridStyle}>
              {[1, 2, 3].map(item => (
                <div key={item} style={{
                  backgroundColor: '#f1f5f9',
                  padding: '10px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  minWidth: variant === 'carousel' ? '120px' : 'auto',
                  aspectRatio: variant === 'masonry' && item % 2 === 0 ? '1/1.5' : '1/1'
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
            padding: '20px',
            textAlign: variant === 'columns' ? 'left' : 'center',
            border: '1px solid #374151',
            borderRadius: '6px',
            display: variant === 'columns' ? 'grid' : 'block',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px'
          }}>
            <div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                marginBottom: '10px',
                color: component.config.brandNameColor || component.config.textColor || '#ffffff'
              }}>
                {component.config.brandName || 'LUXURY BRAND'}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: variant === 'columns' ? 'flex-start' : 'center', 
                gap: '10px', 
                marginBottom: '10px',
                fontSize: '10px',
                opacity: 0.8,
                flexDirection: variant === 'columns' ? 'column' : 'row'
              }}>
                {(component.config.socialLinks || 'Instagram, Facebook').split(',').map(s => s.trim()).join(variant === 'columns' ? '' : ' • ')}
                {variant === 'columns' && (component.config.socialLinks || 'Instagram, Facebook').split(',').map(s => <div key={s}>{s}</div>)}
              </div>
            </div>
            {variant === 'columns' && (
               <>
                <div>
                   <h5 style={{marginBottom: '5px'}}>Shop</h5>
                   <div style={{fontSize: '10px', opacity: 0.7}}>New Arrivals<br/>Best Sellers<br/>Sale</div>
                </div>
                <div>
                   <h5 style={{marginBottom: '5px'}}>Support</h5>
                   <div style={{fontSize: '10px', opacity: 0.7}}>Contact<br/>Shipping<br/>Returns</div>
                </div>
               </>
            )}
            <div style={{ fontSize: '10px', opacity: 0.6, gridColumn: variant === 'columns' ? '1 / -1' : 'auto', marginTop: variant === 'columns' ? '10px' : '0' }}>
              {component.config.copyrightText || 'Footer content'}
            </div>
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
            margin: '0 auto',
            display: variant === 'split' ? 'flex' : 'block',
            gap: '20px'
          }}>
            {variant === 'split' && (
              <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: '20px' }}>
                <h3>Get in touch</h3>
                <p>We'd love to hear from you.</p>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '20px', fontSize: component.config.titleSize || '24px', display: variant === 'split' ? 'none' : 'block' }}>
                {component.config.title || 'Contact Us'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  disabled 
                  placeholder={component.config.emailPlaceholder || 'Email'} 
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
                {variant !== 'minimal' && (
                  <textarea 
                    disabled 
                    placeholder={component.config.messagePlaceholder || 'Message'} 
                    rows={4}
                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                )}
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
          </div>
        )
      
      default:
        return <div>Unknown component type: {component.type}</div>
    }
  }

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '15px',
        position: 'relative',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '4px',
        cursor: 'pointer'
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

function PropertyPanel({ component, onUpdate }) {
  const [uploading, setUploading] = useState(false)

  if (!component) {
    return (
      <div style={{
        width: '300px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e2e8f0',
        padding: '20px',
        color: '#64748b'
      }}>
        <p>Select a component to edit its properties</p>
      </div>
    )
  }

  const isColor = (key, value) => {
    const keyLower = key.toLowerCase()
    if (keyLower.includes('image')) return false
    return keyLower.includes('color') || keyLower.includes('background') || (typeof value === 'string' && value.startsWith('#'))
  }

  const isImage = (key) => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('image')
  }

  const isRange = (key) => {
    const keyLower = key.toLowerCase()
    return keyLower.includes('opacity')
  }

  const handleImageUpload = async (e, key) => {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `hero_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      onUpdate({ ...component.config, [key]: data.publicUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      width: '300px',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <h3 style={{ 
        marginBottom: '20px', 
        color: '#1f2937',
        fontSize: '18px',
        textTransform: 'capitalize'
      }}>
        Edit {component.type.replace('_', ' ')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {Object.entries(component.config).map(([key, value]) => (
          <div key={key}>
            <label style={{
              display: 'block', 
              fontSize: '12px', 
              marginBottom: '5px',
              color: '#4b5563',
              fontWeight: '500'
            }}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            
            {isColor(key, value) ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="color" 
                  value={value || '#000000'} 
                  onChange={e => onUpdate({...component.config, [key]: e.target.value})}
                  style={{
                    width: '40px',
                    height: '38px',
                    padding: '0',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input 
                  type="text" 
                  value={value || ''} 
                  onChange={e => onUpdate({...component.config, [key]: e.target.value})}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            ) : isRange(key) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={value || 80} 
                  onChange={e => onUpdate({...component.config, [key]: e.target.value})}
                  style={{ flex: 1, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', width: '35px', textAlign: 'right' }}>{value}%</span>
              </div>
            ) : isImage(key) ? (
              <div>
                <input 
                  type="text" 
                  value={value || ''} 
                  onChange={e => onUpdate({...component.config, [key]: e.target.value})}
                  placeholder="Image URL"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '5px'
                  }}
                />
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                   <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, key)}
                    style={{
                      fontSize: '12px'
                    }}
                  />
                  {uploading && <span style={{ fontSize: '10px', color: '#666' }}>Uploading...</span>}
                </div>
                {value && (
                  <div style={{ marginTop: '5px', height: '100px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            ) : (
              <input 
                type="text" 
                value={value || ''} 
                onChange={e => onUpdate({...component.config, [key]: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard