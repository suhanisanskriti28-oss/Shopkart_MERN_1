
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

const CartContext = createContext(null);

const API = "http://localhost:8089";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(async (url, options = {}) => {
    const response = await fetch(`${API}${url}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Cart request failed");
    }

    return data;
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await request("/cart");

      setCartItems(data.cart || []);
      return true;
    } catch (err) {
      setCartItems([]);
      setError(err.message || "Unable to load cart");
      return false;
    } finally {
      setLoading(false);
    }
  }, [request]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setError("");
    setLoading(false);
  }, []);

  const addToCart = useCallback(async (productId) => {
    try {
      setError("");

      const data = await request(`/cart/${productId}`, {
        method: "POST"
      });

      setCartItems(data.cart || []);
      return data;
    } catch (err) {
      setError(err.message || "Unable to add product to cart");
      throw err;
    }
  }, [request]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      setError("");

      const data = await request(`/cart/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity })
      });

      setCartItems(data.cart || []);
      return data;
    } catch (err) {
      setError(err.message || "Unable to update quantity");
      throw err;
    }
  }, [request]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      setError("");

      const data = await request(`/cart/${productId}`, {
        method: "DELETE"
      });

      setCartItems(data.cart || []);
      return data;
    } catch (err) {
      setError(err.message || "Unable to remove product");
      throw err;
    }
  }, [request]);

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;

    return sum + item.product.price * item.quantity;
  }, 0);

  const value = useMemo(() => ({
    cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    refreshCart,
    clearCart,
    addToCart,
    updateQuantity,
    removeFromCart
  }), [
    cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    refreshCart,
    clearCart,
    addToCart,
    updateQuantity,
    removeFromCart
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
