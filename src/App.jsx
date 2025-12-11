import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import MainPage from './components/MainPage'
import ProductPage from './components/ProductPage'

function NavigationButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <button 
        onClick={() => navigate(isAdmin ? '/' : '/admin')}
        style={{
          padding: '10px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        {isAdmin ? 'View Main Site' : 'Go to Admin'}
      </button>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/:slug" element={<MainPage />} />
          <Route path="/" element={<MainPage />} />
        </Routes>
        <NavigationButton />
      </div>
    </Router>
  )
}

export default App