import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "cart";

export function CartProvider({ children }) {
  // Cart items live in app-level state so they survive
  // navigating between sidebar tabs. Mirrored to
  // localStorage so they also survive a page refresh.
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch {
      // Ignore storage errors (e.g. quota / private mode).
    }
  }, [cart]);

  // ==========================================
  // ADD TO CART
  // Returns true on success, or an error string.
  // ==========================================
  const addToCart = (product) => {
    const existingItem = cart.find(
      (item) => item.productId === product.productId
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        return "You cannot add more than the available stock.";
      }

      setCart(
        cart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );

      return true;
    }

    setCart([
      ...cart,
      {
        productId: product.productId,
        name: product.name,
        price: Number(product.price),
        unit: product.unit,
        quantity: 1,
        stockQuantity: product.stockQuantity,
      },
    ]);

    return true;
  };

  // ==========================================
  // UPDATE QUANTITY
  // Returns true on success, or an error string.
  // ==========================================
  const updateQuantity = (productId, quantity) => {
    const item = cart.find(
      (item) => item.productId === productId
    );

    if (!item) {
      return true;
    }

    if (quantity < 1) {
      removeFromCart(productId);
      return true;
    }

    if (quantity > item.stockQuantity) {
      return "Quantity cannot exceed available stock.";
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );

    return true;
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================
  const removeFromCart = (productId) => {
    setCart(
      cart.filter((item) => item.productId !== productId)
    );
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  const clearCart = () => {
    setCart([]);
  };

  // ==========================================
  // DERIVED TOTALS
  // ==========================================
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
