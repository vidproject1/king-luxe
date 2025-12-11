import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Try to load cart from local storage
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from local storage:', error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Save cart to local storage whenever it changes
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to local storage:', error);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    setCart(prevCart => {
      // Check if item already exists with same ID, color, and size
      const existingItemIndex = prevCart.findIndex(item => 
        item.id === product.id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );

      if (existingItemIndex > -1) {
        // Update quantity if exists
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...prevCart, { 
          ...product, 
          quantity, 
          selectedColor, 
          selectedSize,
          addedAt: new Date().toISOString()
        }];
      }
    });
    setIsCartOpen(true); // Open cart when adding item
  };

  const removeFromCart = (itemId, selectedColor, selectedSize) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === itemId && item.selectedColor === selectedColor && item.selectedSize === selectedSize)
    ));
  };

  const updateQuantity = (itemId, selectedColor, selectedSize, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId, selectedColor, selectedSize);
      return;
    }
    setCart(prevCart => prevCart.map(item => 
      (item.id === itemId && item.selectedColor === selectedColor && item.selectedSize === selectedSize)
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartTotal, 
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
