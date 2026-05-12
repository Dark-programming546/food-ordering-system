import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        updateCartSummary(parsedCart);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartSummary(cart);
    }
  }, [cart, loading]);

  const updateCartSummary = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  // Add item to cart - NO TOAST HERE
  const addToCart = (item, restaurantId, restaurantName, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.menuItemId === item._id
      );

      let newCart;
      if (existingItemIndex >= 0) {
        newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
      } else {
        newCart = [...prevCart, {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          restaurantId: restaurantId,
          restaurantName: restaurantName,
          image: item.image
        }];
      }
      
      return newCart;
    });
  };

  // Remove item from cart - NO TOAST HERE (toast in Cart.jsx)
  const removeFromCart = (menuItemId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.menuItemId !== menuItemId);
      return newCart;
    });
  };

  // Update item quantity
  const updateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(menuItemId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Clear entire cart - WITH TOAST
  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  // Get cart summary for checkout
  const getCartSummary = () => {
    const subtotal = cartTotal;
    const deliveryFee = cart.length > 0 ? 3.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      itemCount: cartCount,
      restaurantName: cart[0]?.restaurantName || null,
      restaurantId: cart[0]?.restaurantId || null
    };
  };

  const value = {
    cart,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSummary
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};